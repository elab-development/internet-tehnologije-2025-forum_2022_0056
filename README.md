Planinarski Forum - Web Aplikacija

Planinarski Forum je web aplikacija razvijena kao završni projekat. Aplikacija predstavlja forum posvećen planinarstvu, gde korisnici mogu deliti iskustva, postavljati pitanja, komentarisati i povezivati se sa drugim ljubiteljima prirode i planina.

O projektu

Planinarski Forum omogućava korisnicima da:

- Kreiraju i pregledaju postove o planinarskim turama

- Lajkuju postove drugih korisnika

- Pretražuju teme i kategorije

- Prate vremensku prognozu za planinske predele

- Administriraju sadržaj (za korisnike sa admin privilegijama)


Tehnologije

Frontend

- React 18 - Biblioteka za korisnički interfejs

- React Router DOM - Rutanje na klijentskoj strani

- CSS3 - Stilizovanje komponenti

- Vite - Build alat i razvojni server

- ESLint - Linting JavaScript/JSX koda


Backend

- Laravel 11 - PHP framework za backend

- MySQL - Relaciona baza podataka

- Laravel Sanctum - Autentifikacija i autorizacija

- REST API - Arhitektura za komunikaciju

- Swagger / OpenAPI - Dokumentacija API-ja


Funkcionalnosti

Implementirani zahtevi

Frontend (React)

- 9 stranica: Login, Register, Profile, PostDetail, AdminPanel, CategoryDetail, topicDetail, Home, CreatePost

- 6 reusable komponente: Button, PruvateRoutes, PostCard, Navbar, LikeButton, Weather

- CSS stilizovanje: Prilagođen CSS za ceo sajt

- JS/JSX funkcionalnosti:

    - Weather komponenta sa prikazom vremenske prognoze

    - LikeButton za lajkovanje postova

    - Privatne rute sa zaštitom (PrivateRoute)

- React hooks: useState, useEffect, useContext, useNavigate

- Rutanje: React Router za sve delove sajta


Backend (Laravel)

- 5 modela: User, Post, Category, Theme, Like

- 3+ tipova migracija: Kreiranje tabela, dodavanje spoljnih ključeva, indeksiranje

- JSON odgovori: Svi response-i u JSON formatu

- 4 tipa API ruta: GET, POST, PUT, DELETE

- 3 tipa korisnika: guest, Authenticated user, Admin, Moderator

- Autentifikacija: Register, Login, Logout

- Autorizacija: Zaštićene rute za CREATE, UPDATE, DELETE operacije


Lokalno pokretanje

Backend (Laravel)

- cd forum

- composer install

- cp .env.example .env

- php artisan key:generate

- php artisan migrate --seed

- php artisan serve


Frontend (React)

- cd frontend

- npm install

- npm run dev


Autori

- Jovana Maksimović 2022/0056
- Aleksa Marić 2022/0317
