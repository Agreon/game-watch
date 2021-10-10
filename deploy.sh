#!/usr/bin/env bash

cp ./.env client/.env.local
docker-compose build
docker-compose up -d