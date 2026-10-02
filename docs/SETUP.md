# Uruchomienie zamówień, płatności i panelu admina

Kod jest gotowy. Żeby działał na prawdziwej stronie, w Vercelu trzeba podłączyć kilka usług
i wpisać ich klucze. Wszystko ustawiasz w: **Vercel → projekt `orc` → Settings → Environment Variables**.
Po każdej zmianie zmiennych: **Deployments → ⋯ → Redeploy**.

Dopóki czegoś brakuje, strona działa bezpiecznie:
- bez bazy danych i Stripe sklep pokazuje „Online payment opens soon” i numer telefonu,
- bez kluczy Stripe przycisk testowej płatności działa tylko lokalnie, nigdy w Vercelu,
- bez bazy danych `/admin` pokazuje listę brakujących ustawień (punkt 5).

## 0. Prywatny podgląd (hasło na całą stronę)
Na czas budowy strona może być zamknięta hasłem, żeby widzieli ją tylko Ty i szef.
Vercel → **Settings → Environment Variables** → `SITE_PASSWORD` = hasło do podglądu (6+ znaków) → Redeploy.
Każdy, kto wejdzie na stronę, najpierw zobaczy ekran z hasłem; po wpisaniu przeglądarka pamięta je 30 dni.
Zmiana hasła wylogowuje wszystkich. Przy starcie sklepu usuń `SITE_PASSWORD` i zrób Redeploy.

## 1. Baza danych (Neon, darmowa)
1. Vercel → projekt → **Storage → Create Database → Neon (Serverless Postgres)** → plan Free → region **Europe (Frankfurt lub London)**.
2. Połącz z projektem `orc` (wszystkie środowiska). Vercel sam doda `DATABASE_URL`
   (jeśli w polu **Custom Prefix** wpiszesz własną nazwę, np. `ORCstorage`, strona i tak znajdzie bazę).
3. Tabele tworzą się same przy pierwszym uruchomieniu.

## 1b. Zdjęcia produktów (Vercel Blob, darmowy limit na start)
1. Vercel → projekt → **Storage → Create Database → Blob** → nazwa np. `product-photos`.
2. Połącz z projektem `orc`. Vercel sam doda `BLOB_READ_WRITE_TOKEN`.
3. Od teraz zdjęcia dodane w panelu (Products → produkt → Add photos) trafiają do Blob.

## 2. Sekret sesji
**Opcjonalnie.** Bez niego strona sama tworzy sekret z tajnego adresu bazy danych.
Jeśli chcesz osobny: dodaj `SESSION_SECRET`, losowy ciąg 40+ znaków (np. z generatora haseł). Nigdy go nie udostępniaj.
Jego zmiana wyloguje wszystkich i unieważni niewysłane hasła zamówień, więc ustaw raz.

## 3. Płatności kartą (Stripe)
1. Załóż konto na **stripe.com** (firma, IBAN do wypłat). Na start możesz zostać w **trybie testowym**.
2. **Developers → API keys**: skopiuj
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://orc-five.vercel.app/api/stripe/webhook` (później Twoja domena),
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

Adres: **`https://orc-five.vercel.app/admin`** (później Twoja domena + `/admin`). Znacie go Ty i szef.
Nie ma kont: jest **jeden panel i jedno stałe hasło**, to samo dla Ciebie i szefa.

### Ustawienia w Vercelu (Environment Variables)
| Nazwa | Wartość |
|---|---|
| `SESSION_SECRET` | opcjonalnie, losowe 40+ znaków (punkt 2) |
| `ADMIN_PASSWORD` | hasło do panelu, 8+ znaków (na czas budowy niepotrzebne, patrz niżej) |

Oraz **baza danych** (punkt 1).

**Na czas budowy strony** hasło do panelu to **`admin123`**, jeśli `ADMIN_PASSWORD` nie jest ustawione w Vercelu.
Jest zapisane w kodzie (`src/lib/admin-config.ts`), więc każdy, kto widzi repozytorium, je zna: przed startem
usuwamy je i ustawiamy mocne `ADMIN_PASSWORD`. Potem Redeploy i otwórz `/admin`. Jeśli czegoś brakuje, panel pokaże listę
„Almost there” z tym, co dodać.

**Zmiana hasła:** zmień `ADMIN_PASSWORD` w Vercelu i zrób Redeploy. Wszyscy zalogowani zostaną wylogowani.

### Po skończeniu strony: kod z Google Authenticator
Przed startem zmienimy `TEMP_ADMIN_2FA_OFF` na `false` (`src/lib/admin-config.ts`). Wtedy:
1. Przy pierwszym logowaniu panel pokaże **kod QR**. Zeskanujcie go aplikacją Google Authenticator
   na **obu telefonach** (Twoim i szefa) od razu, bo QR pokazuje się tylko raz.
2. Każde kolejne logowanie: hasło + **6-cyfrowy kod z aplikacji** (zmienia się co 30 sekund).

### Zabezpieczenia panelu
- każda strona i akcja panelu wymaga zalogowania; wewnętrzny adres panelu z kodu zwraca 404,
- hasło nie jest zapisane w kodzie ani w bazie, tylko w ustawieniach Vercela,
- po 10 błędnych próbach z jednego adresu IP (50 łącznie) blokada na 15 minut,
- sesja wygasa po 8 godzinach, ciasteczko działa tylko pod `/admin`,
- **repozytorium ustaw jako prywatne**: GitHub → repozytorium `Old-Red-Chisel` → **Settings** (zakładka u góry,
  na telefonie w menu „…”) → na samym dole **Danger Zone** → **Change visibility** → **Make private** → potwierdź nazwą repozytorium.
  Vercel dalej działa; jeśli poprosi o dostęp, zatwierdź go w GitHub → Settings → Applications → Vercel.

## Produkty w panelu
Panel → **Products**:
- **+ New product**: nazwa, adres strony (tworzy się sam), kategoria, sposób sprzedaży
  (na stanie / na zamówienie / tylko wycena), opis, wymiary, materiał, czas realizacji, zdjęcia,
- **cena i stan magazynu**: stan zmniejsza się sam po każdym opłaconym zamówieniu; przy 0 produkt pokazuje „Sold out”,
- **promocja**: cena promocyjna i (opcjonalnie) ostatni dzień oferty; sklep pokazuje przekreśloną starą cenę,
- **☆ / ★** wyróżnienie na stronie głównej, **↑ ↓** kolejność w sklepie, **Hide / Show** ukrycie bez kasowania,
- usuwanie na dole strony produktu (kasuje też zdjęcia).
Przykładowe produkty zostały wczytane jako widoczne. Zmień je albo ukryj.
Opcje z dopłatami (drewno, wykończenie) są na razie ustawione w kodzie.

## Realizacje (Projects)
Panel → **Projects**: prace pokazywane na stronie **Projects** z suwakiem przed/po.
- **+ New project**: tytuł, miejscowość, rodzaj pracy, krótki opis, historia, materiały, czas realizacji,
- **Before & after**: zdjęcie przed i po. Róbcie oba z tego samego miejsca, żeby suwak się pokrywał,
- **More photos**: dodatkowe zdjęcia pod opisem,
- **★** pokazuje realizację na stronie głównej w „See the difference”, **↑ ↓** kolejność, **Hide / Show** ukrycie.
Na start są 4 przykładowe realizacje z rysowanymi zdjęciami (oznaczone „Example” w panelu i „Example image”
na stronie). Przed startem sklepu podmień zdjęcia na prawdziwe albo usuń te realizacje.

## Ręczne zamówienia (klient nie płaci przez stronę)
Panel → **Orders → + New order**: dla zamówień przez telefon albo na miejscu.
- dane klienta, dostawa lub odbiór, pozycje: produkt ze sklepu albo dowolna pozycja
  (np. „Szafa wnękowa, zaliczka”) z ceną, ilością i szczegółami,
- płatność: gotówka, przelew, karta na miejscu, zaliczka (reszta później) albo płatność przy dostawie/odbiorze,
- status, przewidywana data i notatka dla klienta.
Po zapisaniu panel pokazuje **numer zamówienia i hasło** (i może je wysłać mailem). Klient loguje się nimi
na stronie **Track your order** tak samo jak przy zamówieniu online.
Gdy klient zgubi hasło: otwórz zamówienie → **Customer access → Generate new password**.

## Jak działa zamówienie (dla klienta)
1. Koszyk → **Checkout**: dane, dostawa/montaż/odbiór, płatność kartą na naszej stronie.
2. Po płatności: ekran z **numerem zamówienia** (np. `ORC-7KQ2-M9XD`) i **hasłem** (np. `k7m2-q9xd-4hrt`),
   to samo przychodzi mailem.
3. **Track your order** (link w nagłówku): numer + hasło → status, przewidywana data, notatki z warsztatu.

Ceny są zawsze liczone na serwerze z katalogu, więc nikt nie zmieni ceny w przeglądarce.
Hasło zamówienia jest zapisane tylko jako skrót; czytelna wersja jest kasowana, gdy klient ją zobaczy i dostanie maila.
