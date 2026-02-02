# GitHub Workflows

Ovdje se nalaze svi automatizirani CI/CD workflowi za ovaj projekt.
Workflowi se izvršavaju na GitHub Actions i pomažu u održavanju kvalitete koda, testiranju i stabilnosti aplikacije.

---

## lint.yml

**Naziv:** Lint & Test
**Pokreće se:**

- na svaki `push` prema `main` i `develop`
- na svaki `pull_request` prema `main` i `develop`

**Što radi:**

- Instalira dependencije za frontend i backend
- Pokreće ESLint provjere (`npm run lint`)
- Pokreće unit i integration testove (`npm run test`)
- Osigurava da kod koji ulazi u repo zadovoljava standarde kvalitete, sigurnosti i ima pokrivenost testovima

---

## e2e.yml

**Naziv:** E2E Tests
**Pokreće se:**

- na svaki `pull_request` prema `main` i `develop`

**Što radi:**

- Builda frontend (Next.js)
- Starta backend server u pozadini
- Instalira Playwright i potrebne browser-e
- Pokreće end-to-end testove (`npx playwright test`)
- Osigurava da nova funkcionalnost radi u cijelom sustavu (FE + BE zajedno)

---

## Pravila

1. **Ne spajati PR bez prolaska svih workflowa** (lint, test, e2e).
2. Ako workflow padne, developer mora popraviti greške prije reviewa.
3. Novi feature ili endpoint → **dodati minimalni test** (unit ili e2e).
4. Workflowi se mogu proširivati po potrebi (npr. deploy, vizualni regression testovi).

---

## Korisni linkovi

- [GitHub Actions dokumentacija](https://docs.github.com/en/actions)
- [ESLint dokumentacija](https://eslint.org/docs/latest/)
- [Jest dokumentacija](https://jestjs.io/docs/getting-started)
- [Playwright dokumentacija](https://playwright.dev/docs/intro)
