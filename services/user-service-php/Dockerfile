# syntax=docker/dockerfile:1
FROM php:8.1-apache

# Install dependencies
RUN apt-get update \
    && apt-get install -y libpq-dev git zip unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress

COPY . .

# Apache site config (basic)
RUN echo "<Directory /var/www/html/public>\n    AllowOverride All\n</Directory>" > /etc/apache2/conf-available/rewrite.conf && a2enconf rewrite

ENV APP_ENV=local

EXPOSE 80
CMD ["apache2-foreground"]
