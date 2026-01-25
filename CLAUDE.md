# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

A Chrome new tab page extension built with **WXT** (Web Extension Framework).
Replaces the default new tab page with a custom dashboard featuring bookmarks,
search, and API usage tracking.

**Tech Stack:** React 19, Tailwind CSS 4, shadcn/ui, webext-bridge, ahooks

## Common Commands

| Command              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `bun run dev`        | Start development server (loads unpacked extension in Chrome) |
| `bun run build`      | Build production extension                                    |
| `bun run zip`        | Create production ZIP for distribution                        |
| `bun run lint:fix`   | Fix linting issues with Biome                                 |
| `bun run type-check` | Run TypeScript type checking                                  |

## Architecture

**Extension Entry Points:**

- `entrypoints/newtab/` - New tab page (content script)
- `entrypoints/background.ts` - Service worker

**Communication Flow:** The new tab page and background script communicate via
`webext-bridge`:

- Messages are defined in `types/messages.ts` using `MessageType` enum
- Background handles API calls, cookie management, and timers
- Frontend sends requests and receives updates through the bridge

**webext-bridge Imports:**

- **New tab modules** (`entrypoints/newtab/*`): Use `"webext-bridge/options"`
  import
- **Background module** (`entrypoints/background.ts`): Use
  `"webext-bridge/background"` import
- **Content script modules** (`entrypoints/content/*`): Use
  `"webext-bridge/content-script"` import

**Message Communication Pattern:**

All message keys use `MessageType` enum from `@/types/messages`:

```typescript
import { MessageType } from "@/types/messages"

// Send
sendMessage(MessageType.GET_APP_CONFIG, null, "background")
sendMessage(MessageType.SAVE_APP_CONFIG, payload, "background")

// Receive
onMessage(MessageType.GET_APP_CONFIG, async () => { ... })
onMessage(MessageType.APP_CONFIG_UPDATED, () => { ... })
```

**Type Hints:** `types/webext-bridge.d.ts` extends `ProtocolMap` with type-safe
definitions for all message types.

**Key Components:**

- `App.tsx` - Main orchestrator, loads config and conditionally renders
  components
- `SettingsDrawer.tsx` - Settings panel with sub-components for each feature
- `lib/storage.ts` - WXT storage abstractions for persistent state

## Path Alias

The `@/*` alias maps to the project root (configured in `wxt.config.ts`).

## Linting

Uses Biome with:

- Double quotes, semicolons as needed
- Organize imports on save enabled
- Tailwind CSS directives supported

## Workflow

After completing a task, always run:

1. `bun run lint:fix` - Fix linting and format code
2. `bun run type-check` - Verify TypeScript types
