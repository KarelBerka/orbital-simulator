# 3D Atomic Orbital Simulator

An interactive 3D simulation of electron probability density in hydrogen-like atomic orbitals ($s, p, d, f$) using Monte Carlo rejection sampling, dynamic phase coloring, and real-time 3D contour lines.

👉 **[Live Demo / Vyzkoušet online](https://karelberka.github.io/orbital-simulator/)**

---

## 🇨🇿 Popis projektu (Czech Description)

Tento simulátor slouží k interaktivní vizualizaci vlnových funkcí $\psi_{n,l,m}$ a hustoty pravděpodobnosti výskytu elektronu $|\psi|^2$ v atomu vodíku. 

Místo prostého zobrazení hotových orbitálních tvarů simulátor ukazuje samotnou podstatu vlnově-částicového dualismu: elektron se chová jako vlna s pravděpodobnostním rozložením, ale při každém měření (kliknutí) se jeho poloha kolabuje do konkrétního bodu v prostoru. Postupným "měřením" a vykreslováním jednotlivých teček se na základě metody Monte Carlo před očima uživatele postupně vykresluje známý tvar vybraného orbitalu.

### Klíčové vlastnosti:
*   **Interaktivní 3D grafika (Three.js)**: Otáčení, přibližování a posouvání orbitalu v prostoru s automatickou rotací kamery.
*   **Teoretický 3D tvar (drátěný model)**: Vykreslení hladkých obrysových čar (vrstevnic) pomocí 2D algoritmu *Marching Squares* v ortogonálních řezech prostoru pro kladné i záporné fáze.
*   **Fázové barvení**: Částice jsou obarveny na základě znaménka vlnové funkce $\psi$ (kladná fáze $=$ oranžovo-červená, záporná fáze $=$ tyrkysovo-modrá), což vizuálně odděluje jednotlivé vlnové laloky a uzlové plochy.
*   **Simulace měření (Monte Carlo rejection sampling)**: Tlačítka pro určení jedné polohy elektronu (+1) nebo hromadné přidání (+100, +1000) a přepínač pro plynulý automatický tok bodů.
*   **Dynamický 2D řez a Modal**: Náhled spojité hustoty pravděpodobnosti v rovinách XY, XZ a YZ. Kliknutím na náhled se otevře zvětšený modal překryv (lightbox) s vysokým rozlišením, který se v reálném čase přerenderuje při změně parametrů.
*   **Uzlové statistiky a Matematický popis**: Zobrazování matematické rovnice vybraného orbitalu v LaTeXu (pomocí MathJax) a výpočet radiálních a úhlových uzlových ploch.
*   **Dvojjazyčnost (CZ / EN)**: Rychlé přepínání jazyků pomocí vlajek `🇨🇿` a `🇬🇧` v záhlaví bez ztráty rozpracovaného stavu simulace.
*   **Dynamická legenda fází**: Barevné indikátory fází v HTML legendě se automaticky přebarvují podle zvoleného barevného schématu.
*   **Dynamická favicona**: Ikona na kartě prohlížeče se za běhu automaticky přegeneruje tak, aby zobrazovala zmenšený screenshot aktuálně simulovaného orbitalu.

---

## 🇬🇧 English Description

This simulator provides an interactive visualization of the hydrogen-like wave functions $\psi_{n,l,m}$ and electron probability densities $|\psi|^2$.

Instead of just rendering static orbital surfaces, the application demonstrates the wave-particle duality. The electron's state is a wave of probability, but upon measurement, it collapses into a single discrete point in space. By repeatedly clicking the simulation buttons, points accumulate using Monte Carlo rejection sampling, gradually forming the visual shape of the selected orbital.

### Key Features:
*   **Interactive 3D View (Three.js)**: OrbitControls (pan, zoom, rotate) with optional auto-rotation.
*   **Theoretical 3D Shape (Contour Lines)**: High-quality wireframe representation of orbital boundary surfaces calculated using the *Marching Squares* contour-finding algorithm in orthogonal slices.
*   **Phase Coloring**: Points are colored based on the sign of the wave function $\psi$ (positive phase $=$ orange-red, negative phase $=$ cyan-blue), clearly showing the nodal planes and phase transitions.
*   **Measurement Simulation**: Add individual electron positions (+1), batches (+100, +1000), or enable a continuous stream of random points (auto-generation).
*   **2D Cross-section and Lightbox Zoom**: View the continuous probability density slice in the XY, XZ, or YZ planes. Clicking the slice opens a high-resolution modal overlay that syncs with controls in real time.
*   **Theory Panel**: Real-time rendering of the selected state's mathematical equation in LaTeX (via MathJax) and radial/angular node counts.
*   **Bilingual Interface (CZ / EN)**: Toggle language instantly using `🇨🇿` and `🇬🇧` flags in the header without resetting the point cloud state.
*   **Dynamic Phase Legend**: Colored phase indicator pills in the HTML legend dynamically update their background colors and glows to match the selected color scheme.
*   **Dynamic Favicon**: The browser tab icon changes dynamically at runtime to show a miniature point cloud render of the active orbital state.

---

## 🛠️ Technology Stack

*   **HTML5 & CSS3**: Responsive CSS layout with custom variables, glowing effects, and glassmorphism.
*   **JavaScript (ES6 Modules)**: Native browser modules without the need for a bundler or node dependencies.
*   **Three.js (CDN)**: 3D point cloud rendering with additive blending for glowing electron effects.
*   **MathJax (CDN)**: LaTeX equation compiler.

---

## 👥 Authors & Contribution

*   **Karel Berka** (Univerzita Palackého v Olomouci - UPOL)
*   **Lukáš Peterka** (Vysoká škola chemicko-technologická v Praze - VŠCHT)

---

## 💻 Local Setup (Místní spuštění)

Since the project uses native ES6 JavaScript modules, it should be run via a local web server to avoid CORS issues.

1.  Clone this repository or download the files.
2.  Open your terminal in the project directory and run a local server (e.g., using Python):
    ```bash
    python -m http.server 8000
    ```
3.  Open your browser and navigate to:
    [http://localhost:8000](http://localhost:8000)
