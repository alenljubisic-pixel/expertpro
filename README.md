# ExpertPro — Platforma za honorarne poslove u Srbiji

## 🚀 Tehnologije
- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Backend / DB**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Hosting**: Vercel (besplatno za početak)
- **Email**: Supabase Auth (ugrađen) + Resend (opciono, za custom emailove)

---

## 📋 Struktura projekta

```
expertpro/
├── app/
│   ├── (auth)/login/         # Stranica za prijavu
│   ├── (auth)/register/      # Registracija (3 tipa korisnika)
│   ├── auth/callback/        # OAuth callback route
│   ├── admin/                # Admin panel
│   │   ├── users/            # Odobravanje firmi i agencija
│   │   └── poruke/           # Flagovane poruke
│   ├── dashboard/            # Korisnički panel
│   │   ├── profil/           # Uređivanje profila
│   │   └── oglasi/           # Moji oglasi
│   ├── oglasi/               # Lista svih oglasa
│   │   ├── novi/             # Novi oglas
│   │   └── [id]/             # Detalj oglasa
│   ├── radnici/              # Profili radnika
│   ├── profil/[id]/          # Javni profil korisnika
│   └── poruke/               # Chat sistem
├── components/
│   ├── layout/Navbar.tsx
│   ├── layout/Footer.tsx
│   ├── chat/ChatWindow.tsx
│   ├── chat/ConversationList.tsx
│   └── listings/ApplyButton.tsx
├── lib/
│   ├── supabase/client.ts
│   └── supabase/server.ts
├── supabase/schema.sql       # Cela baza podataka
├── types/index.ts
└── middleware.ts
```

---

## ⚙️ SETUP — Uradi jednom pre deploya

### 1. Kreiraj Supabase projekat

1. Idi na https://supabase.com → New project
2. Ime: `expertpro`, Region: EU West
3. Sačuvaj database password

### 2. Pokreni SQL šemu

1. Supabase Dashboard → SQL Editor
2. Otvori fajl `supabase/schema.sql`
3. Kopiraj sve → Run u SQL Editoru

### 3. Auth podešavanja

**Google OAuth:**
1. Supabase → Authentication → Providers → Google → Enable
2. Google Cloud Console → APIs → OAuth 2.0 Client
3. Redirect URI: `https://[TVOJ-PROJEKT].supabase.co/auth/v1/callback`
4. Kopiraj Client ID i Secret u Supabase

**Facebook OAuth:**
1. Supabase → Authentication → Providers → Facebook → Enable
2. Facebook Developers → Create App → Facebook Login
3. Kopiraj App ID i Secret u Supabase

**Site URL:**
- Supabase → Authentication → URL Configuration
- Site URL: `https://expertpro.app`
- Redirect URLs: `https://expertpro.app/**`

### 4. Realtime (za chat)

Pokreni u SQL Editoru:
```sql
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.notifications;
```

### 5. Storage

Supabase → Storage → New bucket:
- `avatars` (Public: DA)
- `documents` (Public: NE)

### 6. Environment varijable

Kreiraj `.env.local` u root-u projekta:
```
NEXT_PUBLIC_SUPABASE_URL=https://[TVOJ-PROJEKT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
NEXT_PUBLIC_APP_URL=https://expertpro.app
```

Vrednosti: Supabase Dashboard → Settings → API

---

## 🌐 Deploy na Vercel

### 1. GitHub

```bash
cd ~/expertpro
git init
git add .
git commit -m "ExpertPro MVP"
git remote add origin https://github.com/TVOJE-IME/expertpro.git
git push -u origin main
```

### 2. Vercel

1. https://vercel.com → New Project → Import iz GitHub
2. Framework: Next.js (auto-detektuje)
3. Environment Variables — dodaj sve iz `.env.local`
4. Deploy → čekaj ~2 min

### 3. Domen

1. Vercel → projekat → Settings → Domains → Add `expertpro.app`
2. Vercel ti daje DNS vrednosti

**DNS kod registrara:**
```
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
```

---

## 🔐 Admin pristup

Postavi sebe kao admina u Supabase SQL Editoru:

```sql
-- Zameni TVOJ-UUID sa tvojim user ID-jem iz Authentication > Users
update public.profiles
set is_verified = true
where id = 'TVOJ-UUID';
```

---

## 💳 Cenovnik (za implementaciju)

| Tip | Mesečna pretplata |
|-----|------------------|
| Fizičko lice | BESPLATNO |
| Firma Basic | 990 RSD |
| Firma Pro | 2.490 RSD |
| Firma Premium | 4.990 RSD |
| Agencija Starter | 7.900 RSD |
| Agencija Pro | 14.900 RSD |

Grace period: 6 meseci za firme i agencije.

Integracija: Stripe (kreditne kartice) ili IPS QR (žiro račun).

---

## ✅ Implementirane funkcionalnosti

- Landing page sa hero, kategorijama, statistikama
- Registracija 3 tipa korisnika (fizičko/firma/agencija)
- Google i Facebook OAuth
- Email/lozinka auth
- Dashboard sa statistikama
- Uređivanje profila (veštine, grad, jezici, bio)
- 3 tipa oglasa: Nudim uslugu / Tražim radnika / Hitno
- Lista oglasa sa filterima (grad, kategorija, tip)
- Detalj oglasa sa prijavom
- Real-time chat između korisnika
- Blokiranje deljenja kontakt info (auto-flag u DB)
- Admin panel (odobravanje firmi, flagovane poruke)
- Javni profili radnika
- Ocenjivanje (DB schema, UI za prikaz)
