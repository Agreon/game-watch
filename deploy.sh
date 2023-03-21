#!/usr/bin/env bash

cp ./.env client/.env.local
# We want to create a good cache for the following images to skip installing libs and puppeteer two times
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 dc build searcher
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 dc build
dc up -d
