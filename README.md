# APKMASON — PURE FORM

Luksusowa, pełnoekranowa reklama scroll-driven prezentująca fikcyjny zapach **APKMASON — PURE FORM**.

Użytkownik przez cały czas nawigacji pozostaje na jednym ekranie (sticky stage 100svh), a natywny scroll napędza narrację wideo i nakładaną typografię na niewidocznym runwayu o wysokości 1040vh.

## Funkcje i architektura

- **Jeden master wideo**: pojedynczy strumień HTML5 z przenikaniem ujęć wykonanym w materiale źródłowym — bez wyścigów pomiędzy warstwami i bez błysków na przejściach.
- **Tło dźwiękowe**: Autorski ambient audio (WebM Opus / MP3) z czystym symbolem głośnika i płynnym fade-in/fade-out głośności.
- **Target vs Rendered Progress**: Wygładzanie wykładnicze z bezwładnością 145 ms (niezależne od 60 Hz / 120 Hz).
- **Stabilny limit klatek**: Maksymalna prędkość doganiania 135 klatek materiału/s, niezależna od 60 Hz / 120 Hz, oraz eliminacja bezużytecznych seeków (`< 0.35` klatki).
- **Krótki GOP zamiast GOP1**: H.264 High Profile, 24 fps, GOP 6 (0,25 s), `faststart`; CRF 20 dla 1080p i CRF 22 dla 720×1280.
- **Strefa chroniona**: Nagłówki i teksty narracyjne pojawiają się w narożnikach i strefach bezpiecznych poza flakonem.
- **Responsywność (Desktop / Mobile)**: Osobne pionowe wideo 720 × 1280 dla urządzeń mobilnych oraz stabilna wysokość viewportu na iOS/Android.
- **Luksusowy zestaw favicon**: Autorski monogram wektorowy `A.` w barwach obsidianu i złota champagne (`favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`).
- **Gotowość do GitHub Pages**: Skonfigurowana ścieżka względna (`base: './'`) oraz automatyczny deploy przez GitHub Actions.
- **Dostępność**: Pełne wsparcie dla `prefers-reduced-motion: reduce`.

## Pipeline wideo

Master ma 19 sekund i składa się z dwóch oryginalnych ujęć 10-sekundowych połączonych jednosekundowym przenikaniem. W repozytorium znajdują się dwa warianty tego samego montażu:

- desktop: `1920×1080`, H.264 CRF 20, około 20,7 MB,
- mobile: `720×1280`, centralny kadr 9:16, H.264 CRF 22, około 8,0 MB.

Desktop steruje pojedynczym masterem przez scroll-scrubbing. Mobile odtwarza ten sam montaż natywnie przy użyciu jednego dekodera sprzętowego.

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
