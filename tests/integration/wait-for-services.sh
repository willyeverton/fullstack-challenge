#!/bin/sh
# wait-for-services.sh

set -e

echo "Waiting for User Service..."
until $(curl --output /dev/null --silent --head --fail ${USER_SERVICE_URL}/users); do
  printf '.'
  sleep 2
done
echo "User Service is up!"

echo "Waiting for Enrichment Service..."
until $(curl --output /dev/null --silent --head --fail ${ENRICHMENT_SERVICE_URL}/health); do
  printf '.'
  sleep 2
done
echo "Enrichment Service is up!"

echo "All services are up and running!"
echo "Running tests..."
exec "$@" 