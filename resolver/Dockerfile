FROM node:24-slim

# Chromium plus fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others).
# Puppeteer drives this system Chromium (see PUPPETEER_EXECUTABLE_PATH below) instead of
# downloading its own: Chrome for Testing ships linux-x64 only, so the bundled binary cannot
# run in a linux/arm64 image.
RUN apt-get update \
    && apt-get install -y git chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Skip Puppeteer's Chrome download and point it at the system Chromium installed above.
# Has to be set before the installs so the postinstall script honours it.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm i -g pnpm@12.4.2

# This block is shared with the searcher for optimal caching
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

COPY resolver resolver

RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    pnpm install --frozen-lockfile --prefer-offline && \
    pnpm --filter @game-watch/resolver build && \
    pnpm install --frozen-lockfile --prod --ignore-scripts --prefer-offline


ENV NODE_ENV production

CMD ["pnpm", "--filter", "@game-watch/resolver", "start:prod"]
