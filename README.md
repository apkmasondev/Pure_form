# APKMASON — PURE FORM

Luksusowa, pełnoekranowa reklama scroll-driven prezentująca fikcyjny zapach **APKMASON — PURE FORM**.

Użytkownik przez cały czas nawigacji pozostaje na jednym ekranie (sticky stage 100svh), a natywny scroll napędza narrację wideo i nakładaną typografię na niewidocznym runwayu o wysokości 1040vh.

## Funkcje i architektura

- **Bezszwowe wideo**: 3 warstwy wideo HTML5 z płynnym przenikaniem opacities (narodziny formy -> ujawnienie -> final packshot).
- **Tło dźwiękowe**: Autorski ambient audio (WebM Opus / MP3) z czystym symbolem głośnika i płynnym fade-in/fade-out głośności.
- **Target vs Rendered Progress**: Wygładzanie wykładnicze z bezwładnością 145 ms (niezależne od 60 Hz / 120 Hz).
- **Limit klatek**: Ograniczenie zmiany klatek do max 2.25 klatki/tick rAF oraz eliminacja bezużytecznych seeków (`< 0.2` klatki).
- **Strefa chroniona**: Nagłówki i teksty narracyjne pojawiają się w narożnikach i strefach bezpiecznych poza flakonem.
- **Responsywność (Desktop / Mobile)**: Osobne pionowe wideo 720 × 1280 dla urządzeń mobilnych oraz stabilna wysokość viewportu na iOS/Android.
- **Luksusowy zestaw favicon**: Autorski monogram wektorowy `A.` w barwach obsidianu i złota champagne (`favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`).
- **Gotowość do GitHub Pages**: Skonfigurowana ścieżka względna (`base: './'`) oraz automatyczny deploy przez GitHub Actions.
- **Dostępność**: Pełne wsparcie dla `prefers-reduced-motion: reduce`.

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz w przeglądarce podany adres (np. `http://localhost:5173`).

## Testy i budowanie

```bash
# Testy jednostkowe Vitest
npm test

# Sprawdzenie typów TypeScript oraz produkcyjny build Vite
npm run build
```

## Wdrożenie na GitHub Pages

Projekt jest przygotowany do bezpośredniej publikacji na GitHub Pages:

1. `git push origin main` — automatyczny deploy przez GitHub Actions (`.github/workflows/deploy.yml`).
2. Lub ręcznie: `npm run deploy` — buduje i publikuje do gałęzi `gh-pages`.
