# Uruchomienie zamówień, płatności i panelu admina

Kod jest gotowy. Żeby działał na prawdziwej stronie, w Vercelu trzeba podłączyć kilka usług
i wpisać ich klucze. Wszystko ustawiasz w: **Vercel → projekt `oldredchisel` → Settings → Environment Variables**.
Po każdej zmianie zmiennych: **Deployments → ⋯ → Redeploy**.

Dopóki czegoś brakuje, strona działa bezpiecznie:
- bez bazy danych i Stripe sklep pokazuje „Online payment opens soon” i numer telefonu,
- bez kluczy Stripe przycisk testowej płatności działa tylko lokalnie, nigdy w Vercelu,
- bez `ADMIN_PATH` panel admina w ogóle nie istnieje (każdy adres daje 404).

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
1. Wymyśl tajny adres, np. `warsztat-7k2q-mf9x` (12+ znaków: litery, cyfry, `-`), i wpisz jako `ADMIN_PATH`.
   Nie zapisuj go w kodzie ani w repozytorium.
2. Wpisz `ADMIN_SETUP_KEY`: losowe 16+ znaków (potrzebne tylko raz).
3. Redeploy, potem otwórz `https://oldredchisel.vercel.app/<ADMIN_PATH>`.
4. Zainstaluj w telefonie **Google Authenticator** lub **Microsoft Authenticator**.
5. Na stronie konfiguracji: wpisz klucz z punktu 2, swój e-mail, hasło (12+ znaków),
   zeskanuj kod QR aplikacją i wpisz 6 cyfr z aplikacji.
6. Od teraz logujesz się: e-mail + hasło + kod z aplikacji. Sesja wygasa po 8 godzinach.

Bezpieczeństwo panelu:
- adres panelu jest tylko w Vercelu; adresy `/admin` i wewnętrzny adres w kodzie zwracają 404,
- hasło jest zaszyfrowane (scrypt), sekret aplikacji 2FA też jest zaszyfrowany w bazie,
- po 5 błędnych próbach logowania na e-mail (10 na adres IP) blokada na 15 minut,
- ciasteczko sesji działa tylko pod tajnym adresem,
- **repozytorium ustaw jako prywatne** (GitHub → Settings → Danger Zone → Change visibility).

## Jak działa zamówienie (dla klienta)
1. Koszyk → **Checkout**: dane, dostawa/montaż/odbiór, płatność kartą na naszej stronie.
2. Po płatności: ekran z **numerem zamówienia** (np. `ORC-7KQ2-M9XD`) i **hasłem** (np. `k7m2-q9xd-4hrt`),
   to samo przychodzi mailem.
3. **Track your order** (link w nagłówku): numer + hasło → status, przewidywana data, notatki z warsztatu.

Ceny są zawsze liczone na serwerze z katalogu, więc nikt nie zmieni ceny w przeglądarce.
Hasło zamówienia jest zapisane tylko jako skrót; czytelna wersja jest kasowana, gdy klient ją zobaczy i dostanie maila.
