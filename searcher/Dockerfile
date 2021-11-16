# Install dependencies only when needed
FROM node:12-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json yarn.lock ./
COPY lib/shared/package.json lib/shared/package.json
COPY lib/database/package.json lib/database/package.json
COPY lib/service/package.json lib/service/package.json
COPY lib/queue/package.json lib/queue/package.json
COPY searcher/package.json searcher/package.json
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn workspace @game-watch/shared build && \
    yarn workspace @game-watch/database build && \
    yarn workspace @game-watch/service build && \
    yarn workspace @game-watch/queue build && \
    yarn workspace @game-watch/searcher build && \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline

RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium

ENV NODE_ENV production

EXPOSE 3000

CMD ["yarn", "workspace", "@game-watch/searcher", "start:prod"]
