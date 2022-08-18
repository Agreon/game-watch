FROM node:16-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y git google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g pnpm@7.5.2

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/shared/package.json lib/shared/package.json
COPY lib/database/package.json lib/database/package.json
COPY lib/service/package.json lib/service/package.json
COPY lib/browser/package.json lib/browser/package.json
COPY lib/queue/package.json lib/queue/package.json
COPY searcher/package.json searcher/package.json
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

RUN pnpm turbo run build --filter="./lib/*"

COPY searcher searcher

RUN \
    --mount=type=cache,target=/root/.local/share/pnpm/store/v3 \
    pnpm --filter @game-watch/searcher build && \
    pnpm install --frozen-lockfile --prod --ignore-scripts --prefer-offline

RUN chmod -R o+rwx lib/browser/node_modules/puppeteer/.local-chromium

ENV NODE_ENV production

EXPOSE 3000

CMD ["pnpm", "--filter", "@game-watch/searcher", "start:prod"]
