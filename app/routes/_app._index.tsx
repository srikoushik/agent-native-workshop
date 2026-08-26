import { useLoaderData } from "react-router";

import Home from "@/pages/Home";

import type { Greeting } from "@shared/api";

export function meta() {
  return [{ title: "Welcome to Agent Native" }];
}

/**
 * Runs on the server during SSR, so the greeting is already in the first byte
 * of HTML — no placeholder, no client round trip.
 *
 * `loader` is a server-only export: React Router strips it (and this dynamic
 * import of the action) out of the browser bundle.
 */
export async function loader(): Promise<Greeting> {
  const { default: hello } = await import("../../actions/hello");
  return hello.run({});
}

export default function IndexRoute() {
  const greeting = useLoaderData<typeof loader>();
  return <Home greeting={greeting} />;
}
