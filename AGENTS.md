# Repository Guidelines

## Project Structure & Module Organization

This desktop gacha tracker pairs React 18/TypeScript with Tauri 1 and Rust 2021. `src/components/` contains account and gacha views; `src/routes/`, `src/hooks/`, `src/interfaces/`, and `src/utilities/` organize navigation, shared logic, types, and backend calls. Translations live in `src/i18n/`; styles and bundled assets live in `src/assets/`. Game images reside in `public/images/`. Rust code in `src-tauri/src/` separates `gacha/` integrations, `storage/` persistence, `disk_cache/` parsing, and `commands.rs` IPC. Desktop configuration and icons live in `src-tauri/`.

## Build, Test, and Development Commands

Use Node.js 18+ and the repository's Yarn 3.5.1, plus Rust and platform prerequisites for Tauri. Run commands from the repository root:

- `yarn install`: install frontend dependencies.
- `yarn dev`: start the Vite frontend server.
- `yarn tauri:dev`: launch the desktop app with debug Rust logging.
- `yarn build`: type-check TypeScript and build frontend assets.
- `yarn tauri:build`: build the desktop application and bundles.
- `yarn lint` / `yarn lint:fix`: check or apply Prettier and ESLint rules.
- `cargo test --workspace`: run Rust tests.
- `cargo fmt --all -- --check` and `cargo clippy --workspace -- -D warnings`: check Rust formatting and lint warnings.

## Coding Style & Reliability

Follow existing two-space TypeScript indentation, double quotes, and semicolons; use Prettier, ESLint, and strict TypeScript checking. Use PascalCase component filenames, camelCase TypeScript functions, and snake_case Rust modules/functions. The `@/` alias resolves to `src/`.

Keep control flow simple, loops statically bounded, and functions focused within roughly 60 lines. Minimize variable scope, shared state, reference chains, macros, generated code, and dynamic dispatch. Prefer preallocated storage; avoid heap allocation after startup. Validate inputs, check operation results, propagate errors, and include two meaningful runtime assertions per function. Resolve warnings. Document unavoidable language/framework exceptions or explicit requirement conflicts near affected code or in change notes.

## Testing Guidelines

No frontend test runner or coverage threshold is configured. Add Rust unit tests beside affected modules using `#[cfg(test)]` and descriptive snake_case names. Run relevant checks above and manually verify affected account, fetch/import, and chart workflows in the desktop app.

## Commit & Pull Request Guidelines

History uses informal summaries and feature/version titles, sometimes with PR numbers; no consistent Conventional Commits pattern appears. Write concise, imperative summaries. PRs should explain behavior changes, link relevant issues, list validation results, and include screenshots for UI changes. Preserve unrelated working-tree edits.
