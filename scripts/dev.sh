#!/bin/bash
set -e

docker compose up -d

cleanup() {
  echo "\nArrêt de Docker..."
  docker compose stop
}
trap cleanup EXIT INT TERM

bun --watch src/index.ts
