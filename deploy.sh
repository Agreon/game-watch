#!/usr/bin/env bash

cp ./.env client/.env.local
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 dc build
dc up -d
