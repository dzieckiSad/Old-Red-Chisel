# Old Red Chisel — logo

Logo wycięte z białego tła i odtworzone jako grafika wektorowa (SVG). Skaluje się do dowolnego rozmiaru bez utraty jakości.

## Pliki (`public/brand/`)

| Plik | Do czego |
|---|---|
| `logo.svg` | **Główny plik.** Jasne tło (strona, nagłówek). Przezroczyste tło. |
| `logo-on-dark.svg` | Ciemne tło (stopka, zdjęcia). Szary tekst zamieniony na biały. |
| `logo.png`, `logo@2x.png` | PNG z przezroczystością (1200 / 2400 px szer.) — e-maile, social media, dokumenty. |
| `logo-on-dark.png`, `logo-on-dark@2x.png` | To samo w wersji na ciemne tło. |

Oryginał: `assets/brand/logo-original.png`.

## Proporcje

`viewBox="-4 -4 1017 368"` → proporcje **ok. 2,76 : 1** (szerokość : wysokość).
Wystarczy podać **jeden wymiar** — drugi dopasuje się sam.

| Szerokość | Wysokość |
|---|---|
| 120 px | ~43 px |
| 160 px | ~58 px |
| 200 px | ~72 px |
| 280 px | ~101 px |
| 400 px | ~145 px |

## Użycie

```html
<!-- podajesz tylko szerokość w px -->
<img src="/brand/logo.svg" alt="Old Red Chisel Home Improvements" width="200" style="height:auto">

<!-- albo tylko wysokość (np. w nagłówku) -->
<img src="/brand/logo.svg" alt="Old Red Chisel Home Improvements" style="height:48px;width:auto">
```

W aplikacji Next.js powstanie komponent `<Logo width={200} />` / `<Logo height={48} variant="dark" />`, który korzysta z tych plików.

Minimalna czytelna szerokość: **ok. 120 px** (poniżej tego napis „Home Improvements” robi się zbyt mały).

## Kolory marki (z logo)

| Kolor | HEX |
|---|---|
| Czerwień (Red Chisel) | `#B33938` |
| Grafit (tekst) | `#4E4E4E` |
| Biały | `#FFFFFF` |
