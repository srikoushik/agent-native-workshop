import {
  actionErrorMessage,
  useActionMutation,
} from "@agent-native/core/client/hooks";
import { formatDayTitle, type DayKey, type DaySlot } from "@shared/day";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * Names a task for the slot that was tapped.
 *
 * The slot doubles as the open/closed state — a slot means "creating here",
 * null means closed — so there is no second boolean to keep in step with it.
 */
export function CreateTaskDialog({
  dayKey,
  slot,
  onClose,
}: {
  dayKey: DayKey;
  slot: DaySlot | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const createTask = useActionMutation("create-task");

  // Each slot opens a fresh form; a title abandoned on one slot should not
  // reappear on the next.
  useEffect(() => {
    if (slot) {
      setTitle("");
      createTask.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot?.key]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!slot || !title.trim() || createTask.isPending) return;
    createTask.mutate(
      { title: title.trim(), day: dayKey, time: slot.label },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={slot !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-sm">
        <DialogTitle className="text-base">
          {slot ? `${formatDayTitle(dayKey)} at ${slot.label}` : ""}
        </DialogTitle>
        <form onSubmit={submit} className="grid gap-4">
          <Input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            maxLength={200}
            aria-label="Task"
          />
          {createTask.isError && (
            <p role="alert" className="text-sm text-destructive">
              {actionErrorMessage(createTask.error) ??
                "Could not add the task."}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createTask.isPending}
            >
              {createTask.isPending ? "Adding…" : "Add task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
