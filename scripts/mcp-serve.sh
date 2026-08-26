#!/bin/sh
# Serves this app's actions to an external coding agent over MCP stdio.
#
# The only reason this wrapper exists is so the client configs beside it
# (`opencode.json`, `.mcp.json`) can be committed: the MCP proxy authenticates
# with ACCESS_TOKEN, which belongs in the gitignored .env and must never be
# written into a checked-in config. This reads it at spawn time instead.
#
# Values are extracted key by key rather than by sourcing .env, so a stray
# quote or backtick in an unrelated secret can't execute as shell.
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
env_file="$root/.env"

read_env() {
  [ -f "$env_file" ] || return 0
  sed -n "s/^$1=//p" "$env_file" | head -1
}

# Provision one with: pnpm exec agent-native mcp token
ACCESS_TOKEN=${ACCESS_TOKEN:-$(read_env ACCESS_TOKEN)}
if [ -z "$ACCESS_TOKEN" ]; then
  echo "mcp-serve: no ACCESS_TOKEN in $env_file — run 'pnpm exec agent-native mcp token'" >&2
  exit 1
fi
export ACCESS_TOKEN

# Without the full catalog the proxy exposes only the framework's own tools and
# this app's actions are invisible to the client.
export AGENT_NATIVE_MCP_FULL_CATALOG=${AGENT_NATIVE_MCP_FULL_CATALOG:-1}

# Actions scope every read and write to an owner. Locally AUTH_DISABLED makes
# every request dev@local.test; without this the proxy sends no user at all and
# every action fails with "Not authenticated".
export AGENT_NATIVE_OWNER_EMAIL=${AGENT_NATIVE_OWNER_EMAIL:-dev@local.test}

# Follows the dev server's pinned PORT so the two can never drift apart.
port=${PORT:-$(read_env PORT)}
exec "$root/node_modules/.bin/agent-native" mcp serve --port "${port:-8080}"
