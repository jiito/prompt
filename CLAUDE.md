# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raycast extension called "prompt" that provides prompt templates for various use cases. The extension allows users to browse and copy prompt templates through Raycast's interface. The primary functionality includes:

- A dropdown to select between template types ("learning" and "paper")
- Dynamic loading of templates from files and inline definitions
- Copy-to-clipboard functionality for selected templates

## Development Commands

- `npm run dev` - Start Raycast development mode
- `npm run build` - Build the extension using `ray build`
- `npm run lint` - Run ESLint checks using `ray lint`
- `npm run fix-lint` - Auto-fix ESLint issues using `ray lint --fix`
- `npm run publish` - Publish to Raycast Store

## Architecture

### Core Structure
- Single command extension with one main view (`src/index.tsx`)
- Template system supporting two types: "learning" and "paper"
- File-based template loading for the "learning" template from `assets/learning_mode.txt`
- Inline template definition for the "paper" template

### Key Components
- **Main Command** (`src/index.tsx`): React component using Raycast's Form API
- **Template Management**: 
  - `loadLearningTemplate()` function handles file reading with caching
  - `PAPER_SUMMARY_TEMPLATE` constant for inline template
  - Template switching logic in dropdown onChange handler

### Template System
- Templates are loaded dynamically based on user selection
- Learning template is cached after first load to improve performance
- Error handling for file loading with toast notifications
- Templates support both text files and inline definitions

## File Structure
- `src/index.tsx` - Main extension logic and UI
- `assets/learning_mode.txt` - Learning mode prompt template
- `package.json` - Raycast extension configuration and dependencies
- `raycast-env.d.ts` - TypeScript environment definitions for Raycast

## Dependencies
- Built on Raycast API (`@raycast/api`, `@raycast/utils`)
- Uses React hooks for state management
- File system operations via Node.js `fs` module