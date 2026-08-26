import { appPath } from "@agent-native/core/client/api-path";
import {
  AppProviders,
  createAgentNativeQueryClient,
} from "@agent-native/core/client/hooks";
import { getThemeInitScript } from "@agent-native/core/client/ui";
import { useState } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";

import stylesheet from "./global.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const THEME_INIT_SCRIPT = getThemeInitScript();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <link rel="icon" type="image/svg+xml" href={appPath("/favicon.svg")} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  // The QueryClient is only needed once you fetch from the browser with
  // `useActionQuery`. Page data loaded in a route `loader` never touches it.
  const [queryClient] = useState(() => createAgentNativeQueryClient());

  return (
    // isPublicPath renders without the ClientOnly gate, so the server streams
    // real markup instead of a spinner that waits for the whole JS bundle.
    <AppProviders
      queryClient={queryClient}
      isPublicPath
      toaster={null}
      documentTitleFallback="Agent Native Workshop"
    >
      <Outlet />
    </AppProviders>
  );
}

export { ErrorBoundary } from "@agent-native/core/client/ui";
