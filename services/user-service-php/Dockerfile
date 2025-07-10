FROM php:8.1-fpm as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Development stage
FROM base as development

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --prefer-dist --no-scripts --no-progress --no-interaction

# Copy application files
COPY . .

# Generate application key
RUN php artisan key:generate

# Set permissions
RUN chown -R www-data:www-data /var/www

# Production stage
FROM base as production

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --prefer-dist --no-dev --no-scripts --no-progress --no-interaction --optimize-autoloader

# Copy application files
COPY . .

# Generate application key
RUN php artisan key:generate

# Set permissions
RUN chown -R www-data:www-data /var/www
