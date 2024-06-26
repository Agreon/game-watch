FROM node:20-slim
RUN apt-get update && \
    apt-get install -y git --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

RUN npm i -g pnpm@9.0.6

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/shared/package.json lib/shared/package.json
COPY lib/database/package.json lib/database/package.json
COPY lib/service/package.json lib/service/package.json
COPY lib/queue/package.json lib/queue/package.json
COPY notifier/package.json notifier/package.json
RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    --mount=type=cache,target=./node_modules/.cache/turbo \
    pnpm install --frozen-lockfile --prefer-offline

COPY lib/shared lib/shared
COPY lib/database lib/database
COPY lib/service lib/service
COPY lib/queue lib/queue
COPY tsconfig.json tsconfig.json
COPY turbo.json turbo.json

RUN pnpm build --filter="./lib/*"

COPY notifier notifier

RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    pnpm --filter @game-watch/notifier build && \
    pnpm install --frozen-lockfile --prod --ignore-scripts --prefer-offline

ENV NODE_ENV production

CMD ["pnpm", "--filter", "@game-watch/notifier", "start:prod"]
