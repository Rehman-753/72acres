# Deploying 72acres (free: Vercel + Render)

```
Browser -> Vercel (React site) --/api, /admin, /media, /static--> Render web service (Django) --> Render Postgres
```

Vercel forwards `/api`, `/admin`, `/media` and `/static` to Render, so the site and API share one
address (same as the local Vite proxy) and login/CSRF cookies work.

Render's free web service has no persistent disk, so uploaded property photos are stored in the
Render Postgres database (`MEDIA_IN_DATABASE=1`, model `StoredFile`) and served from `/media/...`.

## 1. Push to GitHub

The repo is already connected (`origin`). Commit and push the current branch:

    git add -A
    git commit -m "Prepare deployment"
    git push -u origin development

When Render and Vercel ask which branch to deploy, choose the branch you pushed
(`development`, or `main` if you merge it).

## 2. Render (Django backend + database)

Pick your Vercel project name first (e.g. `my72acres`) so its URL is known: `https://my72acres.vercel.app`.

1. render.com -> New -> **Blueprint** -> connect the GitHub repo. It reads `render.yaml` and creates the
   free web service **and** the free Postgres database, and wires `DATABASE_URL` automatically.
2. Fill the prompted variables:

| Variable | Value |
|---|---|
| `DJANGO_CSRF_TRUSTED_ORIGINS` | `https://my72acres.vercel.app` (no trailing slash) |
| `DJANGO_SUPERUSER_USERNAME` | your admin username |
| `DJANGO_SUPERUSER_EMAIL` | your email |
| `DJANGO_SUPERUSER_PASSWORD` | a strong password |

3. Deploy. When it is live, note the URL, e.g. `https://project72acres.onrender.com`.
   Migrations and the first admin are created automatically on start.

## 3. Vercel (React site)

1. In `frontend/vercel.json` replace every `YOUR-RENDER-APP.onrender.com` with your Render host.
   Commit and push.
2. vercel.com -> Add New -> Project -> import the repo.
3. Set **Root Directory** to `frontend` (Vite is detected). Name the project as planned in step 2. Deploy.

If the Vercel URL differs from `DJANGO_CSRF_TRUSTED_ORIGINS`, fix that variable in Render and
redeploy, otherwise logins fail with 403.

## 4. Use it

1. `https://<your-vercel-url>/admin/` -> log in -> Users -> Add user -> Lister Profiles -> Approve.
2. On the site: List Your Property -> log in -> Add Property (with photos).

## Free-tier limits (read this)

- **The free Render Postgres database expires ~30 days after creation** (Render emails a warning).
  Upgrade that database to a paid plan (about $6/month) before then, or you lose the data,
  including the photos stored in it.
- The database is limited to 1 GB; every uploaded photo counts against it. Keep photos reasonably small.
- Render's web service sleeps after ~15 min idle: the first visit after that takes ~30-60 s.
- Vercel Hobby is for non-commercial use.
- Deleting a property does not delete its photo rows (they stay in the database until removed).
- Changes: push to GitHub and both platforms redeploy automatically.
