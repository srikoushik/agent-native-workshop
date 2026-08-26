import {
  dayPath,
  formatDayTitle,
  formatDayTitleShort,
  shiftDayKey,
  type DayKey,
} from "@shared/day";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router";

import { DayGrid } from "@/components/calendar/DayGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The day view. The day on show comes from `?date=` in the URL, so it
 * server-renders, survives a reload, is shareable, and is somewhere the agent
 * can send the user with the `navigate` action.
 */
export default function Day({ dayKey }: { dayKey: DayKey }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-3 sm:p-6">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="truncate text-base font-semibold tracking-tight sm:text-xl">
            <span className="sm:hidden">{formatDayTitleShort(dayKey)}</span>
            <span className="hidden sm:inline">{formatDayTitle(dayKey)}</span>
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 border border-border"
            >
              <Link
                to={dayPath(shiftDayKey(dayKey, -1))}
                aria-label="Previous day"
              >
                <IconChevronLeft className="size-4" />
              </Link>
            </Button>
            <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
              {dayKey}
            </span>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 border border-border"
            >
              <Link to={dayPath(shiftDayKey(dayKey, 1))} aria-label="Next day">
                <IconChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          <DayGrid dayKey={dayKey} />
        </CardContent>
      </Card>
    </div>
  );
}
