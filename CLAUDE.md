# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chrome new tab page extension built with **WXT** (Web Extension Framework). Replaces the default new tab page with a custom dashboard featuring bookmarks, search, and API usage tracking.

**Tech Stack:** React 19, Tailwind CSS 4, shadcn/ui, webext-bridge, ahooks

## Common Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (loads unpacked extension in Chrome) |
| `bun run build` | Build production extension |
| `bun run zip` | Create production ZIP for distribution |
| `bun run lint:fix` | Fix linting issues with Biome |
| `bun run type-check` | Run TypeScript type checking |

## Architecture

**Extension Entry Points:**
- `entrypoints/newtab/` - New tab page (content script)
- `entrypoints/background.ts` - Service worker

**Communication Flow:**
The new tab page and background script communicate via `webext-bridge`:
- Messages are defined in `types/messages.ts`
- Background handles API calls, cookie management, and timers
- Frontend sends requests and receives updates through the bridge

**Key Components:**
- `App.tsx` - Main orchestrator, loads config and conditionally renders components
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
