import type { Task } from "@shared/api";
import {
  buildDaySlots,
  DAY_ANCHOR_HOUR,
  slotKey,
  slotKeyAt,
  slotKeyForTime,
  slotProgressAt,
  type DayKey,
  type DaySlot,
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
 * tasks land inside their slot and several in the same slot simply share it.
 */
export function DayGrid({
  dayKey,
  tasks,
  onSelectSlot,
}: {
  dayKey: DayKey;
  tasks: Task[];
  onSelectSlot: (slot: DaySlot) => void;
}) {
  const slots = useMemo(() => buildDaySlots(dayKey), [dayKey]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Grouped by containing slot rather than exact time, so a task at 09:15
  // shows up in the 09:00 row instead of nowhere at all.
  const tasksBySlot = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = slotKeyForTime(dayKey, task.time);
      const existing = grouped.get(key);
      if (existing) existing.push(task);
      else grouped.set(key, [task]);
    }
    return grouped;
  }, [tasks, dayKey]);

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
        {slots.map((slot) => {
          const slotTasks = tasksBySlot.get(slot.key);
          return (
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
                <button
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  aria-label={`Add a task at ${slot.label}`}
                  className="absolute inset-0 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                />
                {slotTasks && (
                  // Left inert so the whole row stays one target for adding.
                  // The next chapter makes each task its own button.
                  <div className="pointer-events-none absolute inset-y-px start-0 end-1 flex gap-px">
                    {slotTasks.map((task) => (
                      <TaskChip key={task.id} task={task} />
                    ))}
                  </div>
                )}
                {nowSlot === slot.key && now && <NowIndicator at={now} />}
              </div>
            </Fragment>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/**
 * One task inside its slot. Chips share the row width evenly, so a second task
 * at the same time narrows the first rather than hiding behind it.
 */
function TaskChip({ task }: { task: Task }) {
  return (
    <div
      title={`${task.time} · ${task.title}`}
      className="flex min-w-0 flex-1 items-center rounded-sm border border-border bg-secondary px-1.5"
    >
      <span className="truncate text-[11px] leading-none text-secondary-foreground">
        {task.title}
      </span>
    </div>
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
