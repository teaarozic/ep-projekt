# Contributing Guidelines

Dobrodošli u projekt! Ovaj dokument opisuje osnovna pravila i procese koje tim treba slijediti.

---

## 1. Branch naming

Uvijek koristi konzistentne nazive grana:

- `feature/<opis>` – za nove funkcionalnosti
- `fix/<opis>` – za ispravke bugova
- `chore/<opis>` – za održavanje, dependency update i sl.

**Primjeri:**

- `feature/login-form`
- `fix/navbar-overlap`
- `chore/update-eslint`

---

## 2. Commit messages

Pisati jasne i kratke commit poruke:

- Koristiti sadašnje vrijeme (npr. `Add login form`, a ne `Added login form`).
- Objasniti _što_ commit radi, ne _kako_.

**Primjeri:**

- `Add health check endpoint to Python backend`
- `Fix ESLint config for Jest tests`
- `Update dependencies in package.json`

---

## 3. Pull Requests (PR)

- Svaki PR ide prema grani **develop** (osim ako CTO kaže drukčije).
- U naslov PR-a jasno navesti svrhu:
  `Fix: Correct ESLint setup for Jest`
- U opisu PR-a napisati:
  - **Što** je promijenjeno
  - **Zašto** je promijenjeno
  - Ako je moguće: screenshot/test output

**PR review pravila:**

- Ne mergati vlastiti PR bez odobrenja.
- Najmanje 1 odobrenje mentora prije mergea.

---

## 4. GitHub Actions (CI checks)

Kad napraviš push ili otvoriš PR:

- GitHub Actions pokreće sve testove (Node lint/test, Python lint/test, E2E testove).
- Status vidiš u **PR → Checks** tabu.

### Pravila:

1. **Gledaj samo zadnji commit u PR-u**
   - ✅ `All checks passed` → PR je spreman za merge.
   - ❌ `Some checks failed` → otvori zadnji commit i pogledaj koji test je pukao.

2. **Ako je crveno:**
   - Klikni na workflow (npr. `Lint & Test (Python)`).
   - Pogledaj koji je job/step pao → popravi kod ili testove.
   - Pushaj novi commit.

3. **Stare greške (crveni X u povijesti) ignoriraj.**
   - Bitan je samo zadnji run.

4. **Flakey testovi:**
   - Ako test nekad pada, nekad prolazi → klikni **Re-run jobs**.
   - Ako opet padne → prijavi mentoru, tretira se kao bug.

---

## 5. Code style

- **JavaScript/TypeScript:** ESLint + Prettier (po defaultu `npm run lint`).
- **Python:** flake8 + black.
- Kod mora biti formatiran i proći lint prije PR-a.
- Piši osnovne testove (Jest za frontend/backend, pytest za Python).

---

## 6. Communication

- Koristi Slack za dnevna pitanja.
- Ako zaglaviš duže od 30 minuta, javi se mentoru.
- Ne guraj polovična rješenja bez komentara – napiši što nedostaje.

---

## 7. Merge flow

- Grane se mergaju u `develop`.
- `main` se koristi samo za stabilne release verzije.
- Svaki merge mora imati zelen CI status.

---

## Ukratko (za juniore)

1. Napravi branch → commit → push.
2. Otvori PR prema `develop`.
3. Provjeri da PR ima ✅ All checks passed.
4. Zatraži review.
5. Nakon odobrenja → merge.

---
