import { describe, expect, it } from "vitest";

import {
  buildDaySlots,
  dayPath,
  formatDayTitle,
  formatDayTitleShort,
  isDayKey,
  isTimeOfDay,
  resolveDayKey,
  shiftDayKey,
  slotKeyAt,
  slotKeyForTime,
  slotProgressAt,
  todayKey,
} from "./day.js";

describe("isDayKey", () => {
  it("accepts a well-formed day", () => {
    expect(isDayKey("2026-08-26")).toBe(true);
  });

  it("rejects days that do not exist", () => {
    // `Date` rolls these over rather than failing, so they must be caught here.
    expect(isDayKey("2026-02-31")).toBe(false);
    expect(isDayKey("2026-13-01")).toBe(false);
    expect(isDayKey("2026-00-10")).toBe(false);
  });

  it("accepts a real leap day and rejects a fake one", () => {
    expect(isDayKey("2028-02-29")).toBe(true);
    expect(isDayKey("2026-02-29")).toBe(false);
  });

  it("rejects anything that is not a YYYY-MM-DD string", () => {
    for (const value of [
      "",
      "today",
      "26-08-2026",
      "<script>",
      20260826,
      null,
    ]) {
      expect(isDayKey(value)).toBe(false);
    }
  });
});

describe("resolveDayKey", () => {
  it("passes a valid day through", () => {
    expect(resolveDayKey("2026-08-26")).toBe("2026-08-26");
  });

  it("falls back to today rather than throwing on junk", () => {
    expect(resolveDayKey("../../etc/passwd")).toBe(todayKey());
    expect(resolveDayKey(null)).toBe(todayKey());
  });
});

describe("shiftDayKey", () => {
  it("steps one day at a time", () => {
    expect(shiftDayKey("2026-08-26", 1)).toBe("2026-08-27");
    expect(shiftDayKey("2026-08-26", -1)).toBe("2026-08-25");
  });

  it("crosses month, year and leap-year boundaries", () => {
    expect(shiftDayKey("2026-08-31", 1)).toBe("2026-09-01");
    expect(shiftDayKey("2026-01-01", -1)).toBe("2025-12-31");
    expect(shiftDayKey("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("does not skip or repeat a day across a DST change", () => {
    // 29 March 2026 is when most of Europe springs forward.
    expect(shiftDayKey("2026-03-28", 1)).toBe("2026-03-29");
    expect(shiftDayKey("2026-03-29", 1)).toBe("2026-03-30");
  });
});

describe("formatDayTitle", () => {
  it("reads as the calendar header", () => {
    expect(formatDayTitle("2026-08-26")).toBe("Wednesday, 26 August");
    expect(formatDayTitleShort("2026-08-26")).toBe("Wed, 26 Aug");
  });
});

describe("dayPath", () => {
  it("pins an explicit day and leaves today bare", () => {
    expect(dayPath("2026-08-26")).toBe("/?date=2026-08-26");
    expect(dayPath(undefined)).toBe("/");
    expect(dayPath("nonsense")).toBe("/");
  });
});

describe("buildDaySlots", () => {
  const slots = buildDaySlots("2026-08-26");

  it("covers the whole day at 30-minute granularity", () => {
    expect(slots).toHaveLength(48);
    expect(slots[0]).toMatchObject({ key: "2026-08-26T00:00", label: "00:00" });
    expect(slots[47]).toMatchObject({
      key: "2026-08-26T23:30",
      label: "23:30",
    });
  });

  it("marks only the top of each hour", () => {
    expect(slots.filter((slot) => slot.startsHour)).toHaveLength(24);
    expect(slots[14]).toMatchObject({ label: "07:00", startsHour: true });
    expect(slots[15]).toMatchObject({ label: "07:30", startsHour: false });
  });

  it("gives every slot a unique key", () => {
    expect(new Set(slots.map((slot) => slot.key)).size).toBe(slots.length);
  });
});

describe("slotKeyAt", () => {
  it("rounds a moment down into its slot", () => {
    expect(slotKeyAt("2026-08-26", new Date(2026, 7, 26, 8, 14))).toBe(
      "2026-08-26T08:00",
    );
    expect(slotKeyAt("2026-08-26", new Date(2026, 7, 26, 8, 30))).toBe(
      "2026-08-26T08:30",
    );
    expect(slotKeyAt("2026-08-26", new Date(2026, 7, 26, 8, 59))).toBe(
      "2026-08-26T08:30",
    );
  });

  it("returns null when the moment belongs to another day", () => {
    expect(slotKeyAt("2026-08-26", new Date(2026, 7, 27, 8, 0))).toBeNull();
  });
});

describe("slotProgressAt", () => {
  it("measures how far a moment sits through its own slot", () => {
    expect(slotProgressAt(new Date(2026, 7, 26, 9, 0))).toBe(0);
    expect(slotProgressAt(new Date(2026, 7, 26, 9, 15))).toBe(0.5);
    expect(slotProgressAt(new Date(2026, 7, 26, 9, 30))).toBe(0);
    expect(slotProgressAt(new Date(2026, 7, 26, 9, 45))).toBe(0.5);
  });

  it("never reaches 1, so the line stays inside its slot", () => {
    for (let minute = 0; minute < 60; minute += 1) {
      const progress = slotProgressAt(new Date(2026, 7, 26, 9, minute));
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThan(1);
    }
  });
});

describe("isTimeOfDay", () => {
  it("accepts any 24-hour HH:mm", () => {
    for (const value of ["00:00", "09:15", "13:07", "23:59"]) {
      expect(isTimeOfDay(value)).toBe(true);
    }
  });

  it("rejects times that do not exist or are not HH:mm", () => {
    for (const value of [
      "24:00",
      "09:60",
      "9:15",
      "0915",
      "09:15:00",
      "",
      915,
      null,
    ]) {
      expect(isTimeOfDay(value)).toBe(false);
    }
  });
});

describe("slotKeyForTime", () => {
  it("puts a task on the slot boundary in that slot", () => {
    expect(slotKeyForTime("2026-08-26", "09:00")).toBe("2026-08-26T09:00");
    expect(slotKeyForTime("2026-08-26", "09:30")).toBe("2026-08-26T09:30");
  });

  it("rounds an off-grid time down into the slot containing it", () => {
    // Without this an agent-created 09:15 task would exist in the database and
    // appear in no slot on screen.
    expect(slotKeyForTime("2026-08-26", "09:15")).toBe("2026-08-26T09:00");
    expect(slotKeyForTime("2026-08-26", "09:29")).toBe("2026-08-26T09:00");
    expect(slotKeyForTime("2026-08-26", "09:59")).toBe("2026-08-26T09:30");
    expect(slotKeyForTime("2026-08-26", "00:01")).toBe("2026-08-26T00:00");
    expect(slotKeyForTime("2026-08-26", "23:59")).toBe("2026-08-26T23:30");
  });

  it("always names a slot the grid actually renders", () => {
    const rendered = new Set(
      buildDaySlots("2026-08-26").map((slot) => slot.key),
    );
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 1) {
        const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        expect(rendered.has(slotKeyForTime("2026-08-26", time))).toBe(true);
      }
    }
  });
});
