# ใช้ PHP 8.3 พร้อม Apache
FROM php:8.3-apache

# 1. ติดตั้งส่วนเสริมที่จำเป็น และ Node.js (สำหรับ Build React)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_pgsql

# 2. เปิดใช้งาน mod_rewrite ของ Apache
RUN a2enmod rewrite

# 3. ตั้งค่า DocumentRoot ไปที่โฟลเดอร์ public ของ Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 4. ก๊อปปี้โค้ดทั้งหมดลงใน Container
COPY . /var/www/html

# 5. ติดตั้ง Composer (Backend Dependencies)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# 6. ติดตั้ง NPM และ Build React (Frontend Dependencies)
RUN npm install --legacy-peer-deps
RUN npm run build

# 7. ตั้งค่าสิทธิ์โฟลเดอร์ให้ Laravel เขียนไฟล์ได้
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 8. รัน Migration และ Start Apache
CMD php artisan migrate --force && apache2-foreground
