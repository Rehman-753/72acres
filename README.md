# 72acres – real estate platform

Django backend (`users` = public browsing API, `property_lister` = private lister portal API + admin)
and a React + Vite frontend in `frontend/`.

## Run (development)

Backend (from this folder):

    ..\env\Scripts\python.exe manage.py migrate
    ..\env\Scripts\python.exe manage.py createsuperuser
    ..\env\Scripts\python.exe manage.py runserver

Frontend (needs Node.js LTS):

    cd frontend
    npm install
    npm run dev        # http://localhost:5173 (proxies /api, /media, /admin to Django on :8000)

## Workflow

1. Admin opens `/admin/` -> Users -> Add user (any non-superuser gets a PENDING lister profile automatically).
2. Admin opens Lister Profiles -> selects the lister -> action "Approve selected listers".
3. Lister logs in at `/lister/login` and manages only their own properties.

## API

Public: `GET /api/options/`, `GET /api/properties/` (q, city, listing_type, property_type, bhk, min_price, max_price, page),
`GET /api/properties/<id>/` (includes `related`).
Lister (session + CSRF): `/api/lister/{csrf,login,logout,me,dashboard,profile}/`,
`/api/lister/properties/`, `.../add/`, `.../<id>/`, `.../<id>/edit/`, `.../<id>/delete/` (POST).

## Tests

    ..\env\Scripts\python.exe manage.py test
