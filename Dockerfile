# The production image: Next 16's standalone server (node server.js) on Node 22, as a non-root user.
# Built on the owner's PC with Docker by the backend's deploy/20-frontend-staging.sh (no Cloud Build), for Cloud Run.
# Config comes only from the environment at run time: API_ORIGIN, SITE_ORIGIN, API_ID_TOKEN (and MOCK, MOCK_ORIGIN for a
# local run against the Prism mock). Nothing secret is built in.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
# Inside the image only, as the backend's Dockerfile: pnpm at package.json's packageManager version.
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Standalone output (next.config.ts reads NEXT_OUTPUT). Built without MOCK: production has no /api rewrite, the load
# balancer (or the staging proxy) routes /api/* to the backend.
ENV NEXT_OUTPUT=standalone
RUN pnpm build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
RUN groupadd --system app && useradd --system --gid app --no-create-home app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
# No public/ folder yet: when one is added, copy it here too (COPY --from=build /app/public ./public).
USER app
EXPOSE 8080
CMD ["node", "server.js"]
