# ExpertPro — Android aplikacija (TWA) — napredak

> Cilj: Android aplikacija za Google Play koja je "omotač" (TWA — Trusted Web
> Activity) oko postojećeg PWA sajta `https://www.expertpro.app`. Ista baza,
> isti Supabase, isti kod sajta — ništa se ne prepravlja na backend-u. Ovo
> NIJE native rewrite (React Native/Flutter) — to je veći, odvojen posao i
> ima smisla tek kasnije, kad bude mnogo više korisnika (videti razgovor sa
> vlasnikom 02.10.2026 — preporuka je bila da se to ne radi na ~500 korisnika).

## Status: Android projekat izgrađen i potpisan (02.10.2026, Claude); assetlinks je objavljen — Play nalog je blokiran do verifikacije, a uređaj još nije testiran

### Provera dozvola i objave (02.10.2026, Codex)

- Na web dashboard je dodat početni vodič za prvi ulazak, sa odvojenim korisničkim koracima za uključivanje push-a i predlog grada (`components/notifications/FirstLaunchPermissions.tsx`). Izmena `4ce42c7` je na Vercelu Ready i oba dugmeta su potvrđena u prijavljenom Chrome dashboardu. Ne pokušavati automatski da odobrite dozvole: Android/browser traži korisnikov pristanak. Na pravom telefonu proveriti oba OS upita, test push dok je aplikacija zatvorena i grad u pretrazi pre bilo kakvog Play upload-a.
- Lokalna rezervna kopija **već postoji** u ignorisanom `ANDROID-KEYSTORE-NE-BRISATI/` folderu Windows repoa: `android.keystore`, potpisani `.apk` i `.aab`. Ranija tvrdnja ispod da su fajlovi samo u Claudeovom cloud okruženju više nije aktuelna. Ne stavljati keystore/lozinku u Git niti javni status; vlasnik treba da čuva i drugu bezbednu kopiju.
- Direktno pregledan potpisani APK: paket `app.expertpro.twa`, `targetSdkVersion=36`, Android dozvole `POST_NOTIFICATIONS`, `ACCESS_FINE_LOCATION` i `ACCESS_COARSE_LOCATION`, aktivna `DelegationService` sa `enableNotification=true` i aktivnosti za traženje dozvole za obaveštenja/lokaciju. SHA-256 potpis APK-a odgovara javnom `assetlinks.json`. Ovo potvrđuje **pripremu paketa**, ne uspešan push/GPS na uređaju.
- Web aplikacija traži push tek posle korisnikovog klika „Uključi push obaveštenja“ i OS dozvole; lokacija se traži na „Predloži najbliži grad“ i pamti pristanak za naredna otvaranja. Dozvole nisu automatski odobrene instalacijom TWA; za pravi test instalirati APK, odobriti dozvole i probati „Pošalji probno obaveštenje“ i predlog grada. Pri proveri ADB nije našao povezan telefon.
- U Chrome Play Console nalog `alenljubisic@gmail.com` jeste **vlasnik** postojećeg ličnog developerskog profila „GermanPro“, ali taj profil i aplikacije su uklonjeni 30.01.2025. zbog nezavršene verifikacije naloga. „Create app“ je onemogućeno i promene neće biti objavljene. Google prikazuje „Complete account verification“; vlasnik mora dovršiti verifikaciju i otkloniti eventualne sledeće probleme pre otpremanja ExpertPro. Ako bi se umesto toga otvarao nov lični nalog, proveriti aktuelno Google pravilo zatvorenog testa (trenutno 12 testera tokom 14 dana) pre očekivanja javnog izdanja.

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

6. **ZAVRŠENO (Codex, 02.10):** Zaostali `.git/index.lock` je uklonjen nakon potvrde da nema aktivnog Git procesa. Commit `d061882` je poslat na `main`; Vercel Production je **Ready**. `assetlinks.json` vraća HTTP 200 sa očekivanim paketom i SHA-256 otiskom na `https://www.expertpro.app/.well-known/assetlinks.json` i `https://expertpro.app/.well-known/assetlinks.json`. Ovo potvrđuje dostupnost fajla, ali ne i Android instalaciju ili Google Play odobrenje.
7. **Google Play Console nalog** — jednokratna registracija, $25 jednokratno, vlasnikov Google nalog. Ovo Claude ne može umesto njega (traži lične/platne podatke).
8. **Upload `.aab` fajla** na Play Console + popunjavanje liste prodavnice (opis, screenshotovi, ikonica, politika privatnosti — link na `/privatnost` koji već postoji, kategorija aplikacije, Data Safety forma).
9. **Google review** (obično 1-7 dana, van naše kontrole) → aplikacija postaje javno dostupna na Play-u.

### Tehnički detalji za Codex / sledeću sesiju
- Projekat je generisan NE kroz interaktivni `bubblewrap init` wizard (pokazao se nepouzdan za automatizaciju), nego direktno pisanjem `twa-manifest.json` fajla preko `@bubblewrap/core` biblioteke (`TwaManifest.fromWebManifest(...)` + ručna izmena `packageId`, `signingKey`, `features.locationDelegation`), pa `bubblewrap build`.
- `build.gradle` izmenjen: `jcenter()` (ukinut servis) zamenjen sa `mavenCentral()` + Google-ov mirror, jer je Maven Central vraćao 429 (too many requests) kroz deljeni proxy.
- Android projekat je prema Claudeovom zapisu u cloud okruženju; rezervna kopija keystore/APK/AAB je sada i u lokalnom ignorisanom `ANDROID-KEYSTORE-NE-BRISATI/` folderu. Keystore se NIKAD ne commit-uje u Git.

### Šta NIJE deo ovog posla (podsetnik)
- Nema prepravke Supabase baze, RLS-a, API ruta — aplikacija samo prikazuje isti sajt.
- Nema odvojenog koda za održavanje — svaka izmena na sajtu se automatski vidi i u Android aplikaciji (to je i poenta TWA pristupa).
- iOS (iPhone) ovo ne pokriva — Apple ne dozvoljava TWA na App Store; iPhone korisnici i dalje koriste PWA ("Dodaj na početni ekran") kao do sad.

---
*Ovaj fajl se ažurira posle svakog završenog koraka. Čitaj pre nastavka rada.*
