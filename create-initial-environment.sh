#!/usr/bin/env bash

cp .env.dist .env
cp .env client/.env.local

openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem

echo "JWT_PUBLIC_KEY"
cat public.pem | base64

echo "JWT_PRIVATE_KEY"
cat private.pem | base64

JWT_PRIVATE_KEY=$(cat public.pem | base64)
JWT_PRIVATE_KEY=$(cat private.pem | base64)

echo "JWT_PUBLIC_KEY="$JWT_PUBLIC_KEY >> .env
echo "JWT_PRIVATE_KEY="$JWT_PRIVATE_KEY >> .env

rm public.pem private.pem