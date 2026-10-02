# ExpertPro — Android aplikacija (TWA) — napredak

> Cilj: Android aplikacija za Google Play koja je "omotač" (TWA — Trusted Web
> Activity) oko postojećeg PWA sajta `https://www.expertpro.app`. Ista baza,
> isti Supabase, isti kod sajta — ništa se ne prepravlja na backend-u. Ovo
> NIJE native rewrite (React Native/Flutter) — to je veći, odvojen posao i
> ima smisla tek kasnije, kad bude mnogo više korisnika (videti razgovor sa
> vlasnikom 02.10.2026 — preporuka je bila da se to ne radi na ~500 korisnika).

## Status: Android projekat izgrađen i potpisan (02.10.2026, Claude) — čeka se samo deploy jednog fajla + vlasnikov Google Play nalog

### Šta je GOTOVO

1. **Alati pripremljeni** (JDK 17, Android SDK platform-tools/platforms/build-tools 36.1.0, `@bubblewrap/cli`) u radnom okruženju.
2. **Android projekat generisan** iz `https://www.expertpro.app/manifest.json`:
   - Application ID (ime paketa, **trajno** jednom kad se prvi put objavi na Play-u): `app.expertpro.twa`
   - Ime: "ExpertPro – Honorarni poslovi u Srbiji", skraćeno "ExpertPro"
   - Boje, ikonice (192/512/maskable) — sve povučeno iz postojećeg `manifest.json`
   - Uključeno: dozvola za lokaciju (geolocation) — potrebno za "predloži najbliži grad" funkciju na sajtu da radi i unutar aplikacije
   - `start_url`: `/dashboard`, orijentacija portret, standalone prikaz
3. **Potpisni ključ (keystore) napravljen** — `android.keystore`, alias `androidkey`, važi 10000 dana (~27 godina). **Lozinka je nasumično generisana, 24 karaktera.** Ovo MORA vlasnik bezbedno da sačuva (npr. u password manager-u) — gubitak keystore fajla ili lozinke znači da se ISTA aplikacija na Play-u nikad više ne može ažurirati, mora se praviti nova (gubi se i broj instalacija/recenzije).
4. **Aplikacija izgrađena i potpisana:**
   - `app-release-signed.apk` (za test instalaciju direktno na telefon)
   - `app-release-bundle.aab` (za upload na Google Play — ovo je fajl koji ide na Play Console)
5. **SHA-256 otisak potpisa izvučen** i upisan u `public/.well-known/assetlinks.json` (kreiran u repo-u) — ovo je fajl koji dokazuje Google-u da aplikacija i sajt `www.expertpro.app` pripadaju istom vlasniku, bez njega bi se u aplikaciji stalno pojavljivala adresna traka pretraživača.

### [ČEKA — treba akcija]

6. **Deploy `assetlinks.json` na produkciju.** Fajl postoji lokalno u repo-u (`public/.well-known/assetlinks.json`) ali git na ovom računaru je trenutno blokiran postojećim `.git/index.lock` fajlom (zaglavljen od ranije — neki git proces se nije uredno završio, ili je neki git klijent/IDE otvoren i drži zaključano). **Treba obrisati `.git\index.lock`** u folderu repozitorijuma (ili zatvoriti program koji drži git zaključan), pa commit-ovati i poslati na `main` → Vercel. Dok taj fajl ne bude živ na sajtu, aplikacija neće proći Google-ovu verifikaciju vlasništva.
7. **Google Play Console nalog** — jednokratna registracija, $25 jednokratno, vlasnikov Google nalog. Ovo Claude ne može umesto njega (traži lične/platne podatke).
8. **Upload `.aab` fajla** na Play Console + popunjavanje liste prodavnice (opis, screenshotovi, ikonica, politika privatnosti — link na `/privatnost` koji već postoji, kategorija aplikacije, Data Safety forma).
9. **Google review** (obično 1-7 dana, van naše kontrole) → aplikacija postaje javno dostupna na Play-u.

### Tehnički detalji za Codex / sledeću sesiju
- Projekat je generisan NE kroz interaktivni `bubblewrap init` wizard (pokazao se nepouzdan za automatizaciju), nego direktno pisanjem `twa-manifest.json` fajla preko `@bubblewrap/core` biblioteke (`TwaManifest.fromWebManifest(...)` + ručna izmena `packageId`, `signingKey`, `features.locationDelegation`), pa `bubblewrap build`.
- `build.gradle` izmenjen: `jcenter()` (ukinut servis) zamenjen sa `mavenCentral()` + Google-ov mirror, jer je Maven Central vraćao 429 (too many requests) kroz deljeni proxy.
- Android projekat i keystore fajl trenutno postoje SAMO u Claude-ovom radnom okruženju (cloud sandbox), nisu deo git repo-a (to je i tačno tako treba — keystore se NIKAD ne commit-uje u git).

### Šta NIJE deo ovog posla (podsetnik)
- Nema prepravke Supabase baze, RLS-a, API ruta — aplikacija samo prikazuje isti sajt.
- Nema odvojenog koda za održavanje — svaka izmena na sajtu se automatski vidi i u Android aplikaciji (to je i poenta TWA pristupa).
- iOS (iPhone) ovo ne pokriva — Apple ne dozvoljava TWA na App Store; iPhone korisnici i dalje koriste PWA ("Dodaj na početni ekran") kao do sad.

---
*Ovaj fajl se ažurira posle svakog završenog koraka. Čitaj pre nastavka rada.*
