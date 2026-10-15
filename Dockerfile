
# syntax=docker/dockerfile:1

FROM php:8.4-fpm-alpine AS base

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app


FROM base AS development

RUN apk add --no-cache $PHPIZE_DEPS linux-headers \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del $PHPIZE_DEPS

RUN printf '%s\n' \
    'xdebug.mode=debug' \
    'xdebug.start_with_request=yes' \
    'xdebug.client_host=host.docker.internal' \
    'xdebug.client_port=9003' \
    'xdebug.connect_timeout_ms=200' \
    'xdebug.log_level=0' \
    > /usr/local/etc/php/conf.d/99-xdebug.ini

CMD ["php-fpm", "-F"]


FROM base AS production

COPY . /app

RUN APP_ENV=prod APP_DEBUG=0 \
    composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --no-progress \
        --optimize-autoloader \
        --no-scripts

RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var/cache var/log

CMD ["php-fpm", "-F"]
