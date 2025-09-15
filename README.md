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

## 📂 File Storage

We are using [@aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3) as our file storage client.

### MinIO

We are using [MinIO](https://min.io/) which is an object storage server, compatible with Amazon S3 cloud storage service.
Run docker compose to start the [`bitnami/minio`](https://hub.docker.com/r/bitnami/minio) container.

To access the MinIO browser, you can visit `http://localhost:9001/`.
To login, use the following credentials that are defined in the `docker-compose.yml` file.

## 📊 Observability

We are using [OpenTelemetry](https://opentelemetry.io/) as our observability tool to collect metrics, traces, and logs.

Guidelines:

- Use `span.setAttributes` and `span.addEvent` most of the time, use `logger` only in places where you don't care about measuring the timing (e.g. global app error handler), or when you want to emphasize and save some important information / state changes.
- When we pass in `experimental_telemetry.functionId` to the `ai` SDK v4, it's not used as the span name, but rather it will be set as span attributes `resource.name`.
- Use logger from `@workspace/core/utils/logger` to normally `console.log` that works in browser and server.
- Use logger from `@/core/utils/logger` to log telemetry data that works in server ONLY.
- Do not log using `diag` from `@opentelemetry/api` because we only use it for internal otel logs.
- Instrument server-side code only.

### Grafana

We are using [Grafana](https://grafana.com/) as our observability backend to display the traces, metrics, and logs.
Run docker compose to start the [`grafana/otel-lgtm`](https://github.dev/grafana/docker-otel-lgtm/) container. This will spin up a OpenTelemetry backend including [Prometheus](https://grafana.com/docs/grafana/latest/datasources/prometheus/) (metrics database), [Tempo](https://grafana.com/docs/grafana/latest/datasources/tempo/) (traces database), [Loki](https://grafana.com/docs/grafana/latest/datasources/loki/) (logs database), and [Pyroscope](https://grafana.com/docs/grafana/latest/datasources/pyroscope/) (profiling database).

To access the Grafana Dashboard for visualization, you can visit `http://localhost:3111`.
To login, use the following credentials:

- Username: `admin`
- Password: `admin`

## 📱 Apps

### @workspace/oidc

[See here](./apps/oidc/README.md)

## 📦 Packages

### @workspace/core

[See here](./packages/core/README.md)

### @workspace/typescript-config

[See here](./packages/typescript-config/README.md)
