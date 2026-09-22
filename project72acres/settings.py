"""
Django settings for project72acres.

Development defaults work out of the box (SQLite, local media, Vite proxy).
Production runs the React site and Django on two different domains (Vercel's
free plan can't proxy to an external host), so the API is called cross-origin:
CORS + cross-site session/CSRF cookies are configured below. Set purely through
environment variables (see DEPLOY.md): DJANGO_SECRET_KEY, DJANGO_DEBUG=0,
DJANGO_ALLOWED_HOSTS, DJANGO_CSRF_TRUSTED_ORIGINS, DATABASE_URL, MEDIA_IN_DATABASE=1.
"""

import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


def env_list(name, default=""):
    return [v.strip() for v in os.environ.get(name, default).split(",") if v.strip()]


SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-dev-only-change-me-in-production",
)
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")
if os.environ.get("RENDER_EXTERNAL_HOSTNAME"):  # set automatically by Render
    ALLOWED_HOSTS.append(os.environ["RENDER_EXTERNAL_HOSTNAME"])

if not DEBUG and SECRET_KEY.startswith("django-insecure"):
    raise RuntimeError("Set DJANGO_SECRET_KEY when DJANGO_DEBUG=0.")


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "users",
    "property_lister",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # serves collected static files (admin CSS/JS)
    "corsheaders.middleware.CorsMiddleware",  # must come before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "project72acres.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "project72acres.wsgi.application"


# SQLite for development; set DATABASE_URL (postgres://...) for production.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# Static assets (CSS/JS of Django admin etc.)
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# User-uploaded media (property images) - kept separate from static assets.
# In production serve MEDIA_ROOT from the web server / object storage.
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
        if not DEBUG
        else "django.contrib.staticfiles.storage.StaticFilesStorage"
    },
}

# Render's free web service has no persistent disk, so in production uploaded
# images are stored in the database (property_lister.storage.DatabaseStorage).
MEDIA_IN_DATABASE = os.environ.get("MEDIA_IN_DATABASE", "0") == "1"
if MEDIA_IN_DATABASE:
    STORAGES["default"] = {"BACKEND": "property_lister.storage.DatabaseStorage"}

# Development: the React dev server (Vite) proxies to Django from localhost:5173,
# so requests are same-origin. Production: the React site (Vercel) and Django
# (Render) are on different domains, so the frontend's API calls are
# cross-origin - CORS must allow it. (CSRF_TRUSTED_ORIGINS still matters for
# the Django admin's own login form, served directly from Render.)
FRONTEND_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
CSRF_TRUSTED_ORIGINS = FRONTEND_ORIGINS
CORS_ALLOWED_ORIGINS = FRONTEND_ORIGINS
# The lister API authenticates with a bearer token (see property_lister/decorators.py),
# not a cookie, so no cross-site cookie needs to be sent - browsers that block
# third-party cookies (e.g. Safari) are unaffected. Django's own admin login
# still uses a normal session cookie, but that's same-origin (visited directly
# on Render), so it doesn't need special cross-site cookie settings either.
CORS_ALLOW_CREDENTIALS = False

if not DEBUG:
    # Render terminates TLS and forwards the original scheme.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
