import {
  actionErrorMessage,
  useActionMutation,
} from "@agent-native/core/client/hooks";
import type { Task } from "@shared/api";
import { formatDayTitle, type DayKey } from "@shared/day";
import { useEffect } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Confirms before a task goes. Deletion is permanent and a task chip is a
 * small target, so a mis-tap must not be destructive on its own.
 *
 * The task doubles as the open/closed state — a task means "confirming this
 * one", null means closed — so there is no second boolean to keep in step.
 */
export function DeleteTaskDialog({
  dayKey,
  task,
  onClose,
}: {
  dayKey: DayKey;
  task: Task | null;
  onClose: () => void;
}) {
  const deleteTask = useActionMutation("delete-task", { method: "DELETE" });

  // A failure from one task should not greet the next one opened.
  useEffect(() => {
    if (task) deleteTask.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const confirm = (event: React.MouseEvent) => {
    // Radix closes on Action click by default; hold it open until the delete
    // actually lands so a failure stays visible instead of flashing past.
    event.preventDefault();
    if (!task || deleteTask.isPending) return;
    deleteTask.mutate({ id: task.id }, { onSuccess: onClose });
  };

  return (
    <AlertDialog
      open={task !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogTitle className="text-base">
          Delete “{task?.title}”?
        </AlertDialogTitle>
        <AlertDialogDescription>
          {task ? `${formatDayTitle(dayKey)} at ${task.time}` : ""}
        </AlertDialogDescription>
        {deleteTask.isError && (
          <p role="alert" className="text-sm text-destructive">
            {actionErrorMessage(deleteTask.error) ??
              "Could not delete the task."}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <AlertDialogCancel disabled={deleteTask.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={deleteTask.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteTask.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
