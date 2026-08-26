import { createCoreRoutesPlugin } from "@agent-native/core/server";

import { envKeys } from "../lib/env-config.js";

export default createCoreRoutesPlugin({
  sseRoute: "/_agent-native/sse",
  envKeys,
  // Deep links (`/_agent-native/open?app=&view=…`) resolve to real SPA paths.
  // The home screen renders at the root route, so map `home` to `/`.
  // Unknown views fall back to the framework default.
  resolveOpenPath: ({ view }) => (view === "home" ? "/" : null),
});
