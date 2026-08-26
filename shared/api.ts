/**
 * Types shared by the server (actions) and the React app.
 * `@shared/*` resolves here from app code; server code imports it relatively.
 */

/** Result of the `hello` action — replace with your own domain types. */
export interface Greeting {
  message: string;
  /** ISO-8601 timestamp of when the greeting was produced. */
  generatedAt: string;
}

/** A task as the day view and the agent see it — no ownership columns. */
export interface Task {
  id: string;
  title: string;
  /** `YYYY-MM-DD`. */
  day: string;
  /** `HH:mm`, 24-hour. */
  time: string;
  /** ISO-8601 timestamp of when the task was created. */
  createdAt: string;
}
