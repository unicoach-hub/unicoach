import { useEffect, useRef } from 'react';

// The dotted world map on the final CTA. Its dots fly apart and regroup into UniCoach shapes
// (the name, a plane, a mentor's face, "12K+ Students", a graduation cap), back to the map in between, on a loop.
// Visitors can play with it: dots move away from the cursor and light up, and a click blasts them outward.
// Everything is drawn in the map's own 1000 x 378 space and scaled to the element.
const W = 1000;
const H = 378;
const HOLD_MS = { map: 3200, other: 2600, mentor: 3400 };
const MOVE_MS = 1900;
const MAP_ALPHA = 0.22;
const SHAPE_ALPHA = 0.85;
const FONT = 'Outfit, "Helvetica Neue", Arial, sans-serif';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Dots of anything drawn on a 1000 x 378 canvas, at most `max` of them.
// `alphaAt(x, y)` can give each dot its own brightness (used for the mentor portrait).
const sampleShape = (draw, max, alphaAt) => {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  draw(ctx);
  const { data } = ctx.getImageData(0, 0, W, H);
  for (let step = 7; step < 30; step += 0.5) {
    const pts = [];
    for (let y = step / 2; y < H; y += step) {
      for (let x = step / 2; x < W; x += step) {
        if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128) {
          pts.push({ x, y, a: alphaAt ? alphaAt(x, y) : SHAPE_ALPHA });
        }
      }
    }
    if (pts.length <= max) return pts;
  }
  return [];
};

const drawText = (lines) => (ctx) => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach(({ text, size, y, weight = 900 }) => {
    ctx.font = `${weight} ${size}px ${FONT}`;
    ctx.fillText(text, W / 2, y);
  });
};

const drawName = drawText([{ text: 'UniCoach', size: 175, y: H / 2 + 6 }]);
const drawStudents = drawText([
  { text: '12K+', size: 190, y: 150 },
  { text: 'STUDENTS', size: 78, y: 300, weight: 800 },
]);

const drawPlane = (ctx) => {
  // A jet seen from above, nose to the upper right
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.35);
  ctx.beginPath();
  // Body
  ctx.ellipse(0, 0, 230, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings
  ctx.beginPath();
  ctx.moveTo(40, -20);
  ctx.lineTo(-70, -175);
  ctx.lineTo(-115, -175);
  ctx.lineTo(-40, -20);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(40, 20);
  ctx.lineTo(-70, 175);
  ctx.lineTo(-115, 175);
  ctx.lineTo(-40, 20);
  ctx.closePath();
  ctx.fill();
  // Tail
  ctx.beginPath();
  ctx.moveTo(-175, -10);
  ctx.lineTo(-235, -80);
  ctx.lineTo(-260, -80);
  ctx.lineTo(-215, 0);
  ctx.lineTo(-260, 80);
  ctx.lineTo(-235, 80);
  ctx.lineTo(-175, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawCap = (ctx) => {
  const cx = W / 2;
  ctx.beginPath();
  ctx.moveTo(cx, 40);
  ctx.lineTo(cx + 250, 130);
  ctx.lineTo(cx, 220);
  ctx.lineTo(cx - 250, 130);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 150, 175);
  ctx.lineTo(cx - 150, 280);
  ctx.quadraticCurveTo(cx, 345, cx + 150, 280);
  ctx.lineTo(cx + 150, 175);
  ctx.lineTo(cx, 228);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(cx, 130);
  ctx.lineTo(cx + 205, 160);
  ctx.lineTo(cx + 205, 285);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 205, 300, 22, 0, Math.PI * 2);
  ctx.fill();
};

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

// A mentor's face in dots (brightness from the photo) with their name and country beside it
const PORTRAIT = { cx: 270, cy: H / 2, r: 150 };
const mentorShape = (img, name, place, max) => {
  const pc = document.createElement('canvas');
  pc.width = W;
  pc.height = H;
  const pctx = pc.getContext('2d', { willReadFrequently: true });
  // Cover-fit the photo into the circle, a little zoomed on the face
  const side = Math.min(img.naturalWidth, img.naturalHeight) * 0.86;
  const sx = (img.naturalWidth - side) / 2;
  const sy = Math.max(0, (img.naturalHeight - side) * 0.25);
  pctx.drawImage(img, sx, sy, side, side, PORTRAIT.cx - PORTRAIT.r, PORTRAIT.cy - PORTRAIT.r, PORTRAIT.r * 2, PORTRAIT.r * 2);
  const photo = pctx.getImageData(0, 0, W, H).data;
  const px = (x, y) => {
    const i = (Math.floor(y) * W + Math.floor(x)) * 4;
    return [photo[i], photo[i + 1], photo[i + 2]];
  };
  const lumOf = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
  // The headshots sit on a plain colour: read it from the top corners of the square and fade it out
  const corners = [];
  for (let y = PORTRAIT.cy - PORTRAIT.r + 4; y < PORTRAIT.cy - PORTRAIT.r + 40; y += 6) {
    for (const x of [PORTRAIT.cx - PORTRAIT.r + 6, PORTRAIT.cx - PORTRAIT.r + 30, PORTRAIT.cx + PORTRAIT.r - 30, PORTRAIT.cx + PORTRAIT.r - 6]) corners.push(px(x, y));
  }
  const bg = [0, 1, 2].map((c) => corners.reduce((sum, p) => sum + p[c], 0) / corners.length);
  // Spread the person's light and dark across the full range so the face reads clearly
  let lo = 255;
  let hi = 0;
  const isPerson = (p) => Math.hypot(p[0] - bg[0], p[1] - bg[1], p[2] - bg[2]) > 48;
  for (let y = PORTRAIT.cy - PORTRAIT.r; y < PORTRAIT.cy + PORTRAIT.r; y += 4) {
    for (let x = PORTRAIT.cx - PORTRAIT.r; x < PORTRAIT.cx + PORTRAIT.r; x += 4) {
      const p = px(x, y);
      if (Math.hypot(x - PORTRAIT.cx, y - PORTRAIT.cy) < PORTRAIT.r && isPerson(p)) {
        lo = Math.min(lo, lumOf(p));
        hi = Math.max(hi, lumOf(p));
      }
    }
  }
  const span = Math.max(1, hi - lo);
  const inCircle = (x, y) => Math.hypot(x - PORTRAIT.cx, y - PORTRAIT.cy) < PORTRAIT.r;
  const portraitAlpha = (x, y) => {
    const p = px(x, y);
    if (!isPerson(p)) return 0.1;
    return 0.3 + 0.7 * Math.pow((lumOf(p) - lo) / span, 0.9);
  };
  return sampleShape((ctx) => {
    ctx.beginPath();
    ctx.arc(PORTRAIT.cx, PORTRAIT.cy, PORTRAIT.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${name.length > 6 ? 105 : 130}px ${FONT}`;
    ctx.fillText(name, 460, 150);
    ctx.font = `800 64px ${FONT}`;
    ctx.fillText(place.toUpperCase(), 464, 262);
  }, max, (x, y) => (inCircle(x, y) ? portraitAlpha(x, y) : SHAPE_ALPHA));
};

// Particle k of n goes to a target point; both sides ordered left to right so the move sweeps across
const assign = (targets, n) => {
  const sorted = [...targets].sort((a, b) => a.x - b.x || a.y - b.y);
  return Array.from({ length: n }, (_, k) => sorted[Math.floor((k * sorted.length) / n)]);
};

const DotMorph = ({ src, className, onPhase, mentors = [] }) => {
  const canvasRef = useRef(null);
  const onPhaseRef = useRef(onPhase);
  useEffect(() => { onPhaseRef.current = onPhase; }, [onPhase]);
  const mentorsKey = mentors.map((m) => m.src).join('|');

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    let visible = false;
    let observer;
    let resizeObserver;
    let cleanupPointer;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };

    (async () => {
      const svg = await fetch(src).then((r) => r.text()).catch(() => '');
      const map = [...svg.matchAll(/cx="([\d.]+)" cy="([\d.]+)"/g)].map((m) => ({ x: +m[1], y: +m[2], a: MAP_ALPHA }));
      if (cancelled || !map.length) return;
      try { await document.fonts?.load(`900 175px ${FONT}`); } catch { /* falls back to Helvetica/Arial */ }
      if (cancelled) return;

      const n = map.length;
      const make = (key, pts, hold = HOLD_MS.other) => (pts.length ? { key, pts: assign(pts, n), hold } : null);
      const mapShape = { key: 'map', pts: map, hold: HOLD_MS.map };
      const fixed = {
        name: make('name', sampleShape(drawName, n)),
        plane: make('plane', sampleShape(drawPlane, n)),
        students: make('students', sampleShape(drawStudents, n)),
        cap: make('cap', sampleShape(drawCap, n)),
      };
      // Mentor faces are built in the background; the loop uses whichever are ready
      const portraits = [];
      (async () => {
        for (const m of mentors) {
          const img = await loadImage(m.src);
          if (cancelled) return;
          if (!img) continue;
          try {
            const shape = make('mentor', mentorShape(img, m.name, m.place, n), HOLD_MS.mentor);
            if (shape) portraits.push(shape);
          } catch { /* skip a photo that can't be read */ }
        }
      })();

      // Between every shape the dots go back to the map
      const order = ['name', 'plane', 'students', 'cap'];
      let orderIndex = 0;
      let mentorIndex = 0;
      const nextShape = () => {
        for (let tries = 0; tries < order.length; tries += 1) {
          const key = order[orderIndex % order.length];
          orderIndex += 1;
          if (key === 'mentor') {
            if (portraits.length) return portraits[mentorIndex++ % portraits.length];
          } else if (fixed[key]) return fixed[key];
        }
        return fixed.name || mapShape;
      };

      // The map keeps its own order; other shapes are ordered left to right
      const mapOrder = map.map((p, i) => ({ ...p, i })).sort((a, b) => a.x - b.x || a.y - b.y);
      const rank = new Array(n);
      mapOrder.forEach((p, r) => { rank[p.i] = r; });
      const pointFor = (shape, k) => (shape.key === 'map' ? map[k] : shape.pts[rank[k]]);

      fit();
      const wobble = map.map(() => ({ a: (Math.random() - 0.5) * 90, b: (Math.random() - 0.5) * 60, d: Math.random() * 0.18 }));
      // Cursor play: dots near the pointer get pushed away and light up, then spring back
      const ox = new Float32Array(n);
      const oy = new Float32Array(n);
      const vx = new Float32Array(n);
      const vy = new Float32Array(n);
      const mouse = { x: -9999, y: -9999 };
      const REACH = 75;
      let flash = 0;
      const toMap = (e) => {
        const rect = canvas.getBoundingClientRect();
        const inside = e.clientX >= rect.left - 40 && e.clientX <= rect.right + 40 && e.clientY >= rect.top - 40 && e.clientY <= rect.bottom + 40;
        return inside ? { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H } : null;
      };
      const onMove = (e) => {
        const p = toMap(e);
        mouse.x = p ? p.x : -9999;
        mouse.y = p ? p.y : -9999;
      };
      const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
      // Click: every dot is blasted away from the click, harder the closer it is, then springs home
      let lastPos = null;
      const onDown = (e) => {
        const p = toMap(e);
        if (!p || !lastPos) return;
        if (e.target.closest?.('a, button, input, select, textarea, img')) return;
        for (let k = 0; k < n; k += 1) {
          const dx = lastPos[k * 2] - p.x;
          const dy = lastPos[k * 2 + 1] - p.y;
          const dist = Math.max(8, Math.hypot(dx, dy));
          const force = 34 * Math.max(0.15, 1 - dist / 520) * (0.7 + Math.random() * 0.6);
          vx[k] += (dx / dist) * force;
          vy[k] += (dy / dist) * force;
        }
        flash = 1;
      };
      if (!reduceMotion) {
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        cleanupPointer = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerdown', onDown);
          document.removeEventListener('pointerleave', onLeave);
        };
      }

      const draw = (from, to, t) => {
        const sx = canvas.width / W;
        const sy = canvas.height / H;
        if (!lastPos) lastPos = new Float32Array(n * 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        const r = 2.9 * sx;
        flash *= 0.93;
        for (let k = 0; k < n; k += 1) {
          const w = wobble[k];
          const local = Math.min(1, Math.max(0, (t - w.d) / (1 - w.d)));
          const e = easeInOut(local);
          const a = pointFor(from, k);
          const b = pointFor(to, k);
          const arc = Math.sin(Math.PI * e);
          const bx = a.x + (b.x - a.x) * e + w.a * arc;
          const by = a.y + (b.y - a.y) * e + w.b * arc;
          const dx = bx + ox[k] - mouse.x;
          const dy = by + oy[k] - mouse.y;
          const dist = Math.hypot(dx, dy);
          let glow = 0;
          if (dist < REACH && dist > 0.01) {
            const push = 1 - dist / REACH;
            vx[k] += (dx / dist) * push * 3.2;
            vy[k] += (dy / dist) * push * 3.2;
            glow = push;
          }
          vx[k] = (vx[k] - ox[k] * 0.06) * 0.86;
          vy[k] = (vy[k] - oy[k] * 0.06) * 0.86;
          ox[k] += vx[k];
          oy[k] += vy[k];
          const x = bx + ox[k];
          const y = by + oy[k];
          lastPos[k * 2] = x;
          lastPos[k * 2 + 1] = y;
          const moved = Math.min(1, Math.hypot(ox[k], oy[k]) / 30);
          const base = a.a + (b.a - a.a) * e;
          ctx.globalAlpha = Math.min(1, base + Math.max(glow, moved, flash * 0.5) * 0.7);
          ctx.beginPath();
          ctx.arc(x * sx, y * sy, r * (1 + moved * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };

      if (reduceMotion) {
        draw(mapShape, mapShape, 0);
        resizeObserver = new ResizeObserver(() => { fit(); draw(mapShape, mapShape, 0); });
        resizeObserver.observe(canvas);
        return;
      }

      let cur = mapShape;
      let next = null;
      let phaseStart = performance.now();
      let pausedAt = 0;
      const tick = (now) => {
        raf = requestAnimationFrame(tick);
        if (!visible) {
          if (!pausedAt) pausedAt = now;
          return;
        }
        if (pausedAt) { phaseStart += now - pausedAt; pausedAt = 0; }
        const elapsed = now - phaseStart;
        if (!next) {
          draw(cur, cur, 0);
          if (elapsed >= cur.hold) {
            next = cur.key === 'map' ? nextShape() : mapShape;
            phaseStart = now;
            if (cur.key === 'map') onPhaseRef.current?.('other');
          }
        } else {
          const t = Math.min(1, elapsed / MOVE_MS);
          draw(cur, next, t);
          if (t >= 1) {
            cur = next;
            next = null;
            phaseStart = now;
            if (cur.key === 'map') onPhaseRef.current?.('map');
          }
        }
      };
      observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.2 });
      observer.observe(canvas);
      resizeObserver = new ResizeObserver(fit);
      resizeObserver.observe(canvas);
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      cleanupPointer?.();
      resizeObserver?.disconnect();
    };
    // mentorsKey stands in for `mentors` so a new array with the same photos doesn't restart the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, mentorsKey]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
};

export default DotMorph;
