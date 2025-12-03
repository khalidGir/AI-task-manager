
# Coding Standards

**Owner:** <name or team>
**Last Updated:** 2025-12-01
**Version:** 1.0

## 1. Introduction

This document outlines the coding standards and conventions for the AI Task Manager project. Adhering to these guidelines ensures code consistency, readability, and maintainability across the monorepo.

Our philosophy is to automate enforcement wherever possible. We use **ESLint** for code quality and style rules and **Prettier** for automated code formatting.

## 2. General Principles

- **Clarity over cleverness:** Write code that is easy for others to understand.
- **Consistency:** Adhere to the established patterns and styles in the existing codebase.
- **Simplicity (KISS):** Keep it simple. Avoid unnecessary complexity.
- **Single Responsibility Principle (SRP):** Each module, class, or function should have one, and only one, reason to change.

## 3. Monorepo and Naming Conventions

The project uses an `npm`-managed monorepo structure located in the `app/` directory.

- **Packages:** `frontend`, `backend`.
- **Directories:** `kebab-case` (e.g., `api-services`, `utility-hooks`).
- **Files:** `kebab-case` (e.g., `user-controller.ts`, `task-list.tsx`).
- **TypeScript Types/Interfaces:** `PascalCase` (e.g., `interface Task { ... }`).
- **Variables and Functions:** `camelCase` (e.g., `const userTasks = ...`, `function getUser() { ... }`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `const API_BASE_URL = '...'`).
- **React Components:** `PascalCase` (e.g., `function TaskCard() { ... }`).

## 4. TypeScript Best Practices

- **Strict Mode:** All packages should have `strict: true` enabled in their `tsconfig.json`.
- **Explicit Types:** Avoid `any`. Use `unknown` for values that are truly unknown and perform type checking.
- **Interfaces over Types:** Prefer `interface` for defining object shapes and `type` for unions, intersections, or primitives.
- **Non-null Assertion:** Avoid the non-null assertion operator (`!`). Use type guards or conditional checks instead.
- **Utility Types:** Leverage built-in utility types like `Partial`, `Pick`, `Omit`, and `Record`.

## 5. Frontend (React)

- **Functional Components:** Use functional components with Hooks exclusively.
- **Hooks:** Follow the rules of Hooks. Custom hooks should be prefixed with `use` (e.g., `useUserData`).
- **Component Structure:** Keep JSX readable. If a component's render logic becomes too complex, break it down into smaller components.
- **Props:** Use `PascalCase` for component props and destructure them in the function signature.
- **State Management:** For global state, use the established Zustand store. Local component state should be managed with `useState` or `useReducer`.

## 6. Backend (Node.js/Express)

- **Asynchronous Operations:** Use `async/await` for all asynchronous code. Avoid mixing with `.then()` chains where possible.
- **Error Handling:** Use a centralized error handling middleware. Controller actions should wrap logic in `try...catch` blocks or use an `express-async-handler` utility.
- **Environment Variables:** All configuration (database URLs, API keys, etc.) must be loaded from environment variables via a library like `dotenv`. Do not hardcode them.
- **API Responses:** Standardize API response formats. (Refer to `api-contracts.md`).
- **Modularity:** Structure the backend by feature (e.g., a `users` module containing `user.controller.ts`, `user.service.ts`, `user.routes.ts`).

## 7. Tooling & Automation

### Prettier (Code Formatting)

- **Integration:** Prettier is configured at the root of the monorepo and should be run automatically on save and before commits.
- **Configuration:** A `.prettierrc` file defines the formatting rules. Do not override these locally.
- **Command:** `npm run format`

### ESLint (Code Quality & Style)

- **Integration:** ESLint is configured for both the frontend and backend packages.
- **Configuration:** Each package has its own `.eslintrc.js` that extends a base configuration.
- **Command:** `npm run lint --workspaces`

### Commit Messages

- **Conventional Commits:** All commit messages should follow the Conventional Commits specification. This is not just a suggestion; it is used for automated versioning and changelog generation.
- **Format:** `<type>(<scope>): <subject>` (e.g., `feat(api): add user signup endpoint`, `fix(ui): correct button alignment`).
- **Common Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
