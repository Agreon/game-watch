# Install dependencies only when needed
FROM node:12-slim

WORKDIR /app
COPY package.json yarn.lock ./
COPY lib/shared/package.json lib/shared/package.json
COPY lib/database/package.json lib/database/package.json
COPY lib/queue/package.json lib/queue/package.json
COPY server/package.json server/package.json
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn workspace @game-watch/shared build && \
    yarn workspace @game-watch/database build && \
    yarn workspace @game-watch/queue build && \
    yarn workspace @game-watch/server build && \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline

ENV NODE_ENV production

EXPOSE 3000

CMD ["yarn", "workspace", "@game-watch/server", "start:prod"]
