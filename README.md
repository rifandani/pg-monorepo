# AI Monorepo

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/rifandani/pg-monorepo)

## 🎯 Todo

- [ ] merge this repo and `ai-monorepo`
- [ ] Consider using Bun `catalog` to manage monorepo dependencies (waiting for bun updates, to support updating catalog when running `bun update --latest`)
- [ ] create [`AGENTS.md`](https://agents.md/) file in root dir and subpackage inside monorepo

## 📝 Note

~

## 📦 Prerequisite

- Node >=24.7.0
- Bun >=1.2.21

## 🛠️ Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun bump-deps` to check for outdated dependencies, then run `bun install` to install it
- Run `bun <app_name> test` to run tests
- Run `bun <app_name> build` to build with development env
- Run `bun lint-typecheck` for linting and type checking

## 📱 Apps

### @workspace/oidc

[See here](./apps/oidc/README.md)

## 📦 Packages

### @workspace/core

[See here](./packages/core/README.md)

### @workspace/typescript-config

[See here](./packages/typescript-config/README.md)
