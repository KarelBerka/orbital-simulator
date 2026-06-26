# 3D Atomic Orbital Simulator

An interactive 3D simulation of electron probability density in hydrogen-like atomic orbitals ($s, p, d, f$) using Monte Carlo rejection sampling and dynamic phase coloring.

👉 **[Live Demo / Vyzkoušet online](https://karelberka.github.io/orbital-simulator/)**

---

## 🇨🇿 Popis projektu (Czech Description)

Tento simulátor slouží k interaktivní vizualizaci vlnových funkcí $\psi_{n,l,m}$ a hustoty pravděpodobnosti výskytu elektronu $|\psi|^2$ v atomu vodíku. 

Místo prostého zobrazení hotových orbitálních tvarů simulátor ukazuje samotnou podstatu vlnově-částicového dualismu: elektron se chová jako vlna s pravděpodobnostním rozložením, ale při každém měření (kliknutí) se jeho poloha kolabuje do konkrétního bodu v prostoru. Postupným "měřením" a vykreslováním jednotlivých teček se na základě metody Monte Carlo před očima uživatele postupně vykresluje známý tvar vybraného orbitalu.

### Klíčové vlastnosti:
*   **Interaktivní 3D grafika (Three.js)**: Otáčení, přibližování a posouvání orbitalu v prostoru s automatickou rotací kamery.
*   **Fázové barvení**: Částice jsou obarveny na základě znaménka vlnové funkce $\psi$ (kladná fáze $=$ oranžovo-červená, záporná fáze $=$ tyrkysovo-modrá), což vizuálně odděluje jednotlivé vlnové laloky a uzlové plochy.
*   **Simulace měření (Monte Carlo)**: Tlačítka pro určení jedné polohy elektronu (+1) nebo hromadné přidání (+100, +1000) a přepínač pro plynulý automatický tok bodů.
*   **Dynamický 2D řez**: Náhled spojité hustoty pravděpodobnosti (teplotní mapy) v rovinách XY, XZ a YZ s gama korekcí pro zvýraznění vnějších struktur.
*   **Teoretický panel**: Dynamické zobrazování matematické rovnice vybraného orbitalu v LaTeXu (pomocí MathJax) a výpis počtu uzlových ploch.
*   **Světlý a tmavý režim**: Možnost přepínání vzhledu celého rozhraní včetně barev 2D řezu a 3D scény.

---

## 🇬🇧 English Description

This simulator provides an interactive visualization of the hydrogen-like wave functions $\psi_{n,l,m}$ and electron probability densities $|\psi|^2$.

Instead of just rendering static orbital surfaces, the application demonstrates the wave-particle duality. The electron's state is a wave of probability, but upon measurement, it collapses into a single discrete point in space. By repeatedly clicking the simulation buttons, points accumulate using Monte Carlo rejection sampling, gradually forming the visual shape of the selected orbital.

### Key Features:
*   **Interactive 3D View (Three.js)**: OrbitControls (pan, zoom, rotate) with optional auto-rotation.
*   **Phase Coloring**: Points are colored based on the sign of the wave function $\psi$ (positive phase $=$ orange-red, negative phase $=$ cyan-blue), clearly showing the nodal planes and phase transitions.
*   **Measurement Simulation**: Add individual electron positions (+1), batches (+100, +1000), or enable a continuous stream of random points (auto-generation).
*   **2D Cross-section**: View the continuous probability density slice in the XY, XZ, or YZ planes (gammascaled for better contrast).
*   **Theory Panel**: Real-time rendering of the selected state's mathematical equation in LaTeX (via MathJax) and node counts.
*   **Light & Dark Themes**: Fully responsive UI and 3D scenes adapting to your preferred theme.

---

## 🛠️ Technology Stack

*   **HTML5 & CSS3**: Responsive CSS layout with custom variables, glowing effects, and glassmorphism.
*   **JavaScript (ES6 Modules)**: Native browser modules without the need for a bundler or node dependencies.
*   **Three.js (CDN)**: 3D point cloud rendering with additive blending for glowing electron effects.
*   **MathJax (CDN)**: LaTeX equation compiler.

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
