import type { Greeting } from "@shared/api";

/**
 * The whole app, for now. The greeting comes from the `hello` action, fetched
 * in this route's `loader` — so it server-renders with the page. Replace it
 * with your first real screen.
 */
export default function Home({ greeting }: { greeting: Greeting }) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        {greeting.message}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Served by the <code className="font-mono">hello</code> action in{" "}
        <code className="font-mono">actions/hello.ts</code>. The same action is
        a tool the agent can call and a command you can run:{" "}
        <code className="font-mono">pnpm action hello --name "Ada"</code>.
      </p>
    </div>
  );
}
