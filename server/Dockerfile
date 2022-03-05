FROM node:16-slim

WORKDIR /app
COPY package.json yarn.lock ./
COPY lib/shared/package.json lib/shared/package.json
COPY lib/database/package.json lib/database/package.json
COPY lib/queue/package.json lib/queue/package.json
COPY server/package.json server/package.json
RUN \
    --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn \
    yarn install --frozen-lockfile

COPY lib/shared lib/shared
COPY lib/database lib/database
COPY lib/queue lib/queue
COPY tsconfig.json tsconfig.json

RUN \
    yarn workspace @game-watch/shared build && \
    yarn workspace @game-watch/database build && \
    yarn workspace @game-watch/queue build

COPY server server

RUN \
    --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn \
    yarn workspace @game-watch/server build && \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline

ENV NODE_ENV production

EXPOSE 3000

CMD ["yarn", "workspace", "@game-watch/server", "start:prod"]
