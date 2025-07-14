#!/bin/bash
set -e

# Aguarda o banco de dados estar pronto
until php -r "new PDO('pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_DATABASE', '$DB_USERNAME', '$DB_PASSWORD');" 2>/dev/null; do
  echo "Aguardando banco de dados..."
  sleep 2
done

# Executa as migrations
php artisan migrate --force

# Sobe o servidor PHP
exec php -S 0.0.0.0:8000 -t public
