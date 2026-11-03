import assert from 'node:assert/strict';
const base='https://mlk-studio-requests.mlkdesignweb.workers.dev';
const health=await fetch(base+'/health'); assert.equal(health.status,200); console.log('health',await health.json());
const payload={name:'Integration Test',email:'test@example.com',details:'Synthetic request — must be rejected before delivery',token:'invalid-test-token'};
for(const [label,origin,data,expected] of [
 ['foreign origin','https://example.com',payload,403],
 ['invalid fields','https://mlkdesign.github.io',{},400],
 ['honeypot','https://mlkdesign.github.io',{...payload,website:'bot'},400],
 ['fake Turnstile token','https://mlkdesign.github.io',payload,403],
]){const r=await fetch(base+'/submit',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});console.log(label,r.status,await r.text());assert.equal(r.status,expected)}
const cors=await fetch(base+'/submit',{method:'OPTIONS',headers:{Origin:'https://mlkdesign.github.io','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'Content-Type'}});assert.equal(cors.status,204);assert.equal(cors.headers.get('Access-Control-Allow-Origin'),'https://mlkdesign.github.io');console.log('CORS preflight passed');
