# Changelog

All notable changes to the **APKMASON — PURE FORM** project will be documented in this file.

## [1.2.1] - 2026-08-04

### Fixed & Optimized (Mobile GPU Video Decoding)
- **Zredukowano obciążenie dekodera mobilnego o 66%**: W `PerfumeStage.tsx` wyeliminowano seekowanie nieaktywnych, ukrytych warstw wideo na telefonach. Sprzętowy dekoder GPU w telefonie przetwarza teraz wyłącznie aktualnie widoczną warstwę wideo, eliminując przycinanie i zrzucanie klatek.
- **Zoptymalizowano progowy krok klatki**: Zwiększono `MIN_FRAME_DIFFERENCE` do `0.35`, eliminując mikro-jitter i zbędne przesunięcia klatek w odtwarzaczach mobilnych.

## [1.2.0] - 2026-08-04

### Added & Improved (Wariant A - Mobile Auto-Play Reel)
- **Luksusowy spot automatyczny na mobile (Mobile Auto-Play Reel)**: Na telefonach (`isMobile === true`) zlikwidowano męczący 1040vh scroll runway. Strona otwiera się w idealnym kinowym `100dvh` (zero białych pasków, zero skakania paska adresu), a sekwencja wideo i typografia narracyjna odtwarzają się automatycznie od `0.0` do `1.0` w 16 sekund.
- **Zachowanie 100% płynnego scrollowania na Desktopie**: Na komputerach stacjonarnych (`isMobile === false`) natywny scroll runway 1040vh i kontrola rolką myszy pozostały w 100% nienaruszone.

## [1.1.2] - 2026-08-04

### Fixed & Improved
- **Likwidacja białego paska na mobile (Android / iOS)**: Zamieniono wysokość `.stageContainer` z `100svh` na dynamiczne rozciąganie `inset: 0` oraz `height: 100dvh`. Gdy pasek adresu przeglądarki zwija się podczas scrollowania, kontener sceny automatycznie dopasowuje swoją wysokość do 100% widocznego ekranu, eliminując biały pasek na dole.
- **Eliminacja wyścigu klatek (Frame Race Condition)**: W `useVideoFrameController.ts` dodano utrzymywanie zawsze najświeższej wartości docelowej klatki z pętli rAF w reakcji na zdarzenie `onSeeked`, uniemożliwiając wideo powrót do nieaktualnych klatek podczas gwałtownego przewijania.

## [1.1.1] - 2026-08-02

### Fixed & Cleaned (Audyt #2)
- **Usunięto zduplikowany folder `assets/` w katalogu głównym** (~83 MB martwych plików). Wideo i postery były zduplikowane pomiędzy `./assets/` a `./public/assets/`. Vite serwuje wyłącznie z `public/` — duplikat był zbędny.
- **Utworzono brakujący `.gitignore`**: Wykluczono `node_modules/`, `dist/`, `scratch/`, pliki `.wav` (25 MB surowe źródło) oraz pliki systemowe (`.DS_Store`, `Thumbs.db`).
- **Usunięto `ffmpeg-static` z `devDependencies`**: Jednorazowe narzędzie do konwersji audio (~87 MB binarka) nie jest potrzebne do budowania ani publikacji projektu.
- **Usunięto zbędny `public/favicon.png`**: Nadmiarowy plik 19 KB — projekt posiada kompletny zestaw favicon (`favicon.svg`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`).
- **Usunięto martwą klasę CSS `.brandTagline`**: Zdefiniowana w `StoryCopy.module.css`, ale nigdy nie używana w żadnym komponencie TSX.
- **Poprawiono mylący komentarz w `app.css`**: Komentarz przy `height: 1040vh` sugerował, że jest to wartość z PLAN.md — w rzeczywistości jest to fallback CSS, nadpisywany przez JS w `App.tsx`.
- **AudioToggle zmieniony na czysty symbol głośnika**: Usunięto pigułkowy przycisk i tekst `SOUND OFF / SOUND ON`. Teraz jest to minimalistyczny, unoszący się wektor głośnika (przekreślony = wyciszony, z falami dźwięku = aktywny) — czyste, premium, zero szumu wizualnego.

## [1.1.0] - 2026-08-02

### Added & Improved
- **Luksusowe tło dźwiękowe (Luxury Ambiance Audio Integration)**:
  - Przetworzono i zoptymalizowano autorski plik dźwiękowy `White Mist Reveal.wav` (25.8 MB) do dwóch ultra-lekkich formatów webowych: `ambiance.webm` (1.2 MB, WebM Opus 64 kbps) oraz `ambiance.mp3` (1.6 MB, MP3 96 kbps).
  - Utworzono komponent `AudioToggle.tsx` — minimalistyczny wektor głośnika w prawym górnym rogu z łagodnym wyciszaniem/narastaniem głośności (**Smooth Volume Fade-in/Fade-out**).

## [1.0.9] - 2026-08-02

### Added & Improved
- **Luksusowy wskaźnik rozdziałów narracji (`01 / 05`)**: Dodano w lewym dolnym rogu dyskretny, czcionkowy licznik rozdziałów (`01 / 05` -> `05 / 05`) z aktualizacją przez bezpośrednie referencje DOM uwalniający wydajność 60-120 fps.
- **Konfiguracja publikacji na GitHub Pages (`Pure_form.git`)**:
  - Ustawiono `"homepage": "https://apkmasondev.github.io/Pure_form"` w `package.json`.
  - Dodano pakiet `gh-pages` oraz skrypty `npm run predeploy` i `npm run deploy`.
  - Utworzono automatyczny workflow GitHub Actions w `.github/workflows/deploy.yml` do samoczynnej publikacji po dodaniu zmian (`git push`).

## [1.0.8] - 2026-08-02

### Improved & Fixed
- **Korekta timingu dla narracji `PURE FORM.`**: Przesunięto okno wyświetlania napisów `PURE FORM.` na zakładasz `progress 0.79 -> 0.87` (zamiast `0.84 -> 0.90`). Napis wygasza się całkowicie przed klatką `0.88`, eliminując wszelkie nakładanie się na końcowe nakładki piramidy zapachowej (`OLFACTORY PYRAMID`) i przycisku zakupu (`DISCOVER THE SCENT`).

## [1.0.7] - 2026-08-02

### Improved & Fixed
- **Poprawka kontrastu przycisku CTA i nagłówków sekcji**:
  - Przycisk `DISCOVER THE SCENT` zyskał pełny, szlachetny odcień obsidianu (`#111111`) z wyrazistym, białym napisem (`#ffffff`) i miękkim cieniem `box-shadow`, dając perfekcyjną czytelność na jasnym tle wideo.
  - Nagłówki `OLFACTORY PYRAMID` oraz `EXTRAIT DE PARFUM` zmieniono z bladego złota na głęboki, czytelny grafit `#111111` (`font-weight: 600`), likwidując efekt rozmycia na srebrno-białym tle wideo.

## [1.0.6] - 2026-08-02

### Added & Improved
- **Luksusowe wieńczące nakładki na ostatniej klatce (Final Stage Packshot Spec & CTA)**: Zaimplementowano dynamiczną nakładkę na zakładasz `progress 0.88 -> 1.00`:
  - **Lewa strona (Olfactory Pyramid)**: Piramida zapachowa (`TOP: Bergamot · Mineral Amber`, `HEART: Pure Light Accord · Iris`, `BASE: White Musk · Liquid Crystal`).
  - **Prawa strona (Specyfikacja & Przycisk CTA)**: Kategoria `EXTRAIT DE PARFUM`, pojemność `100 ML / 3.4 FL. OZ.` oraz szklany przycisk `DISCOVER THE SCENT` z akcentową ramką szampańskiego złota, fektem hover i responsywnym układem.

## [1.0.5] - 2026-08-02

### Added & Improved
- **Autorska litera `A` w czcionce Cormorant Garamond (Champagne Gold Monogram A)**: Wdrożono zatwierdzony Wariant A — wektorowy kształt wygenerowany bezpośrednio z oficjalnego fontu `Cormorant Garamond TTF`. Przedstawia szlachetną, szeryfową literę `A` w odcieniu szampańskiego złota (`#c5a059`), bez tła i bez zbędnych ozdobników, zachowując 100% czystości formy typograficznej.
- **Wieliformatowe wsparcie (Multi-density Assets)**: Wygenerowano i podłączono w `index.html` zoptymalizowane pliki `favicon.svg` (wektorowy SVG bez tła), `favicon-32x32.png`, `favicon-16x16.png` oraz `apple-touch-icon.png` (180×180 dla urządzeń Apple iOS).

## [1.0.4] - 2026-08-02

### Improved & Fixed
- **Wzmocnienie kontrastu dla `PURE FORM` i `EXPLORE`**: Zmieniono odcień podtytułu `PURE FORM` oraz wskaźnika `EXPLORE` na wyrazisty, ekskluzywny ciemny grafit (`#111111`) spójny z głównym logo `APKMASON.`. Powiększono rozmiar fontu `PURE FORM` (`clamp(0.85rem, 1.6vw, 1.3rem)`) i zwiększono czytelność napisu `EXPLORE` przy zachowaniu biżuteryjnej szampańskiej kropki i animowanej kreski akcentującej.

## [1.0.3] - 2026-08-02

### Added & Improved
- **Wyśrodkowane luksusowe powitanie marki (Centered Intro Logo)**: Wyśrodkowano powitalny monogram marki `APKMASON.`, podtytuł `PURE FORM` oraz wskaźnik `EXPLORE` dokładnie na środku ekranu (`top: 50%`, `left: 50%`). Podczas pierwszego przewijania (`progress 0.00 -> 0.045`) nagłówek płynnie wygasza się (`opacity: 1 -> 0`) i delikatnie unosi do góry, ustępując miejsca aktywnej narracji.

## [1.0.2] - 2026-08-02

### Fixed
- **Ukrycie natywnego paska scrolla (Native Scrollbar Hidden)**: Dodano reguły CSS wykluczające natywny pasek przewijania przeglądarki (`::-webkit-scrollbar { display: none }`, `scrollbar-width: none`), przy jednoczesnym zachowaniu pełnej natywnej nawigacji rolką myszy, touchpadem i gestem.
- **Poprawka ucięcia litery "N" w APKMASON**: Zwiększono `max-width` dla kontenera tekstowego z 340px na `min(600px, 85vw)`, dodano `white-space: nowrap` dla głównych nagłówków oraz zwiększono odstęp od prawej krawędzi (`right: clamp(3rem, 8vw, 8rem)`). Litera "N" oraz akcent szampański są w pełni widoczne.

## [1.0.1] - 2026-08-02

### Fixed & Audited
- **Mobile Centering**: Fixed an issue where direct inline `transform: translateY(...)` assignments overrode CSS `transform: translateX(-50%)` on mobile breakpoints. Refactored to set CSS custom property `--ty` (`transform: translate(-50%, var(--ty, 0px))`), restoring perfect horizontal centering on all mobile screen sizes.
- **Stable Runway Height**: Replaced static CSS `1040vh` with JS-calculated `viewportHeight * 10.4` in `App.tsx` using `useStableViewport`, preventing scroll length recalculation jitter when mobile browser URL bars collapse.
- **Save-Data Network Respect**: Added `navigator.connection.saveData` detection alongside `prefers-reduced-motion` to serve the minimalist static high-res poster experience when data-saver mode is active.
- **Zero-Rerender DOM Ref Architecture**: Confirmed full compliance with PLAN.md §9 ref-based architecture (no React state updates during rAF animation loops).

## [1.0.0] - 2026-08-02

### Added
- Implemented full-screen scroll-driven luxury product experience for APKMASON — PURE FORM fragrance.
- Added 1040vh runway container with sticky `100svh` view stage.
- Integrated 3 HTML5 video layers (`VideoLayer.tsx`) with seamless opacity crossfading (Layer A: narodziny formy, Layer B: reveal, Layer C: packshot).
- Implemented frame-rate independent exponential smoothing hook (`useSmoothedProgress.ts`) with a 145 ms time constant.
- Implemented frame rate controller hook (`useVideoFrameController.ts`) enforcing a max 2.25 frame step per tick to eliminate seek thrashing during rapid scroll.
- Created `StoryCopy.tsx` overlay component placing narrative headlines (`FORMED FROM LIGHT`, `CRAFTED IN SILENCE`, `A SCENT OF PRECISION`, `APKMASON`, `PURE FORM`) safely outside the protected center bottle zone.
- Built `ExperienceLoader.tsx` for fast initial poster display and metadata preloading.
- Configured Vite build with relative asset paths (`base: './'`) for effortless GitHub Pages deployment.
- Added comprehensive unit tests in Vitest for `clamp`, `mapRange`, `timeline`, `smoothing`, and `videoFrameController`.
- Added accessibility support for `prefers-reduced-motion: reduce` with high-resolution static poster display.
- Added complete SEO tags, Open Graph meta, and Google Fonts integration in `index.html`.
