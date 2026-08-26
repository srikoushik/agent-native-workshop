import { DAY_PARAM, formatDayTitle, resolveDayKey } from "@shared/day";
import { useLoaderData } from "react-router";

import Day from "@/pages/Day";

import type { Route } from "./+types/_app._index";

/**
 * Resolving the day on the server means the first byte of HTML already has the
 * right date in it, and the client renders the same string — no flash of
 * "today" before the requested day arrives.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  return { dayKey: resolveDayKey(searchParams.get(DAY_PARAM)) };
}

// Loader data is absent when the loader failed and the error boundary renders.
export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData ? formatDayTitle(loaderData.dayKey) : "Calendar" },
  ];
}

export default function IndexRoute() {
  const { dayKey } = useLoaderData<typeof loader>();
  return <Day dayKey={dayKey} />;
}
