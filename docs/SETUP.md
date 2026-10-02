# Uruchomienie zamówień, płatności i panelu admina

Kod jest gotowy. Żeby działał na prawdziwej stronie, w Vercelu trzeba podłączyć kilka usług
i wpisać ich klucze. Wszystko ustawiasz w: **Vercel → projekt `oldredchisel` → Settings → Environment Variables**.
Po każdej zmianie zmiennych: **Deployments → ⋯ → Redeploy**.

Dopóki czegoś brakuje, strona działa bezpiecznie:
- bez bazy danych i Stripe sklep pokazuje „Online payment opens soon” i numer telefonu,
- bez kluczy Stripe przycisk testowej płatności działa tylko lokalnie, nigdy w Vercelu,
- panel admina działa tylko z bazą danych i ustawionymi kluczami (punkt 5).

## 1. Baza danych (Neon, darmowa)
1. Vercel → projekt → **Storage → Create Database → Neon (Serverless Postgres)** → plan Free → region **Europe (Frankfurt lub London)**.
2. Połącz z projektem `oldredchisel` (wszystkie środowiska). Vercel sam doda `DATABASE_URL`.
3. Tabele tworzą się same przy pierwszym uruchomieniu.

## 2. Sekret sesji
Dodaj `SESSION_SECRET`: losowy ciąg 40+ znaków (np. z generatora haseł). Nigdy go nie udostępniaj.
Jego zmiana wyloguje wszystkich i unieważni niewysłane hasła zamówień, więc ustaw raz.

## 3. Płatności kartą (Stripe)
1. Załóż konto na **stripe.com** (firma, IBAN do wypłat). Na start możesz zostać w **trybie testowym**.
2. **Developers → API keys**: skopiuj
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://oldredchisel.vercel.app/api/stripe/webhook` (później Twoja domena),
   - zdarzenie: `payment_intent.succeeded`,
   - skopiuj `Signing secret` → `STRIPE_WEBHOOK_SECRET`.
4. **Settings → Payment methods**: włącz karty, Apple Pay, Google Pay.

W trybie testowym płacisz kartą `4242 4242 4242 4242`, dowolna przyszła data i CVC.

## 4. E-maile z kodem zamówienia (Resend, darmowe do 3000/mies.)
1. Załóż konto na **resend.com**, dodaj domenę (np. `oldredchisel.ie`) i ustaw rekordy DNS, które pokaże.
2. **API Keys → Create** → `RESEND_API_KEY`.
3. `EMAIL_FROM` = np. `Old Red Chisel <orders@oldredchisel.ie>`.

Bez własnej domeny Resend wysyła tylko na Twój własny adres (do testów).

## 5. Panel admina

Logowanie zawsze wymaga **e-maila, hasła i 6-cyfrowego kodu** z aplikacji w telefonie
(Google Authenticator lub Microsoft Authenticator). Do panelu prowadzą dwie drogi:

### Teraz, w trakcie budowy: prosty adres
`https://oldredchisel.vercel.app/admin`. Tymczasowe, na Twoją prośbę. Przed startem strony zostanie
wyłączone (jedna linia w `src/lib/admin-config.ts`) i zostanie tylko wejście z terminala.

### Docelowo: tylko z terminala na Twoim PC
Tajny adres panelu bez przepustki pokazuje zwykłe 404. Przepustkę daje polecenie `npm run admin`
uruchomione na Twoim komputerze: tworzy jednorazowy link ważny 2 minuty i otwiera przeglądarkę.
Przepustka działa w tej przeglądarce 12 godzin; potem logujesz się hasłem i kodem z aplikacji.

### Ustawienia w Vercelu (Environment Variables)
| Nazwa | Wartość |
|---|---|
| `SESSION_SECRET` | losowe 40+ znaków (punkt 2) |
| `ADMIN_SETUP_KEY` | losowe 16+ znaków, potrzebne raz przy zakładaniu konta |
| `ADMIN_PATH` | tajny adres panelu, np. `warsztat-7k2q-mf9x` (12+ znaków: litery, cyfry, `-`) |
| `ADMIN_ACCESS_KEY` | losowe 32+ znaków, klucz do podpisywania przepustek z terminala |

Do prostego adresu `/admin` wystarczą `SESSION_SECRET`, `ADMIN_SETUP_KEY` i **baza danych (punkt 1)**.

### Pierwsze uruchomienie
1. Ustaw zmienne, zrób Redeploy, otwórz `/admin`.
2. Wpisz `ADMIN_SETUP_KEY`, swój e-mail i hasło (12+ znaków).
3. Zeskanuj kod QR aplikacją w telefonie i wpisz 6 cyfr. Konto można założyć tylko raz.

### Wejście z terminala (PC)
Jednorazowo na komputerze: zainstaluj Node.js (20+) i Git, pobierz repozytorium
(`git clone …`, `npm install`), a obok `package.json` utwórz plik `.env.admin`:
```
ADMIN_SITE_URL=https://oldredchisel.vercel.app
ADMIN_PATH=<ten sam co w Vercelu>
ADMIN_ACCESS_KEY=<ten sam co w Vercelu>
```
Potem za każdym razem: `npm run admin`. Plik `.env.admin` nie trafia do repozytorium.

### Zabezpieczenia panelu
- adres wewnętrzny z kodu oraz tajny adres bez przepustki zwracają 404,
- przepustka jest podpisana kluczem, ważna 2 minuty i działa tylko raz,
- hasło zaszyfrowane (scrypt), sekret aplikacji 2FA zaszyfrowany w bazie,
- po 5 błędnych logowaniach na e-mail (10 na adres IP) blokada na 15 minut,
- sesja wygasa po 8 godzinach, ciasteczka działają tylko pod adresem panelu,
- **repozytorium ustaw jako prywatne** (GitHub → Settings → Danger Zone → Change visibility).

## Jak działa zamówienie (dla klienta)
1. Koszyk → **Checkout**: dane, dostawa/montaż/odbiór, płatność kartą na naszej stronie.
2. Po płatności: ekran z **numerem zamówienia** (np. `ORC-7KQ2-M9XD`) i **hasłem** (np. `k7m2-q9xd-4hrt`),
   to samo przychodzi mailem.
3. **Track your order** (link w nagłówku): numer + hasło → status, przewidywana data, notatki z warsztatu.

Ceny są zawsze liczone na serwerze z katalogu, więc nikt nie zmieni ceny w przeglądarce.
Hasło zamówienia jest zapisane tylko jako skrót; czytelna wersja jest kasowana, gdy klient ją zobaczy i dostanie maila.
