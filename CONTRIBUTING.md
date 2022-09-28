# Developer Documentation

## General Idea

GameWatch (working title) is a service with which you can watch for changes in stores for specific games. This is done via `scraping`. A user can add a `Game` and the service will look for entries of that game in stores specified by the user. If an entry in a store is found, they are saved as a `InformationSource`. All `InformationSource`s are scraped each night to keep the state updated. If an update happened, `Notification`s are created for that source and if the user opted into it, an email is sent.

## Run it

### Necessary software
- [docker](https://docker.com) + [docker-compose](https://docs.docker.com/compose/install)
- [pnpm](https://pnpm.io)


Run the following commands to build all packages and create an initial environment:

```
cp .env.dist .env
pnpm install
pnpm build:docker
```

If you feel ready to start, execute `docker compose up -d` to start all services.

### During Development

GameWatch is created as a monorepo with multiple packages and libraries. Each component can be independently started in docker or for active development with `pnpm start:dev`. When I develop locally, I normally start up the non-development services with docker and the ones I work on with `pnpm start:dev`. Hot reloading in containers is not done yet. Feel free to help in https://github.com/Agreon/game-watch/issues/142 ;)

---

The docker setup leverages [buildkit](https://github.com/moby/buildkit), so you'll need to use additional flags for it to work:

```
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker compose up -d
```

But you can just use `pnpm build:docker <service>` so you don't have to remember that.

### Basic Scripts

- Build all packages: `pnpm build`
- Build only libraries: `pnpm build:lib`
- Build all packages in docker: `pnpm build:docker`

## Components

### Frontend

The frontend is served as a SPA. It is implemented in `React` with the help of `Next.js` and `chakra-ui`.

### Backend

The backend consists of multiple services that can be found top-level in the root directory.

The services communicate through `BullMQ` which works with the `redis` instance. See `lib/queue` for configuration.

State is shared through a `Postgresql` database. Database access is done via `MikroORM`. See `lib/database` for models and configuration.

#### Server

The server handles user requests from the frontend. It serves as the entry point to the backend. Through various routes a user can operate on games, information sources and tags.

The framework of choice for the server is `NestJS`.

#### Searcher

The `searcher` is responsible to look for entries of a given game in the different stores. This is done by leveraging the existing search capabilities of the stores. The searcher is triggered once, when the game is added and from then on every night to look for new store entries.

Implementations for each store can be found at `searcher/src/searchers`.

#### Resolver

The `resolver` is responsible for getting all relevant data of a game that was previously found by the `searcher`. It is executed per source to be able to scale it independently and so that a whole game resolve process is not blocked by a single long running scrape. The `resolver` is also run every night for every source to check for updates in the stores.

Implementations for each store can be found at `resolver/src/resolvers`.

#### Notifier

The `notifier` will compare the data that was found by the `resolver` with the previous data of a `InformationSource`. If a relevant change happened, a `Notification` is created.

Implementations for each notification type can be found at `notifier/src/notifier`.

If the user opted into getting notification mails, `Sendgrid` is used to send an email about the notification.

### Scraping

Scraping is done with a combination of `Puppeteer`, `axios`, and `cheerio`, depending on what the store offers.

### Users and Authentication

Every user that visits the site gets assigned a `Trial` user so that the services can differentiate between each user and are able to create notifications, if necessary. Those trial users are getting a cookie as long as their refresh token does not expire. If that happens, they can no longer access their data, as they will get a new user assigned to them. So they have the option to register with `username` and `password` to save their data.
