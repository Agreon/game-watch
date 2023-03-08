FROM node:alpine AS deps
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm@7.25.1
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/shared/package.json lib/shared/package.json
COPY client/package.json client/package.json
RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    pnpm install --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM node:alpine AS builder
RUN npm i -g pnpm@7.25.1
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/shared lib/shared
COPY client/assets client/assets
COPY client/components client/components
COPY client/pages client/pages
COPY client/providers client/providers
COPY client/public client/public
COPY client/styles client/styles
COPY client/util client/util
COPY client/next-env.d.ts client/next-env.d.ts
COPY client/next.config.js client/next.config.js
COPY client/package.json client/package.json
COPY client/theme.ts client/theme.ts
COPY client/tsconfig.json client/tsconfig.json
COPY client/.env.local client/.env.local
COPY tsconfig.json tsconfig.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/lib/shared/node_modules ./lib/shared/node_modules

COPY sources/src sources/src

RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    pnpm --filter @game-watch/shared build && \
    pnpm --filter @game-watch/client build && \
    pnpm install --frozen-lockfile --prod --ignore-scripts --prefer-offline

FROM node:alpine AS runner
RUN npm i -g pnpm@7.25.1
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/client/next.config.js ./client/next.config.js
COPY --from=builder /app/client/public ./client/public
COPY --from=builder --chown=nextjs:nodejs /app/client/.next ./client/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/node_modules ./client/node_modules
COPY --from=builder /app/lib/shared/node_modules ./lib/shared/node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/client/package.json ./client/package.json

USER nextjs

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED 1

CMD ["pnpm", "--filter", "@game-watch/client", "start"]
