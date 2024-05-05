FROM node:20-slim

RUN apt-get update \
    && apt-get install -y git chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g pnpm@9.0.6

# This block is shared with the resolver for optimal caching
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/shared/package.json lib/shared/package.json
COPY lib/database/package.json lib/database/package.json
COPY lib/service/package.json lib/service/package.json
COPY lib/browser/package.json lib/browser/package.json
COPY lib/queue/package.json lib/queue/package.json
RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    pnpm install --frozen-lockfile --prefer-offline

COPY lib/shared lib/shared
COPY lib/database lib/database
COPY lib/service lib/service
COPY lib/browser lib/browser
COPY lib/queue lib/queue
COPY tsconfig.json tsconfig.json
COPY turbo.json turbo.json

RUN \
    --mount=type=cache,target=./node_modules/.cache/turbo \
    pnpm build --filter="./lib/*"

COPY searcher searcher

RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    pnpm install --frozen-lockfile --prefer-offline && \
    pnpm --filter @game-watch/searcher build && \
    pnpm install --frozen-lockfile --prod --ignore-scripts --prefer-offline

ENV NODE_ENV production

CMD ["pnpm", "--filter", "@game-watch/searcher", "start:prod"]
