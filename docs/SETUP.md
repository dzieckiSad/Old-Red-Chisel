# Uruchomienie zamówień, płatności i panelu admina

Kod jest gotowy. Żeby działał na prawdziwej stronie, w Vercelu trzeba podłączyć kilka usług
i wpisać ich klucze. Wszystko ustawiasz w: **Vercel → projekt `oldredchisel` → Settings → Environment Variables**.
Po każdej zmianie zmiennych: **Deployments → ⋯ → Redeploy**.

Dopóki czegoś brakuje, strona działa bezpiecznie:
- bez bazy danych i Stripe sklep pokazuje „Online payment opens soon” i numer telefonu,
- bez kluczy Stripe przycisk testowej płatności działa tylko lokalnie, nigdy w Vercelu,
- bez bazy danych `/admin` pokazuje listę brakujących ustawień (punkt 5).

## 1. Baza danych (Neon, darmowa)
1. Vercel → projekt → **Storage → Create Database → Neon (Serverless Postgres)** → plan Free → region **Europe (Frankfurt lub London)**.
2. Połącz z projektem `oldredchisel` (wszystkie środowiska). Vercel sam doda `DATABASE_URL`.
3. Tabele tworzą się same przy pierwszym uruchomieniu.

## 1b. Zdjęcia produktów (Vercel Blob, darmowy limit na start)
1. Vercel → projekt → **Storage → Create Database → Blob** → nazwa np. `product-photos`.
2. Połącz z projektem `oldredchisel`. Vercel sam doda `BLOB_READ_WRITE_TOKEN`.
3. Od teraz zdjęcia dodane w panelu (Products → produkt → Add photos) trafiają do Blob.

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

Adres: **`https://oldredchisel.vercel.app/admin`** (później Twoja domena + `/admin`). Znacie go Ty i szef.
Na czas budowy strony logujesz się **e-mailem i hasłem**. Przed startem włączymy logowanie dwuetapowe
(`TEMP_ADMIN_2FA_OFF` w `src/lib/admin-config.ts`): przy następnym logowaniu panel sam pokaże kod QR
do zeskanowania aplikacją Google Authenticator lub Microsoft Authenticator.

### Ustawienia w Vercelu (Environment Variables)
| Nazwa | Wartość |
|---|---|
| `SESSION_SECRET` | losowe 40+ znaków (punkt 2) |
| `ADMIN_SETUP_KEY` | losowe 16+ znaków, potrzebne raz przy zakładaniu pierwszego konta |

Oraz **baza danych** (punkt 1).

### Pierwsze uruchomienie
1. Ustaw bazę danych i obie zmienne, zrób Redeploy, otwórz `/admin`.
   Jeśli czegoś brakuje, `/admin` pokaże listę „Almost there” z tym, co dodać.
2. Wpisz `ADMIN_SETUP_KEY`, swój e-mail i hasło (12+ znaków). Pierwsze konto można założyć tylko raz.

### Kilka osób (np. Ty i szef)
Panel → **Team** → **Add a person**: e-mail i hasło startowe (przekaż je osobiście). Każdy loguje się swoim kontem
i może zmienić hasło w **Team → My password**. Tam też odbierasz dostęp (**Remove access**).

### Zabezpieczenia panelu
- każda strona i akcja panelu wymaga zalogowania; wewnętrzny adres panelu z kodu zwraca 404,
- hasła są zaszyfrowane (scrypt),
- po 5 błędnych logowaniach na e-mail (10 na adres IP) blokada na 15 minut,
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
