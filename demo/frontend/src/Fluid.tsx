import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type PointerEvent as RPointer,
  type KeyboardEvent,
} from "react";
import {
  motion,
  animate,
  useMotionValue,
  useReducedMotion,
  LayoutGroup,
} from "motion/react";
export const layoutSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 35,
};
export const sheetSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};
export function Press({
  children,
  onClick,
  className = "",
  disabled = false,
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}) {
  const reduce = useReducedMotion(),
    scale = useMotionValue(1);
  const release = () => {
    animate(scale, 1, reduce ? { duration: 0.15 } : layoutSpring);
  };
  return (
    <motion.button
      type="button"
      aria-label={label}
      className={className}
      disabled={disabled}
      style={{ scale }}
      onPointerDown={() => {
        if (!disabled && !reduce) scale.set(0.97);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
function SegmentButton({
  id,
  value,
  label,
  onChange,
  onKeyDown,
}: {
  id: string;
  value: string;
  label: ReactNode;
  onChange: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const reduce = useReducedMotion(),
    scale = useMotionValue(1);
  const release = () =>
    animate(scale, 1, reduce ? { duration: 0.15 } : layoutSpring);
  return (
    <motion.button
      role="tab"
      type="button"
      aria-selected={value === id}
      tabIndex={value === id ? 0 : -1}
      style={{ scale }}
      onPointerDown={() => {
        if (!reduce) scale.set(0.97);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onClick={onChange}
      onKeyDown={onKeyDown}
    >
      <span>{label}</span>
      {value === id && (
        <motion.i
          layoutId={reduce ? undefined : "glass-indicator"}
          initial={reduce ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={reduce ? { duration: 0.15 } : layoutSpring}
          className="glass-indicator"
        />
      )}
    </motion.button>
  );
}
export function Segments({
  id,
  value,
  items,
  onChange,
  label,
}: {
  id: string;
  value: string;
  items: { id: string; label: ReactNode }[];
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <LayoutGroup id={id}>
      <div className="segments" role="tablist" aria-label={label}>
        {items.map((it, i) => (
          <div className="segment-wrap" key={it.id}>
            <SegmentButton
              id={it.id}
              value={value}
              label={it.label}
              onChange={() => onChange(it.id)}
              onKeyDown={(e) => {
                let n = i;
                if (e.key === "ArrowRight") n = (i + 1) % items.length;
                else if (e.key === "ArrowLeft")
                  n = (i - 1 + items.length) % items.length;
                else if (e.key === "Home") n = 0;
                else if (e.key === "End") n = items.length - 1;
                else return;
                e.preventDefault();
                onChange(items[n].id);
                (
                  e.currentTarget.parentElement?.parentElement?.children[
                    n
                  ].querySelector("button") as HTMLElement
                )?.focus();
              }}
            />
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}
export function Card({
  children,
  className = "",
  focus = false,
  stage = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  focus?: boolean;
  stage?: boolean;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      layout={!reduce}
      className={"bento " + className + (focus ? " focused" : "")}
      animate={{
        opacity: stage && !focus ? 0.35 : 1,
        scale: reduce ? 1 : stage && !focus ? 0.98 : 1,
      }}
      transition={reduce ? { duration: 0.15 } : sheetSpring}
      onPointerDown={(e) => {
        if (onClick && !reduce) e.currentTarget.style.transform = "scale(.97)";
      }}
      onPointerUp={(e) => (e.currentTarget.style.transform = "")}
      onPointerCancel={(e) => (e.currentTarget.style.transform = "")}
      onClick={onClick}
    >
      {children}
    </motion.section>
  );
}
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
export function PhysicalTrack({
  min,
  max,
  value,
  onChange,
  onCommit,
  label,
  kind = "reserve",
  children,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
  label: string;
  kind?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion(),
    track = useRef<HTMLDivElement>(null),
    drag = useRef<{
      offset: number;
      last: number;
      time: number;
      velocity: number;
      start: number;
      pointer: number;
    } | null>(null);
  const position = useMotionValue(((value - min) / (max - min)) * 100),
    [active, setActive] = useState(false),
    emitted = useRef(value);
  useEffect(() => {
    if (value !== emitted.current && !drag.current) {
      position.stop();
      position.set(((value - min) / (max - min)) * 100);
      emitted.current = value;
    }
  }, [value, min, max, position]);
  const resistance = (p: number) => {
    const c = clamp(p, 0, 100),
      d = p - c;
    return reduce ? c : c + Math.sign(d) * 9 * (1 - Math.exp(-Math.abs(d) / 9));
  };
  const update = (e: RPointer<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointer || !track.current) return;
    const r = track.current.getBoundingClientRect(),
      raw = ((e.clientX - r.left - d.offset) / r.width) * 100,
      t = performance.now();
    d.velocity = (raw - d.last) / Math.max(1, t - d.time);
    d.last = raw;
    d.time = t;
    position.set(resistance(raw));
    const v = min + (clamp(raw, 0, 100) / 100) * (max - min);
    emitted.current = kind === "timeline" ? Math.round(v) : v;
    onChange(emitted.current);
  };
  const settle = (e: RPointer<HTMLDivElement>, cancel = false) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointer) return;
    let target = cancel
      ? d.start
      : clamp(
          d.last +
            (reduce || performance.now() - d.time > 80 ? 0 : d.velocity * 120),
          0,
          100,
        );
    target = Math.round(min + (target / 100) * (max - min));
    target = clamp(target, min, max);
    drag.current = null;
    setActive(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    emitted.current = target;
    onChange(target);
    onCommit?.(target);
    animate(
      position,
      ((target - min) / (max - min)) * 100,
      reduce ? { duration: 0 } : layoutSpring,
    );
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    let next = value;
    if (["ArrowRight", "ArrowUp"].includes(e.key)) next++;
    else if (["ArrowLeft", "ArrowDown"].includes(e.key)) next--;
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max;
    else return;
    e.preventDefault();
    next = clamp(Math.round(next), min, max);
    emitted.current = next;
    onChange(next);
    onCommit?.(next);
    animate(
      position,
      ((next - min) / (max - min)) * 100,
      reduce ? { duration: 0 } : layoutSpring,
    );
  };
  return (
    <div
      ref={track}
      className={"physical-track " + kind + (active ? " dragging" : "")}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={
        kind === "reserve"
          ? Math.round(value) + "%"
          : "Day " + (Math.round(value) + 1)
      }
      onKeyDown={key}
      onPointerDown={(e) => {
        if (e.button !== 0 || drag.current) return;
        position.stop();
        const r = e.currentTarget.getBoundingClientRect(),
          handleX = r.left + (position.get() / 100) * r.width,
          grab = Math.abs(e.clientX - handleX) < 25;
        drag.current = {
          offset: grab ? e.clientX - handleX : 0,
          last: position.get(),
          time: performance.now(),
          velocity: 0,
          start: ((value - min) / (max - min)) * 100,
          pointer: e.pointerId,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        setActive(true);
        update(e);
        if (drag.current) drag.current.velocity = 0;
      }}
      onPointerMove={update}
      onPointerUp={(e) => settle(e)}
      onPointerCancel={(e) => settle(e, true)}
    >
      {children}
      <div className="track-rail" />
      <motion.div
        className="track-progress"
        style={{ width: position.get() + "%" }}
      />
      <motion.div
        className="physical-cursor"
        style={{ left: usePercent(position) }}
      >
        <i />
        <span>
          {kind === "reserve"
            ? Math.round(value) + "%"
            : String(Math.round(value) + 1).padStart(2, "0")}
        </span>
      </motion.div>
    </div>
  );
}
import { useTransform, type MotionValue } from "motion/react";
function usePercent(v: MotionValue<number>) {
  return useTransform(v, (x) => x + "%");
}
