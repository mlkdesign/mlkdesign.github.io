import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
const valid = { name: 'Test Client', email: 'test@example.com', details: 'Synthetic integration test', token: 'fake-token', website: '' };
const env = { TURNSTILE_SECRET: 'test-only-secret', TELEGRAM_BOT_TOKEN: 'test-only-token', TELEGRAM_CHAT_ID: 'test-only-chat' };
const req = (data = valid, origin = 'https://mlkdesign.github.io', options = {}) => new Request('https://worker.example/submit', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data), ...options });
const ctx = () => ({ pending: [], waitUntil(p) { this.pending.push(p); } });
for (const [label, data, status] of [['missing fields', {}, 400], ['honeypot', {...valid, website:'spam'},400], ['invalid email', {...valid,email:'bad'},400], ['short details', {...valid,details:'tiny'},400], ['large field', {...valid,details:'x'.repeat(2501)},400], ['oversized body', {...valid,details:'x'.repeat(17000)},413], ['array body',[],400], ['null body',null,400]]) {
  test(label, async () => assert.equal((await worker.fetch(req(data),env,ctx())).status,status));
}
test('rejects foreign origins', async()=>assert.equal((await worker.fetch(req(valid,'https://evil.example'),env,ctx())).status,403));
test('CORS preflight',async()=>{const r=await worker.fetch(req(valid,undefined,{method:'OPTIONS',body:undefined}),env,ctx());assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://mlkdesign.github.io');});
test('missing secret fails closed',async()=>assert.equal((await worker.fetch(req(),{},ctx())).status,503));
test('rate limit blocks upstream requests',async()=>assert.equal((await worker.fetch(req(),{...env,REQUEST_LIMITER:{limit:async()=>({success:false})}},ctx())).status,429));
for (const [label, check] of [['invalid token',{success:false}],['wrong hostname',{success:true,hostname:'evil.example',action:'project_request'}],['wrong action',{success:true,hostname:'mlkdesign.github.io',action:'other'}]]) {
 test(label,async()=>{const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json(check)};try{assert.equal((await worker.fetch(req(),env,ctx())).status,403);assert.equal(calls,1)}finally{globalThis.fetch=original}});
}
for (const deliveryOk of [true,false]) test('delivery '+deliveryOk,async()=>{
 const original=globalThis.fetch;const calls=[];const context=ctx();
 globalThis.fetch=async(url,options)=>{calls.push([url,options]);if(url.includes('siteverify'))return Response.json({success:true,hostname:'mlkdesign.github.io',action:'project_request'});if(url.includes('formspree'))return Response.json({ok:deliveryOk},{status:deliveryOk?200:500});return Response.json({ok:true});};
 try {const r=await worker.fetch(req(),env,context);await Promise.all(context.pending);assert.equal(r.status,deliveryOk?200:502);assert.equal(calls.length,deliveryOk?3:2);if(deliveryOk){const telegram=JSON.parse(calls[2][1].body);assert.ok(telegram.text.includes(valid.email));assert.ok(!telegram.parse_mode);const form=JSON.parse(calls[1][1].body);assert.ok(!('token' in form));}}
 finally{globalThis.fetch=original;}
});
test('Telegram failure preserves Formspree acceptance',async()=>{const original=globalThis.fetch;const originalError=console.error;let logged=false;console.error=()=>{logged=true};globalThis.fetch=async(url)=>url.includes('siteverify')?Response.json({success:true,hostname:'mlkdesign.github.io',action:'project_request'}):url.includes('formspree')?Response.json({ok:true}):Response.json({ok:false},{status:500});try{const context=ctx();assert.equal((await worker.fetch(req(),env,context)).status,200);await Promise.all(context.pending);assert.ok(logged)}finally{globalThis.fetch=original;console.error=originalError}});
