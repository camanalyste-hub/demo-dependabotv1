# Démo Dependabot : dépôt de test

Dépôt support de notre présentation de **Dependabot** (cours DevOps, M1 SIGLIS).

L'application est une petite app **React + Vite + TypeScript** qui appelle l'API GitHub avec **axios**. Nous avons **volontairement épinglé axios en version 0.18.0** (février 2018). Au 25/09/2026, 25 failles connues touchent cette version, dont 11 de gravité élevée. Dependabot a donc quelque chose de concret à détecter.

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
| [`.github/dependabot.yml`](.github/dependabot.yml) | Configuration de Dependabot (commentée ligne par ligne) |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Pipeline CI : `npm ci` → `npm test` → `npm run build` sur chaque PR et sur `main` |
| [`src/api/github.ts`](src/api/github.ts) | Code de l'application qui utilise axios |
| [`tests/github.test.js`](tests/github.test.js) | Tests du client axios (lanceur de tests intégré à Node.js, aucune dépendance en plus) |
| [`package.json`](package.json) | `"axios": "0.18.0"` : la dépendance obsolète de la démo |
| [`livrables/`](livrables/) | Synthèse technique (`.docx` et `.pdf`) et présentation (`.pptx`) |

## Lancer le projet en local

Node.js 24 recommandé (c'est la version du CI).

```bash
npm ci          # installe les versions exactes du package-lock.json
npm test        # 2 tests sur le client axios
npm run dev     # lance l'application (http://localhost:5173)
npm run build   # compile (tsc + vite build)
npm audit       # liste les failles connues sans passer par GitHub (axios : 25 avis)
```

## État du dépôt au 25/09/2026

Dependabot a été activé le 23/09/2026. Ses traitements sont visibles dans l'onglet **Actions**, sous le nom « Dependabot Updates ». Lors du premier passage réussi, il a calculé **12 mises à jour de version** mais n'a ouvert que **5 PR** : c'est la limite par défaut (`open-pull-requests-limit`). Il a aussi ouvert **2 PR de sécurité**, qui ne comptent pas dans cette limite.

Nous avons rejoué localement les étapes du CI sur chaque PR (`npm ci`, `npm test`, `npm run build`) :

| PR | Type | Contenu | Résultat CI attendu |
|---|---|---|---|
| #1 | version | `@types/node` 22 → 26 | ✅ |
| #2 | version | `react` + `@types/react` 18 → 19 | ❌ `ERESOLVE` : `@types/react-dom` 18 exige `@types/react` 18 |
| #3 | version | `typescript` 5.9 → 7.0 | ✅ |
| #4 | version | `globals` 15 → 17 | ✅ |
| #5 | version | `@vitejs/plugin-react` 4 → 6 | ❌ `ERESOLVE` : le plugin 6 exige vite 8 |
| #6 | **sécurité** (groupée) | **axios 0.18.0 → 0.33.0** + vite 5 → 8 | ❌ `ERESOLVE` : vite 8 incompatible avec `@vitejs/plugin-react` 4 |
| #7 | sécurité | esbuild (retiré) + vite 5 → 8 | ❌ `ERESOLVE` : même cause que la #6 |

**3 PR passent, 4 cassent l'installation.** C'est l'argument central de la démo : Dependabot ne teste rien, c'est le CI qui protège la branche `main`. Nous avons aussi vérifié en local que les **paquets liés, mis à jour ensemble, passent le CI** : vite 8 avec plugin-react 6, et react 19 avec react-dom 19 et leurs types. Ce sont justement les groupes `vite` et `react` définis dans `dependabot.yml`. **axios 1.20.0 seul passe aussi** ✅.

> Les PR #1 à #7 ont été ouvertes avant l'ajout du CI : le pipeline ne tournera dessus qu'après une mise à jour de la PR (voir « Préparation », étape 3).

## Réglages GitHub (propriétaire du dépôt)

Dans **Settings › Advanced Security** :

- **Dependency graph** : activé ;
- **Dependabot alerts** : `Enable` ;
- **Dependabot security updates** : `Enable` ;
- **Grouped security updates** : `Enable` (déjà actif ; c'est ce qui a produit la PR #6 groupée).

Recommandé : une règle de protection (ou un *ruleset*) sur `main` avec **Require status checks to pass before merging**, et le check **Tests et build** comme obligatoire. Une PR rouge ne pourra alors pas être fusionnée.

> **Droits** : les alertes Dependabot ne sont visibles qu'avec des droits suffisants sur le dépôt. **Présentez depuis le compte propriétaire** (`Diakayeteba`) ou ajoutez votre binôme comme collaborateur avant le jour J.

## Préparation (J-2 / J-1)

1. **Pousser la configuration et le CI**

   ```bash
   git add .github src tests package.json README.md livrables
   git commit -m "feat: CI, tests et configuration Dependabot commentée pour la démo"
   git push
   ```

   Effets attendus (à vérifier dans l'onglet **Actions**) :
   - le workflow **CI** tourne sur `main` et doit être vert ;
   - la modification de `dependabot.yml` relance Dependabot. Le 23/09, un push du fichier avait relancé un passage **6 secondes** plus tard. Avec la limite passée à 10, il ouvre notamment la PR **axios 0.18.0 → 1.20.0** (mise à jour de *version*), ainsi que des PR groupées « vite » et « react ». D'après la documentation, il peut fermer les PR individuelles remplacées par un groupe (#2, #5). Les versions majeures d'ESLint sont ignorées.

2. **Relever les chiffres du jour** : nombre d'alertes axios dans **Security › Dependabot alerts**. La diapo 2 annonce 25 (source : GitHub Advisory Database, 25/09/2026). Si l'onglet affiche un autre total, ajustez la diapo ou dites-le à l'oral.

3. **Faire tourner le CI sur les PR déjà ouvertes** : commenter `@dependabot rebase` sur chaque PR Dependabot encore ouverte. Dependabot rebase la branche, ce qui déclenche le CI. Contrôlez que les résultats correspondent au tableau ci-dessus.

4. **Ne pas fusionner la PR axios → 1.20.0** : c'est elle qui sera fusionnée en direct.

5. **Captures d'écran du plan B** dans `docs/captures/` :

   | Fichier | Contenu |
   |---|---|
   | `01-alertes.png` | Security › Dependabot alerts, filtre `package:axios` |
   | `02-detail-alerte.png` | Détail d'une alerte (ex. CVE-2025-27152) : gravité, versions touchées, version corrigée |
   | `03-pr6-securite.png` | PR #6 : titre, notes de version (« Security Fixes ») |
   | `04-pr6-fichiers.png` | PR #6, onglet *Files changed* : `"axios": "0.18.0"` → `"0.33.0"` |
   | `05-pr6-ci-rouge.png` | Checks de la PR #6 : log `npm ci` avec `ERESOLVE` |
   | `06-pr-axios-verte.png` | PR axios → 1.20.0 avec le check vert |
   | `07-dependabot-updates.png` | Actions › un run « Dependabot Updates » (logs) |
   | `08-alertes-fermees.png` | Alertes axios fermées après fusion (à capturer lors d'une répétition sur une copie du dépôt, voir plus bas) |

## Déroulé de la démo (≈ 8 min)

### Acte 1 : Détecter (1 min 30)

1. Onglet **Security › Dependabot alerts**, filtre `package:axios` : montrer le nombre d'alertes et leur gravité.
2. Ouvrir l'alerte **CVE-2025-27152** (gravité élevée) : versions vulnérables, version corrigée, lien vers l'avis.
3. Message : *« GitHub a comparé notre `package-lock.json` à la GitHub Advisory Database : axios 0.18.0 tombe dans les plages vulnérables. »*
4. Facultatif : **Insights › Dependency graph › Dependabot** (écosystèmes surveillés, dernier passage) et **Actions › Dependabot Updates** (Dependabot tourne sur des runners GitHub Actions).

### Acte 2 : Proposer (2 min)

1. Onglet **Pull requests**, filtre `is:pr author:app/dependabot`.
2. Ouvrir la **PR #6** (sécurité) : titre `build(deps): …`, notes de version d'axios 0.33.0 (rubrique « Security Fixes »), commits, étiquettes `dependencies` / `javascript`, commandes `@dependabot` en bas.
3. Onglet **Files changed** : seuls `package.json` et `package-lock.json` changent.
4. Comparer avec la PR **axios → 1.20.0** :
   - **sécurité** = la version *minimale* qui corrige (0.33.0) ;
   - **version** = la *dernière* version publiée (1.20.0).
5. Ouvrir `.github/dependabot.yml` et rappeler les clés (lien avec la diapo 5).

### Acte 3 : Vérifier (2 min)

1. PR #6 › **Checks** : le CI est **rouge**. Ouvrir le log de `npm ci` : `ERESOLVE`, vite 8 contre `@vitejs/plugin-react` 4.
2. Message : *« Sans CI, on aurait fusionné une PR de sécurité qui casse l'installation. Dependabot ne teste rien. »*
3. Montrer la PR groupée **vite** (vite + plugin-react ensemble) : **verte**. C'est la clé `groups` qui règle le problème.
4. PR **axios → 1.20.0** : **verte**. Nos tests (`getRepoInfo`) passent avec la nouvelle version d'axios.

### Acte 4 : Décider (1 min 30)

1. Relire rapidement la PR axios → 1.20.0, puis **Merge** (squash).
2. Retourner dans **Security › Dependabot alerts** : une fois le graphe de dépendances recalculé, les alertes axios doivent passer à l'état **Closed**. Comptez une à deux minutes : **à vérifier pendant la répétition**, sinon montrer la capture `08`.
3. Dependabot met à jour ou ferme ensuite la PR #6, dont la partie axios est devenue inutile.
4. Conclusion : *« Détecter et proposer : Dependabot. Vérifier : le CI. Décider : nous. »*

## Plan B : si le direct échoue

- **Captures** : `docs/captures/01` à `08`, dans l'ordre des actes.
- **Terminal** (GitHub CLI, compte authentifié) :

  ```bash
  gh pr list --repo Diakayeteba/demo-dependabotv1 --author app/dependabot
  gh pr view 6 --repo Diakayeteba/demo-dependabotv1        # contenu de la PR de sécurité
  gh pr checks 6 --repo Diakayeteba/demo-dependabotv1      # résultat du CI
  gh run list --repo Diakayeteba/demo-dependabotv1 --limit 10   # runs CI et « Dependabot Updates »
  npm audit                                                 # les failles d'axios, en local
  ```

- **Rejouer le CI en local** sur une PR :

  ```bash
  git fetch origin pull/6/head:pr-6 && git checkout pr-6
  npm ci   # échoue avec ERESOLVE : c'est l'acte 3
  git checkout main
  ```

## Reproduire la démo de zéro (répétition sur une copie)

1. Créez un **nouveau dépôt public** vide, par exemple `demo-dependabot-repetition`. Évitez un *fork* : les workflows GitHub Actions y sont désactivés par défaut.
2. Copiez-y ce projet :

   ```bash
   git clone https://github.com/Diakayeteba/demo-dependabotv1 repetition && cd repetition
   git remote set-url origin https://github.com/<vous>/demo-dependabot-repetition.git
   git push -u origin main
   ```

3. Dans **Settings › Advanced Security**, activez Dependency graph, Dependabot alerts, Dependabot security updates et, si vous le souhaitez, Grouped security updates.
4. Attendez quelques minutes. Le 23/09, les premières PR sont apparues **environ 3 minutes** après le push. Suivez l'avancement dans **Actions › Dependabot Updates**.
5. Déroulez les 4 actes, fusion comprise, et prenez la capture `08-alertes-fermees.png`.

## Commandes Dependabot utiles (en commentaire d'une PR)

| Commande | Effet |
|---|---|
| `@dependabot rebase` | Rebase la PR sur `main`, ce qui relance le CI |
| `@dependabot recreate` | Recrée la PR de zéro (écrase les modifications manuelles) |
| `@dependabot ignore <dépendance> major version` | Ferme la PR et ignore les versions majeures de cette dépendance |
| `@dependabot unignore <dépendance>` | Annule les règles d'exclusion de cette dépendance |

## Dépannage

- **Aucune nouvelle PR** : regardez les logs dans **Actions › Dependabot Updates**. Causes possibles : limite de PR atteinte, version publiée depuis moins de 3 jours (*cooldown* par défaut depuis juillet 2026, sauf pour les correctifs de sécurité), alertes ou security updates désactivées.
- **Le CI ne tourne pas sur une PR Dependabot** : la PR date d'avant le workflow. Commentez `@dependabot rebase`.
- **Onglet des alertes invisible** : droits insuffisants. Utilisez le compte propriétaire.
- **CI rouge avec `ERESOLVE`** : c'est attendu sur les PR #2, #5, #6 et #7. C'est la démonstration du rôle du CI, et la raison d'être des `groups`.

## Sources

- GitHub Docs : [Dependabot security updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates), [Dependabot version updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-version-updates), [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference), [Automating Dependabot with GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions)
- [GitHub Changelog (14/07/2026) : cooldown par défaut de 3 jours](https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/)
- [GitHub Advisory Database : avis concernant axios](https://github.com/advisories?query=axios)
- [Post-mortem de la compromission npm d'axios (mars 2026)](https://github.com/axios/axios/issues/10636)
