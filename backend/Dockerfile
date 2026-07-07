FROM php:8.3-cli-bookworm

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize

RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

ENV BUILD_ID=2026-07-07-payment-omise
ENV SESSION_DRIVER=cookie
ENV OMISE_PUBLIC_KEY=pkey_test_689gs96ehzjmf5537qy
ENV OMISE_SECRET_KEY=skey_test_689gs96uyhn5qdplvi6

EXPOSE 10000
CMD ["/start.sh"]
