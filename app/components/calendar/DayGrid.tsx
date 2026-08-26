import {
  buildDaySlots,
  DAY_ANCHOR_HOUR,
  slotKey,
  slotKeyAt,
  slotProgressAt,
  type DayKey,
} from "@shared/day";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SLOT_ATTR = "data-slot-key";

/**
 * The hour grid: a gutter of hour labels beside one row per 30-minute slot.
 *
 * Rows sit in normal flow rather than being absolutely positioned against a
 * pixel scale. A slot is therefore an ordinary box that can hold children, so
 * tasks land inside their slot and several in the same slot simply stack.
 */
export function DayGrid({ dayKey }: { dayKey: DayKey }) {
  const slots = useMemo(() => buildDaySlots(dayKey), [dayKey]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Time of day exists only in the browser: rendering it during SSR would
  // disagree with hydration, so it starts empty and fills in after mount.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const sync = () => setNow(new Date());
    sync();
    const timer = setInterval(sync, 60_000);
    return () => clearInterval(timer);
  }, []);

  // Null on any day that is not today, which is what hides the indicator.
  const nowSlot = now ? slotKeyAt(dayKey, now) : null;

  // Open on the part of the day the user cares about instead of at midnight.
  useEffect(() => {
    const anchor =
      slotKeyAt(dayKey, new Date()) ?? slotKey(dayKey, DAY_ANCHOR_HOUR, 0);
    gridRef.current
      ?.querySelector(`[${SLOT_ATTR}="${CSS.escape(anchor)}"]`)
      ?.scrollIntoView({ block: "start" });
  }, [dayKey]);

  return (
    <ScrollArea className="h-full">
      <div
        ref={gridRef}
        className="grid grid-cols-[3rem_1fr] pt-2 pb-6 sm:grid-cols-[4.5rem_1fr]"
      >
        {slots.map((slot) => (
          <Fragment key={slot.key}>
            <div className="relative">
              {slot.startsHour && (
                <time
                  dateTime={slot.key}
                  className="absolute end-2 top-0 -translate-y-1/2 font-mono text-[10px] leading-none tabular-nums text-muted-foreground sm:text-[11px]"
                >
                  {slot.label}
                </time>
              )}
            </div>
            <div
              {...{ [SLOT_ATTR]: slot.key }}
              className={cn(
                // `scroll-mt` keeps the hour label, which straddles the rule,
                // clear of the top edge when the grid opens on this slot.
                "relative h-7 scroll-mt-3 border-t sm:h-8",
                slot.startsHour
                  ? "border-border"
                  : "border-dashed border-border/60",
              )}
            >
              {nowSlot === slot.key && now && <NowIndicator at={now} />}
            </div>
          </Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}

/**
 * The current time, drawn across the slot it falls in. Offsetting within the
 * slot is what puts it on the exact minute — the grid itself only resolves to
 * 30 minutes, so a class-based position would snap to the slot edge.
 */
function NowIndicator({ at }: { at: Date }) {
  return (
    <div
      aria-hidden
      style={{ top: `${slotProgressAt(at) * 100}%` }}
      className="pointer-events-none absolute inset-x-0 z-10 h-px -translate-y-1/2 bg-destructive"
    >
      <span className="absolute start-0 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive" />
    </div>
  );
}
