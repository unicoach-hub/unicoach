// Click ripple for the site's action buttons (the styles live in index.css).
const ACTION = ':is(a, button):is([class*="bg-slate-900"], [class*="bg-black"], [class*="bg-[#111"], [class*="bg-[#0"], [class*="bg-[#1B1530]"], [class*="bg-[#DE5C2B]"], [class*="from-[#DE5C2B]"], [class*="from-orange-5"]):not([class*="absolute"], [class*="fixed"], .no-shine, :disabled)';

export const installButtonRipple = () => {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest?.(ACTION);
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement('span');
    dot.className = 'btn-ripple';
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${e.clientX - r.left - size / 2}px`;
    dot.style.top = `${e.clientY - r.top - size / 2}px`;
    btn.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
  }, { passive: true });
};
