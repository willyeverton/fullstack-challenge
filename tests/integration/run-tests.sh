#!/bin/bash
# Script para executar os testes de integração

set -e

echo "Starting integration test environment..."
docker-compose -f docker-compose.test.yml up -d

echo "Waiting for services to initialize..."
sleep 10

echo "Running integration tests..."
docker-compose -f docker-compose.test.yml run integration-tests

echo "Cleaning up test environment..."
docker-compose -f docker-compose.test.yml down -v

echo "Tests completed!" 