import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@lordicon/react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(REDUCED_MOTION_QUERY).matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Animated icon with a declarative trigger.
 *
 * trigger:
 *   hover         play once on pointer enter
 *   group-hover   play once when the nearest [data-lordicon-group] ancestor is
 *                 hovered, so a whole button drives an icon sitting inside it
 *   click         play once on click (also fires the wrapped onClick)
 *   in-view       play once when scrolled into view
 *   loop          play continuously
 *   loop-on-hover play continuously while hovered, settle on leave
 *
 * Under prefers-reduced-motion only the self-starting triggers (loop,
 * loop-on-hover, in-view) are suppressed and pinned to a static final frame.
 * User-initiated triggers (hover, group-hover, click) still animate: they are
 * small, deliberate, and not the kind of unexpected motion the setting guards
 * against — suppressing those just makes the UI feel broken.
 */
export default function LordIcon({
  icon,
  size = 24,
  trigger = 'hover',
  colorize,
  label,
  className = '',
  onClick,
  ...rest
}) {
  const playerRef = useRef(null);
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const loops = trigger === 'loop' || trigger === 'loop-on-hover';
  const loopingRef = useRef(trigger === 'loop');

  // Motion the user asked for by pointing at it, vs. motion that starts itself.
  const userInitiated =
    trigger === 'hover' || trigger === 'group-hover' || trigger === 'click';
  const suppressed = reducedMotion && !userInitiated;

  // The Player attaches its "config_ready" listener after lottie has already
  // emitted it for inline animationData, so props.onReady never fires for
  // bundled icons. The ref is populated by the time this effect runs, so key
  // off that instead and treat onReady as a bonus signal.
  useEffect(() => {
    if (playerRef.current) setReady(true);
  }, []);

  const play = useCallback(() => {
    if (suppressed || !playerRef.current) return;
    playerRef.current.playFromBeginning();
  }, [suppressed]);

  // Pin self-starting icons to a static, fully-drawn frame.
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    if (suppressed) playerRef.current.goToLastFrame();
  }, [ready, suppressed]);

  // Continuous triggers start as soon as the player is ready.
  useEffect(() => {
    if (!ready || suppressed) return;
    loopingRef.current = trigger === 'loop';
    if (trigger === 'loop') play();
  }, [ready, suppressed, trigger, play]);

  // Play once on first intersection.
  useEffect(() => {
    if (trigger !== 'in-view' || !ready || suppressed) return undefined;
    const node = hostRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [trigger, ready, suppressed, play]);

  // Let an ancestor (a whole button or card) drive the icon.
  useEffect(() => {
    if (trigger !== 'group-hover' || !ready || suppressed) return undefined;
    const group = hostRef.current?.closest('[data-lordicon-group]');
    if (!group) return undefined;

    group.addEventListener('mouseenter', play);
    group.addEventListener('focusin', play);
    return () => {
      group.removeEventListener('mouseenter', play);
      group.removeEventListener('focusin', play);
    };
  }, [trigger, ready, suppressed, play]);

  const handleComplete = useCallback(() => {
    if (loops && loopingRef.current) play();
  }, [loops, play]);

  const handleEnter = useCallback(() => {
    if (trigger === 'hover') play();
    if (trigger === 'loop-on-hover') {
      loopingRef.current = true;
      play();
    }
  }, [trigger, play]);

  const handleLeave = useCallback(() => {
    if (trigger === 'loop-on-hover') loopingRef.current = false;
  }, [trigger]);

  const handleClick = useCallback(
    (event) => {
      if (trigger === 'click') play();
      onClick?.(event);
    },
    [trigger, play, onClick]
  );

  // Decorative by default; announced only when a label is supplied.
  const a11y = useMemo(
    () => (label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }),
    [label]
  );

  return (
    <span
      ref={hostRef}
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      {...a11y}
      {...rest}
    >
      <Player
        ref={playerRef}
        icon={icon}
        size={size}
        colorize={colorize}
        onReady={() => setReady(true)}
        onComplete={handleComplete}
      />
    </span>
  );
}
