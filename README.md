# Démo Dependabot : dépôt de test

Dépôt support de notre présentation de **Dependabot** (Exposé DevOps - Dependabot, M1 SIGLIS) : Madou DIAKAYETEBA et Mouhamed S. CAMARA.

Dépôt de la démo : **[github.com/camanalyste-hub/demo-dependabotv1](https://github.com/camanalyste-hub/demo-dependabotv1)**

L'application est une petite app **React + Vite + TypeScript** qui appelle l'API GitHub avec **axios**. Nous sommes **volontairement partis d'axios 0.18.0** (février 2018) et de **lodash 4.17.15** pour que Dependabot ait quelque chose de concret à détecter.

## Le fil rouge : 4 étapes

| Étape | Qui agit | Où le voir dans GitHub |
|---|---|---|
| **1. Détecter** | Dependabot (graphe de dépendances + GitHub Advisory Database) | onglet **Security › Dependabot alerts** |
| **2. Proposer** | Dependabot ouvre une pull request | onglet **Pull requests** (auteur `dependabot[bot]`) |
| **3. Vérifier** | Le pipeline CI (GitHub Actions) teste la PR | onglet **Checks** de la PR / onglet **Actions** |
| **4. Décider** | L'équipe relit et fusionne (merge) | bouton **Merge** de la PR |

> Dependabot propose. Le CI vérifie. L'humain décide.

## Contenu du dépôt

| Fichier | Rôle |
|---|---|
| [`.github/dependabot.yml`](.github/dependabot.yml) | Configuration minimale de Dependabot : npm, racine du dépôt, vérification quotidienne |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Pipeline CI : `npm ci` → `npm test` → `npm run build` sur chaque PR et sur `main` |
| [`src/api/github.ts`](src/api/github.ts) | Code de l'application qui utilise axios |
| [`tests/github.test.js`](tests/github.test.js) | Tests du client axios (lanceur de tests intégré à Node.js, aucune dépendance en plus) |
| [`package.json`](package.json) | Dépendances : aujourd'hui `axios 0.34.0`, `lodash 4.18.1`, `vite ^8.3.1` (après les fusions Dependabot) |
| [`livrables/`](livrables/) | Synthèse technique (`.docx` et `.pdf`) et présentation (`.pptx`) |

## Configuration Dependabot actuelle

```yaml
version: 2
updates:
  - package-ecosystem: "npm"   # quoi : package.json + package-lock.json
    directory: "/"             # où : la racine du dépôt
    schedule:
      interval: "daily"        # quand : une vérification par jour
```

Tout ce qui n'est pas écrit prend sa **valeur par défaut** : 5 PR de version ouvertes au maximum, aucun groupe, aucune exclusion, 3 jours d'attente (*cooldown*) avant de proposer une nouvelle version.

La première version du fichier était plus riche : rythme hebdomadaire, limite de 10 PR, `groups` vite et react, `ignore` des versions majeures d'ESLint, second bloc `github-actions`. Elle a été remplacée le 28/09/2026 (commit `0f8b178`) par la version minimale ci-dessus.

## État du dépôt au 07/10/2026

**Alertes** : 37 alertes entre le 28 et le 30/09/2026, **toutes fermées** (*Fixed*).

| Paquet | Alertes | Fermées par |
|---|---|---|
| axios | 27 (dont 12 élevées) | PR n° 9 (25 alertes), puis PR n° 11 (2 alertes publiées le 30/09) |
| lodash | 6 | PR n° 11 |
| vite | 3 | PR n° 10 |
| esbuild (dépendance transitive de vite 5) | 1 | PR n° 10 |

**Pull requests Dependabot** :

| PR | Type | Contenu | CI | État |
|---|---|---|---|---|
| #1 | version (groupe vite) | vite 5 → 8 + `@vitejs/plugin-react` 4 → 6 | ✅ | fermée par Dependabot (groupe retiré de la config) |
| #2 | version (groupe react) | react, react-dom et leurs types 18 → 19 | ✅ | fermée par Dependabot (groupe retiré de la config) |
| #3 | version | lodash 4.17.15 → 4.18.1 | ❌ | fermée par Dependabot (remplacée par la #11) |
| #4 | version | typescript 5.9.3 → 7.0.2 | ❌ | ouverte |
| #5 | version | eslint-plugin-react-refresh 0.4.26 → 0.5.7 | ❌ | ouverte |
| #6 | version | @types/node 22.20.4 → 26.6.2 | ❌ | ouverte |
| #7 | version | globals 15.15.0 → 17.12.0 | ❌ | ouverte |
| #8 | version | axios 0.34.0 → 1.20.0 | ❌ | ouverte |
| #9 | **sécurité** | axios 0.18.0 → 0.33.0 | ❌ | fusionnée |
| #10 | **sécurité** | vite 5.4.21 → 8.3.1, **seul** | ❌ `ERESOLVE` | **fusionnée malgré le CI rouge** |
| #11 | **sécurité** (groupée) | axios 0.33.0 → 0.34.0 + lodash 4.17.15 → 4.18.1 | ❌ | fusionnée |

> **`main` est rouge depuis le 28/09 (15h45).** La PR n° 10 a monté vite en version 8 sans `@vitejs/plugin-react`, resté en 4.7.0, qui n'accepte que vite 4 à 7. `npm ci` échoue avec `ERESOLVE` sur `main` et donc sur toutes les PR suivantes. La branche n'était pas protégée, d'où la fusion possible. C'est l'argument central de la démo.

### Chronologie (heure de Paris)

| Quand | Événement | CI |
|---|---|---|
| 28/09 15:34 | PR n° 1 : vite + plugin-react **groupés** | ✅ |
| 28/09 15:36 | PR n° 10 (sécurité) : vite **seul** 5 → 8 | ❌ `ERESOLVE` |
| 28/09 15:37 | Push du `dependabot.yml` simplifié : Dependabot ferme les PR groupées n° 1 et 2 | — |
| 28/09 15:45 | PR n° 10 fusionnée malgré le rouge | ❌ `main` cassé |
| 28/09 15:54 | PR n° 9 fusionnée (axios 0.33.0) : alertes axios fermées | ❌ (hérité de `main`) |
| 30/09 18:16 | 2 nouveaux avis axios : Dependabot ouvre la PR groupée n° 11 | ❌ (hérité de `main`) |
| 30/09 18:19 | PR n° 11 fusionnée : plus aucune alerte ouverte | ❌ (hérité de `main`) |

## Lancer le projet en local

Node.js 24 recommandé (c'est la version du CI).

```bash
npm ci          # échoue aujourd'hui avec ERESOLVE (voir ci-dessus)
npm test        # 2 tests sur le client axios
npm run dev     # lance l'application (http://localhost:5173)
npm run build   # compile (tsc + vite build)
npm audit       # liste les failles connues sans passer par GitHub
```

## Réglages GitHub (propriétaire du dépôt)

Dans **Settings › Advanced Security** :

- **Dependency graph** : activé ;
- **Dependabot alerts** : `Enable` ;
- **Dependabot security updates** : `Enable` ;
- **Grouped security updates** : `Enable` (c'est ce qui a produit la PR n° 11 groupée).

Recommandé et **non activé à ce jour** : une règle de protection (ou un *ruleset*) sur `main` avec **Require status checks to pass before merging**, et le check **Tests et build** comme obligatoire. Une PR rouge comme la n° 10 n'aurait alors pas pu être fusionnée.

## Déroulé de la démo (≈ 7 min, diapo 7 de la présentation)

### Acte 1 : Détecter

1. Onglet **Security › Dependabot alerts**, filtre **Closed** : 37 alertes (axios, lodash, vite, esbuild).
2. Ouvrir l'alerte **CVE-2025-27152** (gravité élevée) : versions touchées, version corrigée, lien vers l'avis.
3. Message : *« GitHub a comparé notre `package-lock.json` à la GitHub Advisory Database : axios 0.18.0 tombait dans 25 plages vulnérables. »*

### Acte 2 : Proposer

1. Onglet **Pull requests**, filtre `is:pr author:app/dependabot` (avec les fermées).
2. Ouvrir la **PR n° 9** (sécurité) : titre `build(deps): bump axios from 0.18.0 to 0.33.0`, notes de version (« Security Fixes »), onglet **Files changed** : seuls `package.json` et `package-lock.json` changent.
3. Comparer avec la **PR n° 8** (version, axios → 1.20.0) :
   - **sécurité** = une version qui corrige (0.33.0) ;
   - **version** = la *dernière* version publiée (1.20.0).
4. Ouvrir `.github/dependabot.yml` : 6 lignes, le reste est par défaut (diapo 6).

### Acte 3 : Vérifier

1. **PR n° 1** (vite + plugin-react groupés) › **Checks** : **vert**.
2. **PR n° 10** (vite seul) › **Checks** : **rouge**. Ouvrir le log de `npm ci` : `ERESOLVE`, `@vitejs/plugin-react` 4.7.0 contre vite 8.
3. Message : *« Le CI avait prévenu. Dependabot ne teste rien. »*

### Acte 4 : Décider

1. La PR n° 10 a été **fusionnée malgré le rouge**. Onglet **Actions**, workflow **CI** : rouge sur `main` depuis.
2. Message : *« Sans protection de branche, rien n'empêche de fusionner du rouge. »*
3. Conclusion : *« Détecter et proposer : Dependabot. Vérifier : le CI. Décider : nous. »*

## Plan B : si le direct échoue

GitHub CLI, compte authentifié :

```bash
gh pr list   --repo camanalyste-hub/demo-dependabotv1 --author app/dependabot --state all
gh pr view 9 --repo camanalyste-hub/demo-dependabotv1      # PR de sécurité axios
gh pr checks 1  --repo camanalyste-hub/demo-dependabotv1   # groupe vite : vert
gh pr checks 10 --repo camanalyste-hub/demo-dependabotv1   # vite seul : rouge
gh run list  --repo camanalyste-hub/demo-dependabotv1 --limit 10   # runs CI et « Dependabot Updates »
gh api "repos/camanalyste-hub/demo-dependabotv1/dependabot/alerts?per_page=100" --jq 'length'
```

Rejouer l'échec du CI en local :

```bash
npm ci   # échoue avec ERESOLVE sur main : c'est l'acte 3/4
```

## Réparer `main` (après la soutenance)

Monter `@vitejs/plugin-react` en version 6 (compatible vite 8), par exemple en rouvrant un groupe `vite` dans `dependabot.yml` ou à la main :

```bash
npm install -D @vitejs/plugin-react@^6
npm test && npm run build
```

## Commandes Dependabot utiles (en commentaire d'une PR)

| Commande | Effet |
|---|---|
| `@dependabot rebase` | Rebase la PR sur `main`, ce qui relance le CI |
| `@dependabot recreate` | Recrée la PR de zéro (écrase les modifications manuelles) |
| `@dependabot ignore <dépendance> major version` | Ferme la PR et ignore les versions majeures de cette dépendance |
| `@dependabot unignore <dépendance>` | Annule les règles d'exclusion de cette dépendance |

## Dépannage

- **Aucune nouvelle PR** : regardez les logs dans **Actions › Dependabot Updates**. Causes possibles : limite de 5 PR de version atteinte (c'est le cas aujourd'hui : n° 4 à 8), version publiée depuis moins de 3 jours (*cooldown*), alertes ou security updates désactivées.
- **CI rouge avec `ERESOLVE` sur toutes les PR** : `main` est cassé depuis la fusion de la PR n° 10 (voir « Réparer `main` »).
- **Onglet des alertes invisible** : droits insuffisants. Utilisez le compte propriétaire (`camanalyste-hub`).

## Sources

- GitHub Docs : [Dependabot security updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates), [Dependabot version updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-version-updates), [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference), [Automating Dependabot with GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions)
- [GitHub Changelog (14/07/2026) : cooldown par défaut de 3 jours](https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/)
- [GitHub Advisory Database : avis concernant axios](https://github.com/advisories?query=axios)
- [Post-mortem de la compromission npm d'axios (mars 2026)](https://github.com/axios/axios/issues/10636)
