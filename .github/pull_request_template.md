# Pull Request

## Opis

- [ ] Kratak opis što je urađeno i zašto.
- [ ] Povezan JIRA/Trello ticket ili opis zadatka.

## Promjene

- [ ] Nova funkcionalnost
- [ ] Popravak bug-a
- [ ] Refaktor
- [ ] Dokumentacija
- [ ] Drugo: \***\*\_\_\*\***

## Checklist

Prije slanja PR-a, provjeri da si ispoštovao pravila projekta:

### Osnovno

- [ ] Kod je jasan, čitljiv i dosljedan stilu projekta.
- [ ] Nema hardkodiranih vrijednosti (osim ako je to namjerno i dokumentirano).
- [ ] Nema `console.log` u finalnom kodu.
- [ ] Nema dead koda ili nepotrebnih fajlova.

### Sigurnost i stabilnost

- [ ] Nema upotrebe `any` (TypeScript).
- [ ] Dodan je barem osnovni input validation (Zod/schema gdje je primjenjivo).
- [ ] Ako se mijenja backend, dodane su osnovne sigurnosne mjere (rate limit, validation, auth provjera).
- [ ] Nema expozicije osjetljivih podataka (API key, env varijabli).

### Testiranje

- [ ] Dodani ili ažurirani unit testovi.
- [ ] Prošao lokalno `npm run lint` / `npm run test`.
- [ ] Ako je dodana UI komponenta, postoji barem snapshot ili RTL test.
- [ ] Ako je dodan endpoint, pokriven je osnovnim integration testom.

### Dokumentacija

- [ ] Dodan opis u `README.md` ili odgovarajući `docs/` folder.
- [ ] Ako postoji nova konfiguracija ili env varijabla, dodana je u `.env.example`.

## Screenshots / Evidencija

- [ ] Ako je UI promjena, dodaj screenshot/gif.
- [ ] Ako je API promjena, dodaj primjer request/response.

---

**Napomena za reviewere:**
Fokusirati se na:

- sigurnost i validaciju
- jednostavnost i čitljivost rješenja
- pokrivenost testovima
- izbjegavanje over-engineeringa
