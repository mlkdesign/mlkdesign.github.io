"use client";
import { useEffect, useRef } from "react";
import assets from "@/lib/assets.json";

/** Independent shell, money, texture and procedural electricity layers. */
export default function Lightning({ paused }: { paused: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = root.current!,
      hero = el.closest("section")!,
      c = canvas.current!,
      ctx = c.getContext("2d")!;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = media.matches,
      visible = true,
      frame = 0,
      last = 0,
      lastBolt = 0;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0;
    let bolts: { points: [number, number][]; born: number; life: number }[] =
      [];
    c.width = 780;
    c.height = 390;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || reduce || paused) return;
      const r = hero.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const reset = () => {
      tx = 0;
      ty = 0;
    };
    const changed = () => {
      reduce = media.matches;
      reset();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(hero);
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", reset);
    media.addEventListener("change", changed);
    function arc(now: number) {
      const start: [number, number] = [
        80 + Math.random() * 130,
        60 + Math.random() * 260,
      ];
      const end: [number, number] = [
        570 + Math.random() * 130,
        60 + Math.random() * 260,
      ];
      const points: [number, number][] = [start];
      for (let i = 1; i < 24; i++) {
        const p = i / 24;
        points.push([
          start[0] + (end[0] - start[0]) * p,
          start[1] + (end[1] - start[1]) * p + (Math.random() - 0.5) * 95,
        ]);
      }
      points.push(end);
      bolts.push({ points, born: now, life: 120 + Math.random() * 170 });
    }
    function draw(now: number) {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden || paused) return;
      const dt = Math.min(now - last || 16, 50);
      last = now;
      if (!reduce) {
        x += (tx - x) * (1 - Math.exp(-dt / 180));
        y += (ty - y) * (1 - Math.exp(-dt / 180));
        el.style.transform = `translate3d(${x * 28}px,${y * 24 + Math.sin(now / 900) * 7}px,0) rotateX(${-y * 6}deg) rotateY(${x * 7}deg)`;
        el.style.setProperty("--inner-x", `${x * 11}px`);
        el.style.setProperty("--inner-y", `${y * 9}px`);
      }
      if (reduce && lastBolt) return;
      if (
        (reduce && !lastBolt) ||
        now - lastBolt > (reduce ? 100000 : 160 + Math.random() * 160)
      ) {
        arc(now);
        lastBolt = now;
      }
      ctx.clearRect(0, 0, c.width, c.height);
      bolts = bolts.filter((b) => now - b.born < b.life);
      for (const b of bolts) {
        const alpha = reduce
          ? 0.5
          : Math.sin(((now - b.born) / b.life) * Math.PI);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        b.points.forEach(([px, py], i) =>
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py),
        );
        ctx.strokeStyle = "#0092ff";
        ctx.shadowColor = "#00bfff";
        ctx.shadowBlur = 24;
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.strokeStyle = "#ddfaff";
        ctx.lineWidth = 1.6;
        ctx.shadowBlur = 8;
        ctx.stroke();
        for (let j = 6; j < 20; j += 7) {
          let [bx, by] = b.points[j];
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + 23, by - 40);
          ctx.lineTo(bx + 9, by - 56);
          ctx.lineTo(bx + 48, by - 90);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      media.removeEventListener("change", changed);
    };
  }, [paused]);
  return (
    <div ref={root} className="capsule-magnet" aria-hidden="true">
      <div className="capsule-body">
        <div className="capsule-inside">
          <img className="capsule-money" src={assets.hero_imgMoney1} alt="" />
          <img
            className="electric-texture texture-a"
            src={assets.hero_img2210W018N0021337AP30133703}
            alt=""
          />
          <img
            className="electric-texture texture-b"
            src={assets.hero_img2210W018N0021337AP30133704}
            alt=""
          />
          <canvas ref={canvas} />
        </div>
        <div className="capsule-gloss" />
        <div className="capsule-seam" />
      </div>
    </div>
  );
}
