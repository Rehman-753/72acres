# Deploying 72acres (free: Vercel + Render)

```
Browser -> Vercel (React site) --cross-origin API calls--> Render (Django + Postgres)
```

Vercel's free plan can't proxy requests to an external server, so the React site calls the
Render backend directly instead (`VITE_API_BASE`). Django allows this with CORS, and the
session/CSRF cookies are marked `SameSite=None; Secure`, which browsers only accept over real
HTTPS (both Vercel and Render are HTTPS, so this works once deployed - it will NOT work if you
try to test this cross-origin setup over plain `http://` locally).

**The Django admin is not reachable through the Vercel domain.** Visit it directly on Render:
`https://<your-render-app>.onrender.com/admin/`.

Render's free web service has no persistent disk, so uploaded property photos are stored in the
Render Postgres database (`MEDIA_IN_DATABASE=1`, model `StoredFile`) and served from `/media/...`.

## 1. Push to GitHub

    git add -A
    git commit -m "Prepare deployment"
    git push -u origin development

## 2. Render (Django backend + database)

1. render.com -> New -> **Blueprint** -> connect the repo, branch `development`. It reads
   `render.yaml` and creates the free web service **and** the free Postgres database.
2. Fill the prompted variables:

| Variable | Value |
|---|---|
| `DJANGO_CSRF_TRUSTED_ORIGINS` | your exact Vercel URL, e.g. `https://72acres.vercel.app` (no trailing slash) |
| `DJANGO_SUPERUSER_USERNAME` | your admin username |
| `DJANGO_SUPERUSER_EMAIL` | your email |
| `DJANGO_SUPERUSER_PASSWORD` | a strong password |

3. Deploy and wait for **Live**. Note the address, e.g. `https://project72acres.onrender.com`.
   This same list also controls which frontend origin is allowed to call the API (CORS) -
   if it doesn't exactly match your Vercel URL, both login and CORS will fail.

## 3. Vercel (React site)

1. vercel.com -> Add New -> Project -> import the repo, branch `development`.
2. Set **Root Directory** to `project72acres/frontend`.
3. Before deploying (or after, then redeploy), add an environment variable:

| Variable | Value |
|---|---|
| `VITE_API_BASE` | your Render URL from step 2, e.g. `https://project72acres.onrender.com` (no trailing slash) |

4. Deploy.

If your Vercel URL doesn't match what you put in `DJANGO_CSRF_TRUSTED_ORIGINS`, fix that variable
on Render and let it redeploy - otherwise login fails.

## 4. Use it

1. `https://<your-render-app>.onrender.com/admin/` -> log in -> Users -> Add user -> Lister
   Profiles -> Approve. (Admin is on Render's own domain, not the Vercel one.)
2. On the site (Vercel URL): List Your Property -> log in -> Add Property (with photos).

## Free-tier limits (read this)

- **The free Render Postgres database expires ~30 days after creation** (Render emails a
  warning). Upgrade it to a paid plan (about $6/month) before then, or you lose the data,
  including the photos stored in it.
- The database is limited to 1 GB; every uploaded photo counts against it.
- Render's web service sleeps after ~15 min idle: the first visit after that takes ~30-60 s.
- Vercel Hobby is for non-commercial use.
- Changes: push to GitHub and both platforms redeploy automatically. Changing an environment
  variable on Vercel needs a manual redeploy (Deployments tab -> Redeploy) to take effect.
