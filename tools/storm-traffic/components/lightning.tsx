"use client";
import { useEffect, useRef } from "react";
import assets from "@/lib/assets.json";

type Point = [number, number];
type Bolt = {
  trunk: Point[];
  forks: Point[][];
  born: number;
  life: number;
  width: number;
};

// Midpoint displacement: each pass splits every segment and pushes the new point sideways,
// with less push on every pass, which gives lightning its jagged, self-similar line.
function jag(a: Point, b: Point, spread: number, passes = 7): Point[] {
  let points: Point[] = [a, b];
  for (let pass = 0; pass < passes; pass++) {
    const next: Point[] = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1],
        [x2, y2] = points[i];
      const dx = x2 - x1,
        dy = y2 - y1,
        len = Math.hypot(dx, dy) || 1;
      const push = (Math.random() - 0.5) * spread;
      next.push([(x1 + x2) / 2 - (dy / len) * push, (y1 + y2) / 2 + (dx / len) * push], points[i]);
    }
    points = next;
    spread *= 0.52;
  }
  return points;
}

/** The capsule over the hero: glass shell, money inside and electricity drawn live across the whole capsule. */
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
      nextStrike = 0,
      w = 0,
      h = 0,
      scale = 1;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0;
    let bolts: Bolt[] = [];

    // The canvas fills the inside of the capsule (the long axis runs left to right before the 45° turn).
    const size = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      if (!w || !h) return;
      c.width = Math.round(w * ratio);
      c.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      scale = h / 230;
    };
    const resize = new ResizeObserver(size);
    resize.observe(c);
    size();

    // A point somewhere inside the pill shape, with a margin from the glass.
    const inside = (from = 0, to = 1): Point => {
      const px = w * (from + Math.random() * (to - from));
      const r = h / 2;
      const edge = Math.min(px, w - px);
      const half = edge < r ? Math.sqrt(Math.max(0, r * r - (r - edge) ** 2)) : r;
      return [px, h / 2 + (Math.random() * 2 - 1) * half * 0.82];
    };

    const strike = (now: number) => {
      // Mostly end to end along the capsule, sometimes a short jump across it.
      const across = Math.random() < 0.3;
      const a = across ? inside(0.15, 0.85) : inside(0, 0.22);
      const b = across ? [a[0] + (Math.random() - 0.5) * w * 0.35, Math.random() < 0.5 ? h * 0.06 : h * 0.94] as Point : inside(0.78, 1);
      const trunk = jag(a, b, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.42);
      const forks: Point[][] = [];
      const count = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const start = trunk[4 + Math.floor(Math.random() * (trunk.length - 8))];
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) + (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.7);
        const length = (0.12 + Math.random() * 0.28) * w;
        const end: Point = [start[0] + Math.cos(angle) * length, start[1] + Math.sin(angle) * length];
        const fork = jag(start, end, length * 0.5, 5);
        forks.push(fork);
        // Forks fork again, smaller.
        if (Math.random() < 0.6) {
          const s2 = fork[Math.floor(fork.length / 2)];
          const a2 = angle + (Math.random() - 0.5) * 1.4;
          const l2 = length * 0.45;
          forks.push(jag(s2, [s2[0] + Math.cos(a2) * l2, s2[1] + Math.sin(a2) * l2], l2 * 0.5, 4));
        }
      }
      bolts.push({ trunk, forks, born: now, life: 110 + Math.random() * 230, width: 0.8 + Math.random() * 0.6 });
    };

    const path = (points: Point[]) => {
      ctx.beginPath();
      points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    };
    // Three passes per line: a wide blue glow, a cyan body and a white-hot core.
    const glowLine = (points: Point[], alpha: number, width: number) => {
      path(points);
      ctx.shadowColor = "#0a6bff";
      ctx.shadowBlur = 26 * scale;
      ctx.strokeStyle = `rgba(20, 110, 255, ${0.45 * alpha})`;
      ctx.lineWidth = 9 * width * scale;
      ctx.stroke();
      ctx.shadowColor = "#3fd0ff";
      ctx.shadowBlur = 10 * scale;
      ctx.strokeStyle = `rgba(70, 200, 255, ${0.85 * alpha})`;
      ctx.lineWidth = 3.2 * width * scale;
      ctx.stroke();
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 4 * scale;
      ctx.strokeStyle = `rgba(240, 252, 255, ${alpha})`;
      ctx.lineWidth = 1.2 * width * scale;
      ctx.stroke();
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Faint plasma that crawls over the whole capsule between the strikes.
      for (let i = 0; i < 4; i++) {
        const a = inside(), b = inside();
        path(jag(a, b, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.5, 5));
        ctx.shadowColor = "#1f8bff";
        ctx.shadowBlur = 12 * scale;
        ctx.strokeStyle = "rgba(90, 190, 255, 0.22)";
        ctx.lineWidth = 1.1 * scale;
        ctx.stroke();
      }
      for (const bolt of bolts) {
        const t = (now - bolt.born) / bolt.life;
        // Bright at once, then flickering out (a re-strike now and then).
        const flicker = Math.random() < 0.12 ? 1 : 0.55 + Math.random() * 0.45;
        const alpha = Math.max(0, (1 - t) ** 0.6) * flicker;
        const mid = bolt.trunk[Math.floor(bolt.trunk.length / 2)];
        // The flash lights the inside of the capsule round the strike.
        const flash = ctx.createRadialGradient(mid[0], mid[1], 0, mid[0], mid[1], w * 0.55);
        flash.addColorStop(0, `rgba(60, 150, 255, ${0.32 * alpha})`);
        flash.addColorStop(1, "rgba(60, 150, 255, 0)");
        ctx.shadowBlur = 0;
        ctx.fillStyle = flash;
        ctx.fillRect(0, 0, w, h);
        bolt.forks.forEach((fork) => glowLine(fork, alpha * 0.7, bolt.width * 0.55));
        glowLine(bolt.trunk, alpha, bolt.width);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
    };

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

    function draw(now: number) {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden || paused || !w) return;
      const dt = Math.min(now - last || 16, 50);
      last = now;
      if (reduce) {
        // One still frame of electricity, no motion.
        if (!bolts.length) {
          strike(now);
          strike(now);
          bolts.forEach((b) => (b.life = Infinity));
          render(now);
        }
        return;
      }
      x += (tx - x) * (1 - Math.exp(-dt / 180));
      y += (ty - y) * (1 - Math.exp(-dt / 180));
      el.style.transform = `translate3d(${x * 28}px,${y * 24 + Math.sin(now / 900) * 7}px,0) rotateX(${-y * 6}deg) rotateY(${x * 7}deg)`;
      el.style.setProperty("--inner-x", `${x * 11}px`);
      el.style.setProperty("--inner-y", `${y * 9}px`);
      if (now >= nextStrike) {
        strike(now);
        if (Math.random() < 0.35) strike(now);
        nextStrike = now + 60 + Math.random() * 190;
      }
      bolts = bolts.filter((b) => now - b.born < b.life);
      render(now);
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
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
          <canvas ref={canvas} />
        </div>
        <div className="capsule-gloss" />
        <div className="capsule-seam" />
      </div>
    </div>
  );
}
