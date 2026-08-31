# Déploiement GCP

Application déployée sur Google Cloud Run. Ce document décrit l'architecture, les commandes de référence et les décisions prises.

---

## Ressources

| Élément            | Valeur                                                                  |
| ------------------ | ----------------------------------------------------------------------- |
| Projet GCP         | `tpe-vianney-prod`                                                      |
| Région             | `europe-west9` (Paris)                                                  |
| Service Cloud Run  | `teamplanificateur`                                                     |
| Bucket de sortie   | `gs://tpe-vianney-prod-recaps`                                          |
| Bucket de sources  | `gs://run-sources-tpe-vianney-prod-europe-west9` (créé automatiquement) |
| Secrets            | `tp-database-url`, `tp-recap-token`, `tp-demo-reset-token`              |
| Comptes de service | `tp-run`, `tp-scheduler`                                                |
| Job planifié       | `tp-daily-recap`                                                        |

Toutes les ressources sont dans la même région. Ne pas en créer ailleurs.

---

## Architecture

```
Cloud Scheduler (tp-daily-recap)
  |  POST 7h00, lundi au vendredi, Europe/Paris
  v
Cloud Run (teamplanificateur)          <-- Secret Manager (DATABASE_URL, RECAP_TOKEN, DEMO_RESET_TOKEN)
                                       <-- DEMO_RESET_ENABLED=true
  |  Astro SSR + API Hono
  |
  +--> Neon PostgreSQL (endpoint pooler)
  +--> Cloud Storage (gs://tpe-vianney-prod-recaps)
```

Un seul conteneur sert le front Astro et l'API Hono. L'API n'est pas un service autonome : elle est montée dans Astro via `src/pages/api/[...path].ts`.

---

## Prérequis d'un environnement neuf

```bash
gcloud auth login
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

La facturation doit être active sur le projet, même si l'usage reste dans le niveau gratuit. Une alerte de budget à 1 EUR est en place.

---

## Build

Le `Dockerfile` est à la racine du dépôt, car le lockfile pnpm y réside et le contexte de build doit le couvrir.

Points structurants :

- image de base `node:22-slim` (Debian). Alpine imposerait de gérer `binaryTargets` pour Prisma. Non pertinent ici puisque `@prisma/adapter-pg` évite le moteur natif, mais slim supprime la question ;
- `ENV HOST=0.0.0.0`. L'adaptateur Astro Node en mode standalone n'écoute que sur `localhost` par défaut, ce qui fait échouer le démarrage sur Cloud Run ;
- le port n'est pas codé en dur. Cloud Run injecte `PORT`, l'adaptateur le lit ;
- `prisma generate` est exécuté avant `astro build`, avec un `DATABASE_URL` factice en préfixe de commande uniquement, pour ne pas laisser de valeur dans l'image ;
- `USER node` pour ne pas exécuter en root.

Deux fichiers d'exclusion sont nécessaires et ne sont pas interchangeables :

- `.dockerignore` : ce qui n'entre pas dans l'image ;
- `.gcloudignore` : ce qui n'est pas envoyé à Cloud Build. `gcloud` ignore `.dockerignore` et se rabat sur `.gitignore` en l'absence de `.gcloudignore`.

Ne pas exclure `Dockerfile` du `.gcloudignore` : sans lui, `gcloud` bascule sur une détection automatique qui échoue sur un monorepo pnpm.

---

## Déploiement
Deux étapes. Ne pas utiliser `gcloud run deploy --source .` : la détection bascule sur les Buildpacks et ignore le Dockerfile, ce qui produit un container incapable de démarrer.

### 1. Construire l'image

```bash
TAG=$(git rev-parse --short HEAD)
IMAGE="europe-west9-docker.pkg.dev/tpe-vianney-prod/cloud-run-source-deploy/teamplanificateur:${TAG}"

gcloud builds submit --tag "${IMAGE}"
```

Depuis la racine du dépôt. `gcloud builds submit` utilise le Dockerfile
de façon fiable, contrairement à la détection automatique de
`run deploy --source`.

Le tag reprend le hash du commit : on sait ainsi quelle version du code
tourne dans une révision donnée.

### 2. Déployer 

```bash
gcloud run deploy teamplanificateur \
  --image "${IMAGE}" \
  --region europe-west9 \
  --port 8080 \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 3 \
  --allow-unauthenticated \
  --service-account="tp-run@tpe-vianney-prod.iam.gserviceaccount.com" \
  --set-secrets "DATABASE_URL=tp-database-url:latest,RECAP_TOKEN=tp-recap-token:latest,DEMO_RESET_TOKEN=tp-demo-reset-token:latest" \
  --set-env-vars "RECAP_BUCKET=tpe-vianney-prod-recaps,DEMO_RESET_ENABLED=true"
```

Les options non repassées lors d'un redéploiement sont héritées de la
révision précédente.

Pour modifier uniquement la configuration sans reconstruire l'image,
utiliser `gcloud run services update` avec les mêmes options.

Pour revenir à une image déjà construite, rejouer l'étape 2 avec un
autre tag. Aucune reconstruction n'est nécessaire.

---

## Secrets

Le code lit `process.env.DATABASE_URL` sans savoir d'où vient la valeur. Cloud Run la récupère dans Secret Manager au démarrage du conteneur et l'injecte dans l'environnement. Aucune valeur sensible n'entre dans l'image, et la rotation ne demande pas de reconstruction.

Création :

```bash
printf '%s' '<valeur>' | gcloud secrets create <nom> --data-file=-
```

`printf` plutôt que `echo` : ce dernier ajoute un retour à la ligne qui se retrouve dans la valeur.

Lecture :

```bash
gcloud secrets versions access latest --secret=tp-recap-token
```

Rotation :

```bash
printf '%s' '<nouvelle valeur>' | gcloud secrets versions add <nom> --data-file=-
gcloud run services update teamplanificateur --region europe-west9
```

Le redéploiement est nécessaire car le secret est lu au démarrage du conteneur.

---

## IAM

Deux identités distinctes, chacune avec le minimum de droits, accordés sur une ressource nommée et non globalement.

**`tp-run`**, identité du service Cloud Run :

| Droit                                | Portée                           |
| ------------------------------------ | -------------------------------- |
| `roles/secretmanager.secretAccessor` | secret `tp-database-url`         |
| `roles/secretmanager.secretAccessor` | secret `tp-recap-token`          |
| `roles/secretmanager.secretAccessor` | secret `tp-demo-reset-token`     |
| `roles/storage.objectAdmin`          | bucket `tpe-vianney-prod-recaps` |

**`tp-scheduler`**, identité du déclencheur :

| Droit                                | Portée                  |
| ------------------------------------ | ----------------------- |
| `roles/secretmanager.secretAccessor` | secret `tp-recap-token` |

Création d'un compte et attribution :

```bash
gcloud iam service-accounts create <nom> --display-name="<libellé>"

gcloud secrets add-iam-policy-binding <secret> \
  --member="serviceAccount:<nom>@tpe-vianney-prod.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud storage buckets add-iam-policy-binding gs://<bucket> \
  --member="serviceAccount:<nom>@tpe-vianney-prod.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

La propagation n'est pas instantanée. Attendre une à deux minutes avant de conclure à une erreur de configuration.

`new Storage()` dans `src/lib/recap.ts` ne reçoit aucun identifiant : la bibliothèque détecte l'identité du conteneur. Aucune clé n'est générée, stockée ni transmise.

---

## Stockage

```bash
gcloud storage buckets create gs://tpe-vianney-prod-recaps \
  --location=europe-west9 \
  --uniform-bucket-level-access
```

`--uniform-bucket-level-access` désactive les permissions par objet. Les droits se gèrent uniquement au niveau du bucket.

Nommage des objets : `recaps/AAAA-MM-JJ.json`.

- idempotent : une réexécution le même jour écrase le fichier au lieu d'en créer un second ;
- triable : le format ISO se trie correctement en tant que texte ;
- filtrable : le préfixe `recaps/` isole ces objets des autres.

Une règle de cycle de vie supprime les archives de plus de 7 jours sur le bucket de sources. **Ne pas appliquer cette règle au bucket de récapitulatifs.**

```bash
echo '{"rule":[{"action":{"type":"Delete"},"condition":{"age":7}}]}' > /tmp/lifecycle.json
gcloud storage buckets update gs://run-sources-tpe-vianney-prod-europe-west9 \
  --lifecycle-file=/tmp/lifecycle.json
```

---

## Job planifié

```bash
SERVICE_URL=$(gcloud run services describe teamplanificateur \
  --region europe-west9 --format='value(status.url)')
RECAP_TOKEN=$(gcloud secrets versions access latest --secret=tp-recap-token)

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
```

Déclenchement manuel :

```bash
gcloud scheduler jobs run tp-daily-recap --location=europe-west9
gcloud scheduler jobs describe tp-daily-recap --location=europe-west9 \
  --format='value(status,lastAttemptTime)'
```

Un champ `status` vide indique un succès.

Détails :

- `--time-zone` est obligatoire, sinon le calendrier est interprété en UTC et décale d'une à deux heures selon la saison ;
- `--attempt-deadline=120s` laisse la marge nécessaire au démarrage à froid, le service étant éteint la nuit ;
- l'en-tête `Content-Type` est requis. Astro 5 rejette les requêtes non-GET sans cet en-tête au titre de sa protection contre la falsification de requête entre sites.

---

## Réinitialisation nocturne de la démo

`POST /api/jobs/reset-demo` vide les données applicatives et repeuple un jeu fictif. Deux gardes, dans cet ordre :

1. `DEMO_RESET_ENABLED` doit valoir exactement `true` (sinon 403, avant même de lire le jeton). Ne pas définir ce flag en local : il active aussi le bandeau de démonstration.
2. En-tête `x-demo-reset-token` égal à `DEMO_RESET_TOKEN` (secret `tp-demo-reset-token`). Ne pas réutiliser `RECAP_TOKEN`.

Déclenchement manuel :

```bash
SERVICE_URL=$(gcloud run services describe teamplanificateur \
  --region europe-west9 --format='value(status.url)')
DEMO_RESET_TOKEN=$(gcloud secrets versions access latest --secret=tp-demo-reset-token)

curl -sS -X POST "${SERVICE_URL}/api/jobs/reset-demo" \
  -H "Content-Type: application/json" \
  -H "x-demo-reset-token: ${DEMO_RESET_TOKEN}"
```

Le job Cloud Scheduler qui l'appelle chaque nuit se configure à part, sur le même modèle que `tp-daily-recap` (en-tête `x-demo-reset-token` à la place de `x-recap-token`).

Créer le secret s'il n'existe pas encore, puis accorder l'accès à `tp-run` :

```bash
printf '%s' '<valeur>' | gcloud secrets create tp-demo-reset-token --data-file=-

gcloud secrets add-iam-policy-binding tp-demo-reset-token \
  --member="serviceAccount:tp-run@tpe-vianney-prod.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Décisions et compromis

**Application entière déployée plutôt que l'API seule.** L'API Hono n'a pas de point d'entrée autonome, elle est montée dans Astro. L'extraire aurait demandé un build séparé et la gestion des alias de chemins, sans apport pédagogique.

**Jeton partagé plutôt que jeton OIDC sur la route de job.** Sur Cloud Run l'authentification IAM se règle au niveau du service, pas de la route. Le service doit rester public pour la démonstration, donc un jeton OIDC n'y protégerait rien. La route est protégée par un secret partagé injecté depuis Secret Manager.

Limite connue : le jeton est stocké en clair dans la configuration du job, Cloud Scheduler ne sachant pas monter un secret. Si le service était privé, la configuration correcte serait un jeton OIDC avec `roles/run.invoker` accordé à `tp-scheduler`.

**`--max-instances 3`.** Le code ouvre une connexion PostgreSQL par instance (`Pool({ max: 1 })`). Ce plafond borne le nombre total de connexions vers Neon depuis un environnement où les instances apparaissent et disparaissent en continu. L'URL utilisée est l'endpoint pooler de Neon.

**`--min-instances 0`.** Le service s'éteint sans trafic. Coût quasi nul, au prix de 2 à 4 secondes de démarrage à froid sur la première requête.

**Région `europe-west9`.** Le niveau gratuit de Cloud Run ne couvre que certaines régions américaines. Paris a été retenu pour la proximité avec la base Neon, chaque requête HTTP déclenchant plusieurs requêtes SQL. Coût réel constaté : quelques centimes par mois.

---

## Diagnostic

| Symptôme                                         | Cause probable                                                |
| ------------------------------------------------ | ------------------------------------------------------------- |
| Le conteneur ne démarre pas                      | `HOST` non défini, ou port codé en dur                        |
| `Cannot find module` au démarrage                | Dépendance runtime déclarée en `devDependencies`              |
| Erreur 500 après changement d'identité           | Propagation IAM non terminée, ou droit manquant sur le secret |
| `Cross-site POST form submissions are forbidden` | En-tête `Content-Type` absent (jobs), ou discordance `Origin` / origine reconstruite (logout, voir Points ouverts) |
| `gcloud` ignore le Dockerfile                    | `Dockerfile` exclu par le `.gcloudignore`                     |
| Épuisement du pool de connexions                 | Endpoint Neon sans `-pooler`, ou `--max-instances` trop élevé |

Journaux :

```bash
gcloud run services logs read teamplanificateur --region europe-west9 --limit 50
```

---

## Points ouverts

### Déconnexion rejetée en production (résolu)

**Symptôme.** `POST /api/logout` depuis le navigateur renvoyait `Cross-site POST form submissions are forbidden`. Les jobs `POST /api/jobs/*` appelés sans en-tête `Origin` passaient.

**Cause.** Astro 5 compare `Origin` à l'origine reconstruite de la requête. Le conteneur Cloud Run reçoit du HTTP en clair. Sans `security.allowedDomains`, l'adaptateur Node ignore le `Host` public et `X-Forwarded-Host` : l'hôte retombe sur `localhost`. Même si `X-Forwarded-Proto: https` est lu, l'origine vue par Astro (`https://localhost`) ne correspond pas à `Origin: https://….run.app`. `astro dev` ne passe pas par ce chemin, d'où l'absence du bug en local. L'appel navigateur est un `POST` de formulaire vers l'URL relative `/api/logout` : ce n'est pas une URL absolue vers un autre domaine.

**Solution.** `security.allowedDomains` dans `apps/web/astro.config.mjs` liste l'hôte Cloud Run stable (`teamplanificateur-521616569803.europe-west9.run.app`), pour faire confiance aux en-têtes transmis par le proxy Google sans ouvrir `*.run.app`. La protection CSRF reste active : un `Origin` d'un autre hôte est toujours rejeté. Ne pas mettre `protocol: "https"` dans le motif sous Astro 5.17.2 (le proto transféré est alors ignoré). Un autre domaine (tag de révision, domaine personnalisé) devra être ajouté à cette liste.

Couvert par `pnpm test:ssr` (serveur construit, pas Hono isolé).
