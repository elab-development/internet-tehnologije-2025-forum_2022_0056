FROM php:8.2-fpm

# Instalacija sistemskih zavisnosti
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalacija PHP ekstenzija
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Instalacija Composer-a
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Radni direktorijum
WORKDIR /var/www

# Kopiranje aplikacije
COPY . /var/www

# Permisije
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]