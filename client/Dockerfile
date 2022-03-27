FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
COPY lib/shared/package.json lib/shared/package.json
COPY client/package.json client/package.json
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
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
COPY client/.env client/.env
COPY tsconfig.json tsconfig.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/lib/shared/node_modules ./lib/shared/node_modules
RUN yarn workspace @game-watch/shared build && \
    yarn workspace @game-watch/client build && \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
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

CMD ["yarn", "workspace", "@game-watch/client", "start"]
