# Déploiement GCP (Cloud Run)

Runbook pour déployer TeamPlanificateur sur Google Cloud : Cloud Run, Secret Manager, bucket GCS des récaps, IAM, et job Cloud Scheduler.

Valeurs utilisées en production :

| Variable | Valeur |
| --- | --- |
| Projet | `tpe-vianney-prod` |
| Région | `europe-west9` (Paris) |
| Service Cloud Run | `teamplanificateur` |
| Bucket récaps | `gs://${PROJECT_ID}-recaps` |
| Secret BDD | `tp-database-url` |
| Secret jeton récap | `tp-recap-token` |
| SA Cloud Run | `tp-run@${PROJECT_ID}.iam.gserviceaccount.com` |
| SA Scheduler | `tp-scheduler@${PROJECT_ID}.iam.gserviceaccount.com` |
| Job Scheduler | `tp-daily-recap` (lun-ven 07:00 Europe/Paris) |

Le `Dockerfile` à la racine construit l’image (pnpm, Prisma generate, `astro build`) et écoute sur le port injecté par Cloud Run (`PORT`, exposé en 8080). Les secrets (`.env`) ne sont pas copiés dans l’image (voir `.dockerignore` / `.gcloudignore`) : ils passent par Secret Manager.

Ne jamais coller `DATABASE_URL` ni `RECAP_TOKEN` dans le dépôt, l’historique git, ou `--set-env-vars`.

## 1. Projet et APIs

```sh
gcloud auth login
gcloud projects create tpe-vianney-prod --name="TeamPlanificateur"
gcloud config set project tpe-vianney-prod
gcloud config set run/region europe-west9

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  cloudscheduler.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com
```

Facturation et APIs : le projet doit avoir un compte de facturation lié avant le premier `gcloud run deploy`.

## 2. Secrets

```sh
PROJECT_ID="$(gcloud config get-value project)"

# URL Neon (directe ou pooler). Ne pas echo-er la valeur.
printf '%s' "${DATABASE_URL}" | gcloud secrets create tp-database-url --data-file=-

RECAP_TOKEN="$(openssl rand -hex 32)"
printf '%s' "${RECAP_TOKEN}" | gcloud secrets create tp-recap-token --data-file=-
unset RECAP_TOKEN
```

Pour une nouvelle version d’un secret déjà créé :

```sh
printf '%s' "${DATABASE_URL}" | gcloud secrets versions add tp-database-url --data-file=-
```

## 3. Bucket GCS (récaps)

```sh
PROJECT_ID="$(gcloud config get-value project)"

gcloud storage buckets create "gs://${PROJECT_ID}-recaps" \
  --location=europe-west9 \
  --uniform-bucket-level-access
```

Les fichiers sont écrits sous `recaps/YYYY-MM-DD.json` par `POST /api/jobs/daily-recap`.

## 4. Comptes de service et liaisons IAM

```sh
PROJECT_ID="$(gcloud config get-value project)"
SA="tp-run@${PROJECT_ID}.iam.gserviceaccount.com"
SCHED="tp-scheduler@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create tp-run \
  --display-name="TeamPlanificateur Cloud Run"

gcloud iam service-accounts create tp-scheduler \
  --display-name="TeamPlanificateur Scheduler"

# Cloud Run lit les secrets et écrit dans le bucket.
gcloud secrets add-iam-policy-binding tp-database-url \
  --member="serviceAccount:${SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding tp-recap-token \
  --member="serviceAccount:${SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud storage buckets add-iam-policy-binding "gs://${PROJECT_ID}-recaps" \
  --member="serviceAccount:${SA}" \
  --role="roles/storage.objectAdmin"

# Scheduler : accès au jeton (rotation / lecture opérationnelle).
gcloud secrets add-iam-policy-binding tp-recap-token \
  --member="serviceAccount:${SCHED}" \
  --role="roles/secretmanager.secretAccessor"
```

Le job HTTP envoie le jeton en en-tête `x-recap-token` (voir plus bas). Cloud Run reste `allow-unauthenticated` pour l’UI ; le job est protégé par ce jeton, pas par IAM sur l’endpoint.

## 5. Déploiement Cloud Run

Depuis la racine du dépôt (Cloud Build utilise le `Dockerfile`) :

```sh
PROJECT_ID="$(gcloud config get-value project)"
SA="tp-run@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud run deploy teamplanificateur \
  --source . \
  --region europe-west9 \
  --port 8080 \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 3 \
  --allow-unauthenticated \
  --service-account="${SA}" \
  --set-env-vars "RECAP_BUCKET=${PROJECT_ID}-recaps" \
  --set-secrets "DATABASE_URL=tp-database-url:latest,RECAP_TOKEN=tp-recap-token:latest"
```

Redéploiement après un changement de code (garde env et secrets déjà posés) :

```sh
gcloud run deploy teamplanificateur \
  --source . \
  --region europe-west9
```

URL du service :

```sh
gcloud run services describe teamplanificateur \
  --region europe-west9 \
  --format='value(status.url)'
```

## 6. Job Cloud Scheduler (récap quotidien)

```sh
PROJECT_ID="$(gcloud config get-value project)"
SERVICE_URL="$(gcloud run services describe teamplanificateur \
  --region europe-west9 --format='value(status.url)')"
RECAP_TOKEN="$(gcloud secrets versions access latest --secret=tp-recap-token)"

gcloud scheduler jobs create http tp-daily-recap \
  --location=europe-west9 \
  --schedule="0 7 * * 1-5" \
  --time-zone="Europe/Paris" \
  --uri="${SERVICE_URL}/api/jobs/daily-recap" \
  --http-method=POST \
  --headers="Content-Type=application/json,x-recap-token=${RECAP_TOKEN}" \
  --attempt-deadline=120s \
  --max-retry-attempts=3 \
  --min-backoff=30s

unset RECAP_TOKEN
```

Si le job existe déjà, remplacer `create` par `update`.

Déclenchement manuel et contrôle :

```sh
gcloud scheduler jobs run tp-daily-recap --location=europe-west9

gcloud scheduler jobs describe tp-daily-recap \
  --location=europe-west9 \
  --format='value(status,lastAttemptTime)'

gcloud storage ls -l "gs://$(gcloud config get-value project)-recaps/recaps/"
```

Test HTTP direct (même jeton) :

```sh
SERVICE_URL="$(gcloud run services describe teamplanificateur \
  --region europe-west9 --format='value(status.url)')"
RECAP_TOKEN="$(gcloud secrets versions access latest --secret=tp-recap-token)"

curl -sS -X POST "${SERVICE_URL}/api/jobs/daily-recap" \
  -H "Content-Type: application/json" \
  -H "x-recap-token: ${RECAP_TOKEN}"

unset RECAP_TOKEN
```

## 7. Optionnel : cycle de vie du bucket sources Cloud Run

Cloud Build dépose les sources dans `gs://run-sources-${PROJECT_ID}-europe-west9`. Pour limiter la rétention, un fichier lifecycle JSON puis :

```sh
PROJECT_ID="$(gcloud config get-value project)"
gcloud storage buckets update "gs://run-sources-${PROJECT_ID}-europe-west9" \
  --lifecycle-file=lifecycle.json
```
