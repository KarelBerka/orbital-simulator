import { 
    getOrbitalParams, 
    waveFunction, 
    probabilityDensity, 
    molecularWaveFunction, 
    molecularProbabilityDensity, 
    getMolecularOrbitalParams 
} from './math.js';
import { OrbitalVisualizer } from './visualizer.js';

// Konstanty s názvy orbitalů pro zobrazení
const ORBITAL_NAMES = {
    0: { 0: 's' },
    1: { '-1': 'p_y', 0: 'p_z', 1: 'p_x' },
    2: { '-2': 'd_xy', '-1': 'd_yz', 0: 'd_z²', 1: 'd_xz', 2: 'd_x²-y²' },
    3: {
        '-3': 'f_y(3x²-y²)',
        '-2': 'f_xyz',
        '-1': 'f_yz²',
        0: 'f_z³',
        1: 'f_xz²',
        2: 'f_z(x²-y²)',
        3: 'f_x(x²-3y²)'
    }
};

// Slovník překladů pro vícejazyčnou podporu (CZ / EN)
const TRANSLATIONS = {
    cs: {
        'meta-title': '3D Simulátor Atomových Orbitalů',
        'app-title': 'Atomové Orbitaly <span>Simulátor</span>',
        'app-subtitle': 'Vizualizace hustoty pravděpodobnosti výskytu elektronu pomocí Monte Carlo vzorkování',
        'orbital-selection': 'Výběr Orbitalu',
        'quantum-numbers': 'Kvantová čísla',
        'n-label': 'Hlavní (n)',
        'l-label': 'Vedlejší (l)',
        'm-label': 'Magnetické (m)',
        'quick-presets': 'Rychlé předvolby',
        'generate-positions': 'Generování poloh elektronu',
        'add-1-title': 'Stanoví jednu polohu elektronu',
        'add-100-title': 'Stanoví 100 poloh',
        'add-1000-title': 'Stanoví 1000 poloh',
        'auto-generation': 'Automatické generování',
        'generation-speed': 'Rychlost generování',
        'speed-slow': 'Pomalá',
        'speed-fast': 'Ultra rychlá',
        'clear-points': 'Vymazat body',
        'status-phase': 'Stav a fáze',
        'measured-positions': 'Naměřené polohy',
        'phase-pos': 'Fáze $+$',
        'phase-neg': 'Fáze $-$',
        '2d-slice': '2D Řez orbitalem',
        'plane-xy': 'Rovina XY (z = 0)',
        'plane-xz': 'Rovina XZ (y = 0)',
        'plane-yz': 'Rovina YZ (x = 0)',
        'math-description': 'Matematický popis',
        'theory-para': 'Vlnová funkce $\\psi_{n,l,m}$ popisuje stacionární stav elektronu. Výskyt elektronu (hustota pravděpodobnosti) je dán kvadrátem vlnové funkce $|\\psi|^2$.',
        'nodal-surfaces-title': 'Uzlové plochy (místa s nulovou pravděpodobností)',
        'radial-nodes-label': 'Radiální uzlové plochy ($n-l-1$):',
        'angular-nodes-label': 'Úhlové uzlové plochy ($l$):',
        'total-nodes-label': 'Celkem uzlových ploch ($n-1$):',
        'vis-appearance': 'Zobrazení a vzhled',
        'point-size': 'Velikost bodů',
        'phase-colors': 'Barevné schéma fází',
        'color-orange-cyan': 'Oranžová / Tyrkysová',
        'color-classic': 'Červená / Modrá',
        'color-pink-green': 'Růžová / Zelená',
        'color-purple-yellow': 'Fialová / Žlutá',
        'boundary-threshold': 'Práh tvaru orbitalu (izoplocha)',
        'larger-shell': 'Větší obal',
        'smaller-core': 'Menší jádro',
        'origin-grid': 'Mřížka počátku',
        'show-axes': 'Zobrazit osy XYZ',
        'auto-rotate': 'Auto-rotace scény',
        'theoretical-shape': 'Teoretický tvar (konturový model)',
        'normalize-brightness': 'Normalizovaný jas bodů',
        'show-nuclei': 'Zobrazit jádra atomů',
        'nucleus-z': 'Jádro atomu (Z)',
        'nucleus-z-a': 'Jádro atomu A (Z_A)',
        'nucleus-z-b': 'Jádro atomu B (Z_B)',
        'help-rotate': '🖱️ <b>Levé tlačítko:</b> Rotace scény',
        'help-zoom': '⚙️ <b>Kolečko:</b> Přiblížení (Zoom)',
        'help-pan': '✋ <b>Pravé tlačítko:</b> Posun scény',
        'github-repo': 'GitHub Repozitář',
        'authors-list': 'Autoři: Karel Berka (UPOL) & Lukáš Peterka (VŠCHT)',
        // Nové molekulární klíče
        'tab-atomic-label': 'Atomové orbitaly',
        'tab-molecular-label': 'Molekulové orbitaly (LCAO)',
        'molecular-selection': 'Kombinace Orbitalů (LCAO)',
        'bond-order': 'Násobnost vazby (Kombinace MO)',
        'bond-custom': 'Vlastní MO',
        'bond-single': 'Jednoduchá (σ)',
        'bond-double': 'Dvojnásobná (σ + π)',
        'bond-triple': 'Trojnásobná (σ + 2π)',
        'bond-quadruple': 'Čtyřnásobná (σ + 2π + δ)',
        'mo-components-label': 'Složky orbitalů ve výběru',
        'preset-single': 'Jednoduchá σ',
        'preset-double': 'Dvojnásobná σ+π',
        'preset-triple': 'Trojnásobná σ+2π (N₂)',
        'preset-quadruple': 'Čtyřnásobná σ+2π+δ (Re₂)',
        'nuclei-distance': 'Vzdálenost jader (d)',
        'dist-close': 'Blízko (1a₀)',
        'dist-far': 'Daleko (12a₀)',
        'combination-type': 'Typ kombinace (fázové překrytí)',
        'bonding-label': 'Vazebná (+)',
        'antibonding-label': 'Antivazebná (-)',
        'theory-para-mol': 'Vlnová funkce molekulového orbitalu $\\psi_{MO}$ vzniká lineární kombinací atomových orbitalů $\\psi_A$ a $\\psi_B$. Pravděpodobnost výskytu elektronu je $|\\psi_{MO}|^2$.',
        'mol-type-label': 'Typ orbitalu:',
        'mol-nodes-a-label': 'Uzlové plochy atomu A ($n-1$):',
        'mol-nodes-b-label': 'Uzlové plochy atomu B ($n-1$):',
        'mol-nodal-plane-label': 'Uzlová rovina mezi jádry (z = 0):'
    },
    en: {
        'title': '3D Quantum Orbital Simulator (Hydrogen & LCAO)',
        'sub-title': 'Interactive 3D visualization of atomic and molecular electron probability density',
        'quantum-state': 'Quantum State ($n, l, m$)',
        'n-label': 'Principal ($n$)',
        'l-label': 'Azimuthal ($l$)',
        'm-label': 'Magnetic ($m$)',
        'display-settings': 'Display & Aesthetics',
        'point-size': 'Particle size',
        'color-theme': 'Color Theme',
        'boundary-iso': 'Boundary surface isosurface ($P_{\\text{max}}$)',
        'generate-positions': 'Generate Electron Positions',
        'points-count': 'Simulated points count:',
        'btn-clear': 'Clear points',
        'auto-generate': 'Auto-generate points',
        'gen-speed': 'Generation speed',
        'analysis-tools': '2D Slice & Analysis',
        'slice-plane': 'Slice plane:',
        'btn-fullscreen': '🔍 Enlarge slice',
        'theory-notes': 'Theory & Wave Functions',
        'theory-para-1': 'The electron probability density in hydrogen atom is given by square of normalized wave function $|\\psi_{n,l,m}(r, \\theta, \\phi)|^2$.',
        'radial-nodes': 'Radial nodes ($n-l-1$):',
        'angular-nodes': 'Angular nodal surfaces ($l$):',
        'total-nodes': 'Total nodal surfaces ($n-1$):',
        'legend-positive': 'Positive phase ($+$)',
        'legend-negative': 'Negative phase ($-Short$)',
        'modal-title': 'Interactive 2D Electron Density Slice',
        'close-modal': 'Close',
        'theme-cyan-magenta': 'Cyan & Pink (Standard)',
        'theme-purple-gold': 'Purple & Yellow',
        'theme-orange-turquoise': 'Orange & Turquoise',
        'theme-red-blue': 'Classic Red & Blue',
        'theme-green-pink': 'LIME Green & Pink',
        'theme-classic-bw': 'Classic Dark (White/Gray)',
        'larger-shell': 'Larger shell',
        'smaller-core': 'Smaller core',
        'origin-grid': 'Origin grid',
        'show-axes': 'Show XYZ axes',
        'auto-rotate': 'Auto-rotate scene',
        'theoretical-shape': 'Theoretical shape (contour model)',
        'normalize-brightness': 'Normalized point brightness',
        'show-nuclei': 'Show atomic nuclei',
        'nucleus-z': 'Atomic nucleus (Z)',
        'nucleus-z-a': 'Atom A nucleus (Z_A)',
        'nucleus-z-b': 'Atom B nucleus (Z_B)',
        'help-rotate': '🖱️ <b>Left button:</b> Rotate scene',
        'help-zoom': '⚙️ <b>Wheel:</b> Zoom',
        'help-pan': '✋ <b>Right button:</b> Pan scene',
        'github-repo': 'GitHub Repository',
        'authors-list': 'Authors: Karel Berka (UPOL) & Lukáš Peterka (VŠCHT)',
        // Nové molekulární klíče
        'tab-atomic-label': 'Atomic Orbitals',
        'tab-molecular-label': 'Molecular Orbitals (LCAO)',
        'molecular-selection': 'Orbital Combination (LCAO)',
        'bond-order': 'Bond Order (MO Combination)',
        'bond-custom': 'Custom MO',
        'bond-single': 'Single Bond (σ)',
        'bond-double': 'Double Bond (σ + π)',
        'bond-triple': 'Triple Bond (σ + 2π)',
        'bond-quadruple': 'Quadruple Bond (σ + 2π + δ)',
        'mo-components-label': 'Selected Orbital Components',
        'preset-single': 'Single σ',
        'preset-double': 'Double σ+π',
        'preset-triple': 'Triple σ+2π (N₂)',
        'preset-quadruple': 'Quadruple σ+2π+δ (Re₂)',
        'nuclei-distance': 'Inter-nuclear Distance (d)',
        'dist-close': 'Close (1a₀)',
        'dist-far': 'Far (12a₀)',
        'combination-type': 'Combination Type (phase overlap)',
        'bonding-label': 'Bonding (+)',
        'antibonding-label': 'Antibonding (-)',
        'theory-para-mol': 'The wave function of the molecular orbital $\\psi_{MO}$ is formed by a linear combination of atomic orbitals $\\psi_A$ and $\\psi_B$. The probability of electron occurrence is given by $|\\psi_{MO}|^2$.',
        'mol-type-label': 'Orbital type:',
        'mol-nodes-a-label': 'Nodal surfaces of atom A ($n-1$):',
        'mol-nodes-b-label': 'Nodal surfaces of atom B ($n-1$):',
        'mol-nodal-plane-label': 'Nodal plane between nuclei (z = 0):'
    }
};

// Globální stav aplikace
let visualizer = null;
let currentMode = 'atomic'; // 'atomic' nebo 'molecular'
let currentN = 1;
let currentL = 0;
let currentM = 0;
let currentZ = 1;
let Rmax = 7;
let Pmax = 1;
let Pmax_radial = 1;
let autoGenInterval = null;
let slicePlane = 'xy';
let currentLang = 'cs';
let isModalOpen = false;

// Globální stav pro molekulový režim
let molN_A = 1, molL_A = 0, molM_A = 0;
let molN_B = 1, molL_B = 0, molM_B = 0;
let molZ_A = 1, molZ_B = 1;
let molDistance = 4.0;
let molCombination = 'bonding'; // 'bonding' nebo 'antibonding'
let molBondType = 'custom'; // 'custom', 'single', 'double', 'triple', 'quadruple'
let activeMOComponents = new Set(['custom']);

// Elementy UI (původní atomové)
const selectN = document.getElementById('select-n');
const selectL = document.getElementById('select-l');
const selectM = document.getElementById('select-m');
const selectZ = document.getElementById('select-z');
const btnAdd1 = document.getElementById('btn-add-1');
const btnAdd100 = document.getElementById('btn-add-100');
const btnAdd1000 = document.getElementById('btn-add-1000');
const btnClear = document.getElementById('btn-clear');
const toggleAuto = document.getElementById('toggle-auto');
const sliderSpeed = document.getElementById('slider-speed');
const statCount = document.getElementById('stat-count');
const sliceCanvas = document.getElementById('slice-canvas');
const selectSlicePlane = document.getElementById('select-slice-plane');
const equationBox = document.getElementById('equation-box');
const btnThemeToggle = document.getElementById('btn-theme-toggle');
const btnLangToggle = document.getElementById('btn-lang-toggle');

// Nové elementy UI pro záložky a molekuly
const tabAtomic = document.getElementById('tab-atomic');
const tabMolecular = document.getElementById('tab-molecular');
const selectNA = document.getElementById('select-n-a');
const selectLA = document.getElementById('select-l-a');
const selectMA = document.getElementById('select-m-a');
const selectZA = document.getElementById('select-z-a');
const selectNB = document.getElementById('select-n-b');
const selectLB = document.getElementById('select-l-b');
const selectMB = document.getElementById('select-m-b');
const selectZB = document.getElementById('select-z-b');
const sliderDistance = document.getElementById('slider-distance');
const valDistance = document.getElementById('val-distance');
const btnBonding = document.getElementById('btn-bonding');
const btnAntibonding = document.getElementById('btn-antibonding');

// Molekulární uzlové statistiky
const valMolType = document.getElementById('val-mol-type');
const valMolNodesA = document.getElementById('val-mol-nodes-a');
const valMolNodesB = document.getElementById('val-mol-nodes-b');
const valMolNodalPlane = document.getElementById('val-mol-nodal-plane');

// Modal elementy pro zvětšený 2D řez
const sliceModal = document.getElementById('slice-modal');
const modalSliceCanvas = document.getElementById('modal-slice-canvas');
const modalClose = document.getElementById('modal-close');

// Uzlové statistiky (původní atomové)
const valRadialNodes = document.getElementById('val-radial-nodes');
const valAngularNodes = document.getElementById('val-angular-nodes');
const valTotalNodes = document.getElementById('val-total-nodes');

// Nastavení Three.js prvků v overlay
const sliderPointSize = document.getElementById('slider-point-size');
const selectColors = document.getElementById('select-colors');
const toggleGrid = document.getElementById('toggle-grid');
const toggleAxes = document.getElementById('toggle-axes');
const toggleAutorotate = document.getElementById('toggle-autorotate');
const toggleBoundary = document.getElementById('toggle-boundary');
const toggleNormalizeColor = document.getElementById('toggle-normalize-color');
const toggleNuclei = document.getElementById('toggle-nuclei');
const sliderBoundaryIso = document.getElementById('slider-boundary-iso');

// Spuštění aplikace po načtení DOMu
window.addEventListener('DOMContentLoaded', () => {
    // Inicializace 3D vizualizéru
    visualizer = new OrbitalVisualizer('canvas-container');
    
    // Propojení UI prvků Three.js
    setupThreeControls();
    
    // Propojení fyzikálních ovládacích prvků
    setupPhysicsControls();
    
    // Nastavení výchozího stavu orbitalu
    updateOrbitalState(1, 0, 0);
    updateLegendColors();
    
    // Nastavení výchozího jazyka z URL (např. index.html#en, index.html/#en, ?lang=en apod.)
    const initialLang = detectInitialLanguage();
    setLanguage(initialLang, false);
    
    // Spuštění smyčky pro automatické generování bodů
    startAutoGenLoop();
    
    // Prověřit, zda je spuštěn automatický záchyt ikony (favicony)
    checkAutoCapture();
});


/**
 * Vypočte vlnovou funkci pro konkrétní komponentu molekulového orbitalu.
 */
function getComponentWaveFunction(compKey, x, y, z) {
    const d = molDistance;
    const Z_A = molZ_A;
    const Z_B = molZ_B;
    
    switch (compKey) {
        case 'sigma_1s':
            return molecularWaveFunction(1, 0, 0, 1, 0, 0, d, 1.0, 1.0, x, y, z, Z_A, Z_B);
        case 'sigma_2pz':
            return molecularWaveFunction(2, 1, 0, 2, 1, 0, d, 1.0, -1.0, x, y, z, Z_A, Z_B);
        case 'pi_2px':
            return molecularWaveFunction(2, 1, 1, 2, 1, 1, d, 1.0, 1.0, x, y, z, Z_A, Z_B);
        case 'pi_2py':
            return molecularWaveFunction(2, 1, -1, 2, 1, -1, d, 1.0, 1.0, x, y, z, Z_A, Z_B);
        case 'sigma_3dz2':
            return molecularWaveFunction(3, 2, 0, 3, 2, 0, d, 1.0, 1.0, x, y, z, Z_A, Z_B);
        case 'pi_3dxz':
            return molecularWaveFunction(3, 2, 1, 3, 2, 1, d, 1.0, 1.0, x, y, z, Z_A, Z_B);
        case 'pi_3dyz':
            return molecularWaveFunction(3, 2, -1, 3, 2, -1, d, 1.0, 1.0, x, y, z, Z_A, Z_B);
        case 'delta_3dxy':
            return molecularWaveFunction(3, 2, -2, 3, 2, -2, d, 1.0, 1.0, x, y, z, Z_A, Z_B);
        case 'custom':
        default: {
            const c_A = 1.0;
            const c_B = molCombination === 'bonding' ? 1.0 : -1.0;
            return molecularWaveFunction(
                molN_A, molL_A, molM_A,
                molN_B, molL_B, molM_B,
                d, c_A, c_B, x, y, z, Z_A, Z_B
            );
        }
    }
}

/**
 * Vypočte celkovou hustotu pravděpodobnosti rho = sum |psi_i|^2 a efektivní fázi pro vybranou sadu MO komponent.
 */
function getMultiOrbitalBondData(x, y, z) {
    if (!activeMOComponents || activeMOComponents.size === 0) {
        return { totalP: 0, effectivePsi: 0 };
    }

    let totalP = 0;
    let maxCompP = -1;
    let selectedPsi = 0;

    for (let compKey of activeMOComponents) {
        const psi = getComponentWaveFunction(compKey, x, y, z);
        const p = psi * psi;
        totalP += p;
        if (p > maxCompP) {
            maxCompP = p;
            selectedPsi = psi;
        }
    }

    return {
        totalP,
        effectivePsi: selectedPsi
    };
}

// Pomocné funkce pro vlnové funkce a pravděpodobnosti v závislosti na režimu (Atomový vs LCAO)
function getActiveWaveFunction(x, y, z) {
    if (currentMode === 'atomic') {
        return waveFunction(currentN, currentL, currentM, x, y, z, currentZ);
    } else {
        return getMultiOrbitalBondData(x, y, z).effectivePsi;
    }
}

function getActiveProbabilityDensity(x, y, z) {
    if (currentMode === 'atomic') {
        return probabilityDensity(currentN, currentL, currentM, x, y, z, currentZ);
    } else {
        return getMultiOrbitalBondData(x, y, z).totalP;
    }
}

function setupThreeControls() {
    sliderPointSize.addEventListener('input', (e) => {
        visualizer.setPointSize(parseFloat(e.target.value));
    });
    
    selectColors.addEventListener('change', (e) => {
        visualizer.setColorScheme(e.target.value);
        recolorPoints();
        updateBoundaryContours();
        updateSliceCanvas();
        updateLegendColors();
    });
    
    toggleGrid.addEventListener('change', (e) => {
        visualizer.toggleGrid(e.target.checked);
    });
    
    toggleAxes.addEventListener('change', (e) => {
        visualizer.toggleAxes(e.target.checked);
    });
    
    toggleAutorotate.addEventListener('change', (e) => {
        visualizer.autoRotate = e.target.checked;
    });
    
    toggleBoundary.addEventListener('change', (e) => {
        visualizer.toggleBoundaryShell(e.target.checked);
    });
    
    toggleNormalizeColor.addEventListener('change', () => {
        recolorPoints();
    });
    
    toggleNuclei.addEventListener('change', (e) => {
        visualizer.setNucleiVisibility(e.target.checked);
    });
    
    sliderBoundaryIso.addEventListener('input', () => {
        updateBoundaryContours();
    });
    
    btnThemeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        if (isLight) {
            visualizer.setTheme('light');
        } else {
            visualizer.setTheme('dark');
        }
        updateThemeButtonText();
        recolorPoints();
        updateBoundaryContours();
        updateSliceCanvas();
        updateLegendColors();
    });

    btnLangToggle.addEventListener('click', () => {
        const nextLang = currentLang === 'cs' ? 'en' : 'cs';
        setLanguage(nextLang, true);
    });

    window.addEventListener('hashchange', () => {
        const lang = detectInitialLanguage();
        if (lang !== currentLang) {
            setLanguage(lang, false);
        }
    });
}

function setupPhysicsControls() {
    // Přepínání záložek režimů (Atomový / Molekulový)
    tabAtomic.addEventListener('click', () => setMode('atomic'));
    tabMolecular.addEventListener('click', () => setMode('molecular'));

    // --- Původní atomové ovládání ---
    // Změna kvantového čísla N
    selectN.addEventListener('change', () => {
        const n = parseInt(selectN.value);
        repopulateLSelect(n);
        const l = parseInt(selectL.value);
        repopulateMSelect(l);
        const m = parseInt(selectM.value);
        updateOrbitalState(n, l, m);
    });
    
    // Změna kvantového čísla L
    selectL.addEventListener('change', () => {
        const l = parseInt(selectL.value);
        repopulateMSelect(l);
        const m = parseInt(selectM.value);
        updateOrbitalState(currentN, l, m);
    });
    
    // Změna kvantového čísla M
    selectM.addEventListener('change', () => {
        const m = parseInt(selectM.value);
        updateOrbitalState(currentN, currentL, m);
    });
    
    // Změna protonového čísla Z
    selectZ.addEventListener('change', () => {
        currentZ = parseInt(selectZ.value);
        updateOrbitalState(currentN, currentL, currentM);
    });
    
    // Přednastavené orbitaly (presety)
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Označení aktivního tlačítka
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const n = parseInt(btn.dataset.n);
            const l = parseInt(btn.dataset.l);
            const m = parseInt(btn.dataset.m);
            
            // Synchronizace selectů
            selectN.value = n;
            repopulateLSelect(n);
            selectL.value = l;
            repopulateMSelect(l, m);
            selectZ.value = 1;
            currentZ = 1;
            
            updateOrbitalState(n, l, m);
        });
    });

    // --- Nové molekulové ovládání ---
    // Nastavení Atomu A
    selectNA.addEventListener('change', () => {
        setBondTypeToCustom();
        const n = parseInt(selectNA.value);
        repopulateLSelectGeneric(selectLA, n);
        const l = parseInt(selectLA.value);
        repopulateMSelectGeneric(selectMA, l);
        updateMolecularOrbitalState();
    });
    selectLA.addEventListener('change', () => {
        setBondTypeToCustom();
        const l = parseInt(selectLA.value);
        repopulateMSelectGeneric(selectMA, l);
        updateMolecularOrbitalState();
    });
    selectMA.addEventListener('change', () => {
        setBondTypeToCustom();
        updateMolecularOrbitalState();
    });
    selectZA.addEventListener('change', () => {
        molZ_A = parseInt(selectZA.value);
        updateMolecularOrbitalState();
    });

    // Nastavení Atomu B
    selectNB.addEventListener('change', () => {
        setBondTypeToCustom();
        const n = parseInt(selectNB.value);
        repopulateLSelectGeneric(selectLB, n);
        const l = parseInt(selectLB.value);
        repopulateMSelectGeneric(selectMB, l);
        updateMolecularOrbitalState();
    });
    selectLB.addEventListener('change', () => {
        setBondTypeToCustom();
        const l = parseInt(selectLB.value);
        repopulateMSelectGeneric(selectMB, l);
        updateMolecularOrbitalState();
    });
    selectMB.addEventListener('change', () => {
        setBondTypeToCustom();
        updateMolecularOrbitalState();
    });
    selectZB.addEventListener('change', () => {
        molZ_B = parseInt(selectZB.value);
        updateMolecularOrbitalState();
    });

    // Synchronizace stavu tlačítkových čipů s množinou activeMOComponents
    function syncUIComponentButtons() {
        const chips = document.querySelectorAll('.btn-mo-chip');
        chips.forEach(chip => {
            const comp = chip.dataset.comp;
            if (activeMOComponents.has(comp)) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        const bondOrderButtons = document.querySelectorAll('.btn-bond-order');
        bondOrderButtons.forEach(btn => {
            const bond = btn.dataset.bond;
            let isMatch = false;
            if (bond === 'single' && activeMOComponents.size === 1 && activeMOComponents.has('sigma_2pz')) {
                isMatch = true;
            } else if (bond === 'double' && activeMOComponents.size === 2 && activeMOComponents.has('sigma_2pz') && activeMOComponents.has('pi_2px')) {
                isMatch = true;
            } else if (bond === 'triple' && activeMOComponents.size === 3 && activeMOComponents.has('sigma_2pz') && activeMOComponents.has('pi_2px') && activeMOComponents.has('pi_2py')) {
                isMatch = true;
            } else if (bond === 'quadruple' && activeMOComponents.size === 4 && activeMOComponents.has('sigma_3dz2') && activeMOComponents.has('pi_3dxz') && activeMOComponents.has('pi_3dyz') && activeMOComponents.has('delta_3dxy')) {
                isMatch = true;
            } else if (bond === 'custom' && activeMOComponents.size === 1 && activeMOComponents.has('custom')) {
                isMatch = true;
            }
            
            if (isMatch) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Tlačítka násobnosti vazby (Vlastní, Jednoduchá, Dvojnásobná, Trojnásobná, Čtyřnásobná)
    const bondOrderButtons = document.querySelectorAll('.btn-bond-order');
    bondOrderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const bond = btn.dataset.bond;
            if (bond === 'single') {
                activeMOComponents = new Set(['sigma_2pz']);
                molDistance = 4.0;
            } else if (bond === 'double') {
                activeMOComponents = new Set(['sigma_2pz', 'pi_2px']);
                molDistance = 3.8;
            } else if (bond === 'triple') {
                activeMOComponents = new Set(['sigma_2pz', 'pi_2px', 'pi_2py']);
                molDistance = 3.5;
            } else if (bond === 'quadruple') {
                activeMOComponents = new Set(['sigma_3dz2', 'pi_3dxz', 'pi_3dyz', 'delta_3dxy']);
                molDistance = 3.2;
            } else {
                activeMOComponents = new Set(['custom']);
            }
            sliderDistance.value = molDistance;
            valDistance.textContent = `d = ${molDistance.toFixed(1)} a₀`;
            
            syncUIComponentButtons();
            updateMolecularOrbitalState();
        });
    });

    // Čipy jednotlivých složek orbitalů (.btn-mo-chip) - přepínání více složek současně
    const moChips = document.querySelectorAll('.btn-mo-chip');
    moChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const comp = chip.dataset.comp;
            if (activeMOComponents.has(comp)) {
                activeMOComponents.delete(comp);
            } else {
                activeMOComponents.add(comp);
            }
            
            if (activeMOComponents.size === 0) {
                activeMOComponents.add('custom');
            }
            
            syncUIComponentButtons();
            updateMolecularOrbitalState();
        });
    });

    // Změna vzdálenosti jader
    sliderDistance.addEventListener('input', (e) => {
        molDistance = parseFloat(e.target.value);
        valDistance.textContent = `d = ${molDistance.toFixed(1)} a₀`;
        updateMolecularOrbitalState();
    });

    // Typ kombinace (vazebný / antivazebný)
    btnBonding.addEventListener('click', () => {
        setBondTypeToCustom();
        btnBonding.classList.add('active');
        btnAntibonding.classList.remove('active');
        molCombination = 'bonding';
        updateMolecularOrbitalState();
    });
    btnAntibonding.addEventListener('click', () => {
        setBondTypeToCustom();
        btnAntibonding.classList.add('active');
        btnBonding.classList.remove('active');
        molCombination = 'antibonding';
        updateMolecularOrbitalState();
    });

    // Rychlé předvolby pro molekuly
    const molPresetButtons = document.querySelectorAll('.btn-mol-preset');
    molPresetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            molPresetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyMolecularPreset(btn.dataset.preset);
        });
    });

    // Změna roviny 2D řezu
    selectSlicePlane.addEventListener('change', (e) => {
        slicePlane = e.target.value;
        updateSliceCanvas();
    });

    // Simulace - Tlačítka
    btnAdd1.addEventListener('click', () => addElectrons(1));
    btnAdd100.addEventListener('click', () => addElectrons(100));
    btnAdd1000.addEventListener('click', () => addElectrons(1000));
    
    btnClear.addEventListener('click', () => {
        visualizer.clearPoints();
        updatePointCountUI();
        triggerFaviconUpdate();
    });

    // Kliknutí na 2D řez otevře zvětšený náhled (modal)
    sliceCanvas.addEventListener('click', () => {
        sliceModal.classList.add('open');
        isModalOpen = true;
        updateSliceCanvas(); // Vykreslíme i zvětšenou verzi
    });

    // Zavření modalu tlačítkem X
    modalClose.addEventListener('click', () => {
        sliceModal.classList.remove('open');
        isModalOpen = false;
    });

    // Zavření modalu kliknutím na pozadí
    sliceModal.addEventListener('click', (e) => {
        if (e.target === sliceModal) {
            sliceModal.classList.remove('open');
            isModalOpen = false;
        }
    });

    // Zavření modalu stisknutím klávesy Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            sliceModal.classList.remove('open');
            isModalOpen = false;
        }
    });
}

/**
 * Generické funkce pro dynamické plnění selectů L a M
 */
function repopulateLSelectGeneric(selectL_el, n) {
    const prevVal = selectL_el.value;
    selectL_el.innerHTML = '';
    
    const maxL = Math.min(n - 1, 3);
    const labels = ['0 (s)', '1 (p)', '2 (d)', '3 (f)'];
    
    for (let l = 0; l <= maxL; l++) {
        const opt = document.createElement('option');
        opt.value = l;
        opt.textContent = labels[l];
        selectL_el.appendChild(opt);
    }
    
    if (parseInt(prevVal) <= maxL) {
        selectL_el.value = prevVal;
    } else {
        selectL_el.value = 0;
    }
}

function repopulateMSelectGeneric(selectM_el, l, preserveVal = 0) {
    selectM_el.innerHTML = '';
    
    for (let m = -l; m <= l; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        
        const name = ORBITAL_NAMES[l]?.[m] || m;
        opt.textContent = `${m} (${name})`;
        selectM_el.appendChild(opt);
    }
    
    selectM_el.value = preserveVal;
}

/**
 * Dynamicky naplní select pro L podle zvoleného N (omezeno na s, p, d, f)
 */
function repopulateLSelect(n) {
    repopulateLSelectGeneric(selectL, n);
}

/**
 * Dynamicky naplní select pro M podle zvoleného L
 */
function repopulateMSelect(l, preserveVal = 0) {
    repopulateMSelectGeneric(selectM, l, preserveVal);
}

/**
 * Přepne mezi atomovým a molekulovým režimem
 */
function setMode(mode) {
    currentMode = mode;
    
    if (mode === 'atomic') {
        tabAtomic.classList.add('active');
        tabMolecular.classList.remove('active');
        document.body.classList.remove('mode-molecular');
        document.body.classList.add('mode-atomic');
        
        // Obnovit původní stav atomového orbitalu
        updateOrbitalState(currentN, currentL, currentM);
    } else {
        tabMolecular.classList.add('active');
        tabAtomic.classList.remove('active');
        document.body.classList.remove('mode-atomic');
        document.body.classList.add('mode-molecular');
        
        // Nastavit stav molekulového orbitalu
        updateMolecularOrbitalState();
    }
}

function setBondTypeToCustom() {
    activeMOComponents = new Set(['custom']);
    const chips = document.querySelectorAll('.btn-mo-chip');
    chips.forEach(c => {
        if (c.dataset.comp === 'custom') {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
    const bondOrderButtons = document.querySelectorAll('.btn-bond-order');
    bondOrderButtons.forEach(b => {
        if (b.dataset.bond === 'custom') {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
}

/**
 * Aktualizuje stav molekuly a resetuje simulované body
 */
function updateMolecularOrbitalState() {
    molN_A = parseInt(selectNA.value);
    molL_A = parseInt(selectLA.value);
    molM_A = parseInt(selectMA.value);
    molZ_A = parseInt(selectZA.value);
    
    molN_B = parseInt(selectNB.value);
    molL_B = parseInt(selectLB.value);
    molM_B = parseInt(selectMB.value);
    molZ_B = parseInt(selectZB.value);
    
    let maxR = 5.0;
    let maxP = 0;
    let maxPRadial = 0;
    
    if (!activeMOComponents || activeMOComponents.size === 0) {
        activeMOComponents = new Set(['custom']);
    }
    
    for (let compKey of activeMOComponents) {
        let p;
        switch (compKey) {
            case 'sigma_1s':
                p = getMolecularOrbitalParams(1, 0, 0, 1, 0, 0, molDistance, 1.0, 1.0, molZ_A, molZ_B);
                break;
            case 'sigma_2pz':
                p = getMolecularOrbitalParams(2, 1, 0, 2, 1, 0, molDistance, 1.0, -1.0, molZ_A, molZ_B);
                break;
            case 'pi_2px':
                p = getMolecularOrbitalParams(2, 1, 1, 2, 1, 1, molDistance, 1.0, 1.0, molZ_A, molZ_B);
                break;
            case 'pi_2py':
                p = getMolecularOrbitalParams(2, 1, -1, 2, 1, -1, molDistance, 1.0, 1.0, molZ_A, molZ_B);
                break;
            case 'sigma_3dz2':
                p = getMolecularOrbitalParams(3, 2, 0, 3, 2, 0, molDistance, 1.0, 1.0, molZ_A, molZ_B);
                break;
            case 'pi_3dxz':
                p = getMolecularOrbitalParams(3, 2, 1, 3, 2, 1, molDistance, 1.0, 1.0, molZ_A, molZ_B);
                break;
            case 'pi_3dyz':
                p = getMolecularOrbitalParams(3, 2, -1, 3, 2, -1, molDistance, 1.0, 1.0, molZ_A, molZ_B);
                break;
            case 'delta_3dxy':
                p = getMolecularOrbitalParams(3, 2, -2, 3, 2, -2, molDistance, 1.0, 1.0, molZ_A, molZ_B);
                break;
            case 'custom':
            default: {
                const c_A = 1.0;
                const c_B = molCombination === 'bonding' ? 1.0 : -1.0;
                p = getMolecularOrbitalParams(
                    molN_A, molL_A, molM_A,
                    molN_B, molL_B, molM_B,
                    molDistance, c_A, c_B,
                    molZ_A, molZ_B
                );
                break;
            }
        }
        maxR = Math.max(maxR, p.Rmax);
        maxP = Math.max(maxP, p.Pmax);
        maxPRadial = Math.max(maxPRadial, p.Pmax_radial);
    }
    
    Rmax = maxR;
    Pmax = maxP;
    Pmax_radial = maxPRadial;
    
    // Generování a vykreslení teoretického tvaru (3D vrstevnice)
    updateBoundaryContours();
    visualizer.toggleBoundaryShell(toggleBoundary.checked);
    visualizer.updateNuclei('molecular', molDistance);
    
    // Smazání bodů
    visualizer.clearPoints();
    updatePointCountUI();
    
    // Aktualizace 2D řezu
    updateSliceCanvas();
    
    // Aktualizace teorií a rovnic
    updateTheoryPanel();
}

/**
 * Použije přednastavenou konfiguraci pro molekulu (preset)
 */
function applyMolecularPreset(preset) {
    let nA = 1, lA = 0, mA = 0;
    let nB = 1, lB = 0, mB = 0;
    let d = 4.0;
    let comb = 'bonding';
    
    switch (preset) {
        case 'single_bond':
            activeMOComponents = new Set(['sigma_2pz']);
            d = 4.0;
            break;
        case 'double_bond':
            activeMOComponents = new Set(['sigma_2pz', 'pi_2px']);
            d = 3.8;
            break;
        case 'triple_bond':
            activeMOComponents = new Set(['sigma_2pz', 'pi_2px', 'pi_2py']);
            d = 3.5;
            break;
        case 'quadruple_bond':
            activeMOComponents = new Set(['sigma_3dz2', 'pi_3dxz', 'pi_3dyz', 'delta_3dxy']);
            d = 3.2;
            break;
        case 'sigma_1s':
            activeMOComponents = new Set(['sigma_1s']);
            nA = 1; lA = 0; mA = 0;
            nB = 1; lB = 0; mB = 0;
            d = 3.5;
            comb = 'bonding';
            break;
        case 'sigma_star_1s':
            activeMOComponents = new Set(['custom']);
            nA = 1; lA = 0; mA = 0;
            nB = 1; lB = 0; mB = 0;
            d = 3.5;
            comb = 'antibonding';
            break;
        case 'sigma_2p':
            activeMOComponents = new Set(['sigma_2pz']);
            nA = 2; lA = 1; mA = 0;
            nB = 2; lB = 1; mB = 0;
            d = 5.0;
            comb = 'antibonding';
            break;
        case 'sigma_star_2p':
            activeMOComponents = new Set(['custom']);
            nA = 2; lA = 1; mA = 0;
            nB = 2; lB = 1; mB = 0;
            d = 5.0;
            comb = 'bonding';
            break;
        case 'pi_2p':
            activeMOComponents = new Set(['pi_2px']);
            nA = 2; lA = 1; mA = 1;
            nB = 2; lB = 1; mB = 1;
            d = 4.5;
            comb = 'bonding';
            break;
        case 'pi_star_2p':
            activeMOComponents = new Set(['custom']);
            nA = 2; lA = 1; mA = 1;
            nB = 2; lB = 1; mB = 1;
            d = 4.5;
            comb = 'antibonding';
            break;
        case 'sp_hybrid':
            activeMOComponents = new Set(['custom']);
            nA = 2; lA = 1; mA = 0;
            nB = 1; lB = 0; mB = 0;
            d = 4.0;
            comb = 'bonding';
            break;
    }
    
    molZ_A = 1;
    molZ_B = 1;
    selectZA.value = 1;
    selectZB.value = 1;
    
    selectNA.value = nA;
    repopulateLSelectGeneric(selectLA, nA);
    selectLA.value = lA;
    repopulateMSelectGeneric(selectMA, lA, mA);
    
    selectNB.value = nB;
    repopulateLSelectGeneric(selectLB, nB);
    selectLB.value = lB;
    repopulateMSelectGeneric(selectMB, lB, mB);
    
    sliderDistance.value = d;
    valDistance.textContent = `d = ${d.toFixed(1)} a₀`;
    molDistance = d;
    
    molCombination = comb;
    if (comb === 'bonding') {
        btnBonding.classList.add('active');
        btnAntibonding.classList.remove('active');
    } else {
        btnAntibonding.classList.add('active');
        btnBonding.classList.remove('active');
    }

    const chips = document.querySelectorAll('.btn-mo-chip');
    chips.forEach(c => {
        if (activeMOComponents.has(c.dataset.comp)) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
    
    updateMolecularOrbitalState();
}

/**
 * Vygeneruje LaTeX zápis molekulární vlnové funkce
 */
function getMolecularLatexFormula() {
    if (activeMOComponents.has('custom') && activeMOComponents.size === 1) {
        const labelA = ORBITAL_NAMES[molL_A]?.[molM_A] || molM_A;
        const labelB = ORBITAL_NAMES[molL_B]?.[molM_B] || molM_B;
        const sign = molCombination === 'bonding' ? '+' : '-';
        
        const zAPart = molZ_A === 1 ? '' : `; Z_A = ${molZ_A}`;
        const zBPart = molZ_B === 1 ? '' : `; Z_B = ${molZ_B}`;
        
        return `$$\\psi_{\\text{MO}} = \\psi_{${molN_A}, \\text{${labelA}}}(\\mathbf{r}_A${zAPart}) ${sign} \\psi_{${molN_B}, \\text{${labelB}}}(\\mathbf{r}_B${zBPart})$$`;
    }

    const parts = [];
    if (activeMOComponents.has('sigma_1s')) parts.push('|\\psi_{\\sigma_{1s}}|^2');
    if (activeMOComponents.has('sigma_2pz')) parts.push('|\\psi_{\\sigma_{2p_z}}|^2');
    if (activeMOComponents.has('pi_2px')) parts.push('|\\psi_{\\pi_{2p_x}}|^2');
    if (activeMOComponents.has('pi_2py')) parts.push('|\\psi_{\\pi_{2p_y}}|^2');
    if (activeMOComponents.has('sigma_3dz2')) parts.push('|\\psi_{\\sigma_{3d_{z^2}}}|^2');
    if (activeMOComponents.has('pi_3dxz')) parts.push('|\\psi_{\\pi_{3d_{xz}}}|^2');
    if (activeMOComponents.has('pi_3dyz')) parts.push('|\\psi_{\\pi_{3d_{yz}}}|^2');
    if (activeMOComponents.has('delta_3dxy')) parts.push('|\\psi_{\\delta_{3d_{xy}}}|^2');
    if (activeMOComponents.has('custom')) {
        const labelA = ORBITAL_NAMES[molL_A]?.[molM_A] || molM_A;
        const labelB = ORBITAL_NAMES[molL_B]?.[molM_B] || molM_B;
        parts.push(`|\\psi_{\\text{LCAO}(${molN_A}${labelA}+${molN_B}${labelB})}|^2`);
    }

    if (parts.length === 0) {
        return `$$\\rho_{\\text{total}} = 0$$`;
    }

    return `$$\\rho_{\\text{total}} = ${parts.join(' + ')}$$`;
}

/**
 * Změna aktuálního orbitalu a reset simulace
 */
function updateOrbitalState(n, l, m) {
    currentN = n;
    currentL = l;
    currentM = m;
    currentZ = parseInt(selectZ.value);
    
    // Získání fyzikálních parametrů (krychle a maximum pravděpodobnosti)
    const params = getOrbitalParams(n, l, m, currentZ);
    Rmax = params.Rmax;
    Pmax = params.Pmax;
    Pmax_radial = params.Pmax_radial;
    
    // Generování a vykreslení teoretického tvaru orbitalu (3D vrstevnice)
    updateBoundaryContours();
    visualizer.toggleBoundaryShell(toggleBoundary.checked);
    visualizer.updateNuclei('atomic', 0);
    
    // Smazání stávajících bodů
    visualizer.clearPoints();
    updatePointCountUI();
    
    // Aktualizace 2D řezu
    updateSliceCanvas();
    
    // Aktualizace teoretického panelu a uzlových statistik
    updateTheoryPanel();
    
    // Zrušení označení presetu, pokud aktuální stav neodpovídá žádnému tlačítku
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(btn => {
        if (parseInt(btn.dataset.n) === n && parseInt(btn.dataset.l) === l && parseInt(btn.dataset.m) === m) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Vygeneruje a přidá elektronové polohy
 */
function addElectrons(count) {
    const normalizeColor = toggleNormalizeColor.checked;
    for (let i = 0; i < count; i++) {
        const pt = sampleElectronPosition(currentN, currentL, currentM, Rmax, Pmax);
        
        let scale = 1.0;
        if (normalizeColor) {
            const P = pt.phase * pt.phase;
            scale = Math.pow(Math.min(1.0, P / Pmax), 0.32);
        }
        
        visualizer.addPoint(pt.x, pt.y, pt.z, pt.phase, scale);
    }
    updatePointCountUI();
    triggerFaviconUpdate();
}

/**
 * Generování polohy elektronu metodou Rejection Sampling
 */
function sampleElectronPosition(n, l, m, Rmax, Pmax) {
    let attempts = 0;
    const maxAttempts = 30000; // Zvýšíme limit pro vyšší spolehlivost
    
    while (attempts < maxAttempts) {
        attempts++;
        
        // Vzorkování rovnoměrně v rámci sférických souřadnic
        const r = Math.random() * Rmax;
        const cosTheta = Math.random() * 2 - 1;
        const theta = Math.acos(cosTheta);
        const phi = Math.random() * 2 * Math.PI;
        
        // Převod na kartézské souřadnice
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);
        
        const psi = getActiveWaveFunction(x, y, z);
        const P = psi * psi;
        
        // Vážená pravděpodobnost akceptace s Jacobianem r^2
        const P_radial = r * r * P;
        
        const P_rand = Math.random() * Pmax_radial;
        if (P_rand < P_radial) {
            return { x, y, z, phase: psi };
        }
    }
    
    return { x: 0, y: 0, z: 0, phase: 0 };
}

function updatePointCountUI() {
    statCount.textContent = visualizer.pointCount.toLocaleString(currentLang === 'cs' ? 'cs-CZ' : 'en-US');
}

/**
 * Vykreslí 2D řez orbitalem do zadaného Canvasu
 */
function drawSlice(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    
    const colorPos = visualizer.colorPos;
    const colorNeg = visualizer.colorNeg;
    const isLightMode = document.body.classList.contains('light-mode');
    
    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const fx = ((px / width) * 2 - 1) * Rmax;
            const fy = ((1 - py / height) * 2 - 1) * Rmax;
            
            let x = 0, y = 0, z = 0;
            if (slicePlane === 'xy') {
                x = fx; y = fy; z = 0;
            } else if (slicePlane === 'xz') {
                x = fx; y = 0; z = fy;
            } else if (slicePlane === 'yz') {
                x = 0; y = fx; z = fy;
            }
            
            const psi = getActiveWaveFunction(x, y, z);
            const P = psi * psi;
            
            const normP = Math.min(1.0, P / Pmax);
            const intensity = Math.pow(normP, 0.55);
            
            const idx = (py * width + px) * 4;
            const color = psi >= 0 ? colorPos : colorNeg;
            
            if (isLightMode) {
                imgData.data[idx] = Math.round(255 - intensity * (255 - color.r * 255));
                imgData.data[idx + 1] = Math.round(255 - intensity * (255 - color.g * 255));
                imgData.data[idx + 2] = Math.round(255 - intensity * (255 - color.b * 255));
            } else {
                imgData.data[idx] = Math.round(intensity * color.r * 255);
                imgData.data[idx + 1] = Math.round(intensity * color.g * 255);
                imgData.data[idx + 2] = Math.round(intensity * color.b * 255);
            }
            imgData.data[idx + 3] = 255;
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
    
    ctx.strokeStyle = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

/**
 * Vykreslí 2D řez orbitalem do vedlejšího Canvasu a případně do modálního zvětšení
 */
function updateSliceCanvas() {
    drawSlice(sliceCanvas);
    if (isModalOpen) {
        drawSlice(modalSliceCanvas);
    }
}

/**
 * Spustí periodickou smyčku pro automatické generování bodů
 */
function startAutoGenLoop() {
    const genStep = () => {
        if (toggleAuto.checked) {
            const speed = parseInt(sliderSpeed.value);
            const pointsPerFrame = Math.max(1, Math.floor(speed / 8));
            addElectrons(pointsPerFrame);
        }
        requestAnimationFrame(genStep);
    };
    requestAnimationFrame(genStep);
}

/**
 * Vygeneruje LaTeX kód rovnice a aktualizuje uzlové statistiky
 */
function updateTheoryPanel() {
    if (currentMode === 'atomic') {
        const radialNodes = currentN - currentL - 1;
        const angularNodes = currentL;
        const totalNodes = currentN - 1;
        
        valRadialNodes.textContent = radialNodes;
        valAngularNodes.textContent = angularNodes;
        valTotalNodes.textContent = totalNodes;
        
        const latex = getLatexFormula(currentN, currentL, currentM);
        equationBox.innerHTML = latex;
    } else {
        // Molekulový režim
        const nodesA = molN_A - 1;
        const nodesB = molN_B - 1;
        
        valMolNodesA.textContent = nodesA;
        valMolNodesB.textContent = nodesB;
        
        const isCs = currentLang === 'cs';
        let molTypeText = '';
        let nodalPlaneText = '';
        
        if (molCombination === 'bonding') {
            molTypeText = isCs ? 'Vazebný (bonding)' : 'Bonding';
            nodalPlaneText = isCs ? 'Ne (No)' : 'No';
        } else {
            molTypeText = isCs ? 'Antivazebný (antibonding)' : 'Antibonding';
            nodalPlaneText = isCs ? 'Ano (z = 0) (Yes)' : 'Yes (z = 0)';
        }
        
        valMolType.textContent = molTypeText;
        valMolNodalPlane.textContent = nodalPlaneText;
        
        const latex = getMolecularLatexFormula();
        equationBox.innerHTML = latex;
    }
    
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([equationBox]).catch(err => console.error(err));
    }
}

/**
 * Pomocná funkce pro vytvoření LaTeX zápisu vybraného stavu
 */
function getLatexFormula(n, l, m) {
    let radialLatex = '';
    const zTerm = currentZ === 1 ? '' : `${currentZ}`;
    const zSqrt = currentZ === 1 ? '' : `${currentZ}^{3/2}`;
    
    if (n === 1 && l === 0) {
        radialLatex = currentZ === 1 ? '2 e^{-r}' : `2 \\cdot ${zSqrt} e^{-${zTerm}r}`;
    } else if (n === 2 && l === 0) {
        radialLatex = currentZ === 1 ? '\\frac{1}{2\\sqrt{2}} (2-r) e^{-r/2}' : `\\frac{${zSqrt}}{2\\sqrt{2}} (2-${zTerm}r) e^{-\\frac{${zTerm}r}{2}}`;
    } else if (n === 2 && l === 1) {
        radialLatex = currentZ === 1 ? '\\frac{1}{2\\sqrt{6}} r e^{-r/2}' : `\\frac{${zSqrt}}{2\\sqrt{6}} (${zTerm}r) e^{-\\frac{${zTerm}r}{2}}`;
    } else if (n === 3 && l === 0) {
        radialLatex = currentZ === 1 ? '\\frac{2}{81\\sqrt{3}} (27 - 18r + 2r^2) e^{-r/3}' : `\\frac{2 \\cdot ${zSqrt}}{81\\sqrt{3}} (27 - 18(${zTerm}r) + 2(${zTerm}r)^2) e^{-\\frac{${zTerm}r}{3}}`;
    } else if (n === 3 && l === 1) {
        radialLatex = currentZ === 1 ? '\\frac{4}{27\\sqrt{6}} r (6 - r) e^{-r/3}' : `\\frac{4 \\cdot ${zSqrt}}{27\\sqrt{6}} (${zTerm}r) (6 - ${zTerm}r) e^{-\\frac{${zTerm}r}{3}}`;
    } else if (n === 3 && l === 2) {
        radialLatex = currentZ === 1 ? '\\frac{4}{81\\sqrt{30}} r^2 e^{-r/3}' : `\\frac{4 \\cdot ${zSqrt}}{81\\sqrt{30}} (${zTerm}r)^2 e^{-\\frac{${zTerm}r}{3}}`;
    } else {
        const k = n - l - 1;
        const alpha = 2 * l + 1;
        const N_pref = currentZ === 1 ? `N_{${n},${l}}` : `${zSqrt} N_{${n},${l}}`;
        radialLatex = `${N_pref} \\cdot e^{-\\frac{${currentZ}r}{${n}}} \\cdot \\left(\\frac{2 \\cdot ${currentZ}r}{${n}}\\right)^{${l}} L_{${k}}^{${alpha}}\\left(\\frac{2 \\cdot ${currentZ}r}{${n}}\\right)`;
    }

    let angularLatex = '';
    const label = ORBITAL_NAMES[l]?.[m] || m;
    
    if (l === 0) {
        angularLatex = '\\frac{1}{\\sqrt{4\\pi}}';
    } else if (l === 1) {
        if (m === -1) angularLatex = '\\sqrt{\\frac{3}{4\\pi}} \\frac{y}{r}';
        if (m === 0) angularLatex = '\\sqrt{\\frac{3}{4\\pi}} \\frac{z}{r}';
        if (m === 1) angularLatex = '\\sqrt{\\frac{3}{4\\pi}} \\frac{x}{r}';
    } else if (l === 2) {
        if (m === -2) angularLatex = '\\sqrt{\\frac{15}{4\\pi}} \\frac{xy}{r^2}';
        if (m === -1) angularLatex = '\\sqrt{\\frac{15}{4\\pi}} \\frac{yz}{r^2}';
        if (m === 0) angularLatex = '\\sqrt{\\frac{5}{16\\pi}} \\frac{3z^2-r^2}{r^2}';
        if (m === 1) angularLatex = '\\sqrt{\\frac{15}{4\\pi}} \\frac{xz}{r^2}';
        if (m === 2) angularLatex = '\\sqrt{\\frac{15}{16\\pi}} \\frac{x^2-y^2}{r^2}';
    } else if (l === 3) {
        if (m === -3) angularLatex = '\\sqrt{\\frac{35}{32\\pi}} \\frac{y(3x^2-y^2)}{r^3}';
        if (m === -2) angularLatex = '\\sqrt{\\frac{105}{4\\pi}} \\frac{xyz}{r^3}';
        if (m === -1) angularLatex = '\\sqrt{\\frac{21}{32\\pi}} \\frac{y(5z^2-r^2)}{r^3}';
        if (m === 0) angularLatex = '\\sqrt{\\frac{7}{16\\pi}} \\frac{z(5z^2-3r^2)}{r^3}';
        if (m === 1) angularLatex = '\\sqrt{\\frac{21}{32\\pi}} \\frac{x(5z^2-r^2)}{r^3}';
        if (m === 2) angularLatex = '\\sqrt{\\frac{105}{16\\pi}} \\frac{z(x^2-y^2)}{r^3}';
        if (m === 3) angularLatex = '\\sqrt{\\frac{35}{32\\pi}} \\frac{x(x^2-3y^2)}{r^3}';
    }

    return `$$\\psi_{${n}, \\text{${label}}} = R_{${n},${l}}(r) \\cdot Y_{${l},m}(\\theta,\\phi) = \\left( ${radialLatex} \\right) \\cdot \\left( ${angularLatex} \\right)$$`;
}

/**
 * Vygeneruje 3D kontury (čáry vrstevnic) na ortogonálních řezech prostoru pro kladné i záporné laloky.
 * Používá algoritmus Marching Squares aplikovaný na řezech podél X, Y a Z.
 */
function generateContourLines(n, l, m, Rmax, Pmax) {
    const vertices = [];
    const colors = [];
    
    const isoVal = parseFloat(sliderBoundaryIso.value);
    
    // Škálování prahu podle maxN a maxL pro kompenzaci prostorového rozptylu u vyšších stavů
    const maxN = currentMode === 'atomic' ? n : Math.max(molN_A, molN_B);
    const maxL = currentMode === 'atomic' ? l : Math.max(molL_A, molL_B);
    
    // Pouze pro s-orbitaly (l=0) potřebujeme silnou kompenzaci kvůli dominantnímu počátku.
    // Pro p-orbitaly (l=1) stačí mírná a pro d-orbitaly a vyšší (l>=2) není kompenzace nutná,
    // protože Pmax je již přímo maximem hlavních laloků (nikoliv u jádra).
    let exponent = 0.0;
    if (maxL === 0) {
        exponent = 3.5;
    } else if (maxL === 1) {
        exponent = 1.5;
    } else {
        exponent = 1.2;
    }
    
    let scaleFactor = Math.pow(maxN, exponent);
    // U s-orbitalů (l=0) roste hustota v jádře s nábojem Z jako Z^3, zatímco vnější obal roste pomaleji (jako Z).
    // Poměr hustoty vnějšího obalu k počátku tedy klesá jako 1/Z^2. Práh proto kompenzujeme faktorem Z^2.
    if (maxL === 0) {
        const effZ = currentMode === 'atomic' ? currentZ : Math.max(molZ_A, molZ_B);
        scaleFactor *= Math.pow(effZ, 2.0);
        if (maxN === 1) scaleFactor *= 1.5;
    }
    
    const C = (isoVal * Pmax) / scaleFactor;
    let thresholdVal = Math.sqrt(C); // vlnová funkce psi se rovná +/- thresholdVal pro hustotu C
    
    // Bezpečnostní strop pro práh (max 85% špičkové vlnové funkce), zaručující vykreslení kontur u všech stavů
    const maxAllowedThresh = 0.85 * Math.sqrt(Pmax);
    if (thresholdVal > maxAllowedThresh) {
        thresholdVal = maxAllowedThresh;
    }
    
    // Dynamický počet řezů a jemnost mřížky podle maxN a režimu
    const N_slices = currentMode === 'atomic' ? (11 + maxN * 4) : (17 + maxN * 5);
    const S = currentMode === 'atomic' ? (35 + maxN * 5) : (50 + maxN * 8);
    
    const colorPos = visualizer.colorPos;
    const colorNeg = visualizer.colorNeg;
    
    // Pomocná funkce pro lineární interpolaci
    function interpolate(pA, pB, vA, vB, T) {
        const t = (T - vA) / (vB - vA);
        return {
            x: pA.x + t * (pB.x - pA.x),
            y: pA.y + t * (pB.y - pA.y)
        };
    }
    
    // Procházíme 3 osy řezů: Z (roviny XY), Y (roviny XZ) a X (roviny YZ)
    const axes = ['z', 'y', 'x'];
    
    for (const axis of axes) {
        for (let k = -(N_slices - 1) / 2; k <= (N_slices - 1) / 2; k++) {
            // Určíme souřadnici řezu (distribuujeme řezy v oblasti 85% z Rmax)
            const sliceVal = (k / ((N_slices - 1) / 2)) * Rmax * 0.85;
            
            // Provádíme detekci vrstevnice pro obě znaménka fáze (+1 pro kladný, -1 pro záporný lalok)
            const phaseSigns = [1, -1];
            for (const phaseSign of phaseSigns) {
                const T = thresholdVal;
                
                // Spočítáme hodnoty vlnové funkce na 2D mřížce řezu
                const gridValues = new Float32Array(S * S);
                const gridPoints = new Array(S * S);
                const step = (2 * Rmax) / (S - 1);
                
                for (let j = 0; j < S; j++) {
                    const u = -Rmax + j * step;
                    for (let i = 0; i < S; i++) {
                        const v = -Rmax + i * step;
                        
                        let x = 0, y = 0, z = 0;
                        if (axis === 'z') {
                            x = v; y = u; z = sliceVal;
                        } else if (axis === 'y') {
                            x = v; y = sliceVal; z = u;
                        } else if (axis === 'x') {
                            x = sliceVal; y = v; z = u;
                        }
                        
                        const psi = getActiveWaveFunction(x, y, z);
                        const idx = i + j * S;
                        gridValues[idx] = phaseSign * psi; // Hledáme konturu kde phaseSign * psi = threshold
                        gridPoints[idx] = { x: v, y: u };
                    }
                }
                
                // Marching Squares vrstevnicový tracer
                for (let j = 0; j < S - 1; j++) {
                    for (let i = 0; i < S - 1; i++) {
                        const idx0 = i + j * S;
                        const idx1 = (i + 1) + j * S;
                        const idx2 = (i + 1) + (j + 1) * S;
                        const idx3 = i + (j + 1) * S;
                        
                        const v0 = gridValues[idx0];
                        const v1 = gridValues[idx1];
                        const v2 = gridValues[idx2];
                        const v3 = gridValues[idx3];
                        
                        const p0 = gridPoints[idx0];
                        const p1 = gridPoints[idx1];
                        const p2 = gridPoints[idx2];
                        const p3 = gridPoints[idx3];
                        
                        let code = 0;
                        if (v0 >= T) code |= 1;
                        if (v1 >= T) code |= 2;
                        if (v2 >= T) code |= 4;
                        if (v3 >= T) code |= 8;
                        
                        if (code === 0 || code === 15) continue;
                        
                        let e0, e1, e2, e3;
                        if ((v0 >= T) !== (v1 >= T)) e0 = interpolate(p0, p1, v0, v1, T);
                        if ((v1 >= T) !== (v2 >= T)) e1 = interpolate(p1, p2, v1, v2, T);
                        if ((v2 >= T) !== (v3 >= T)) e2 = interpolate(p2, p3, v2, v3, T);
                        if ((v3 >= T) !== (v0 >= T)) e3 = interpolate(p3, p0, v3, v0, T);
                        
                        const color = phaseSign > 0 ? colorPos : colorNeg;
                        
                        const addSegment = (ptA, ptB) => {
                            if (!ptA || !ptB) return;
                            
                            let ax = 0, ay = 0, az = 0;
                            let bx = 0, by = 0, bz = 0;
                            
                            if (axis === 'z') {
                                ax = ptA.x; ay = ptA.y; az = sliceVal;
                                bx = ptB.x; by = ptB.y; bz = sliceVal;
                            } else if (axis === 'y') {
                                ax = ptA.x; ay = sliceVal; az = ptA.y;
                                bx = ptB.x; by = sliceVal; bz = ptB.y;
                            } else if (axis === 'x') {
                                ax = sliceVal; ay = ptA.x; az = ptA.y;
                                bx = sliceVal; by = ptB.x; bz = ptB.y;
                            }
                            
                            vertices.push(ax, ay, az);
                            vertices.push(bx, by, bz);
                            
                            colors.push(color.r, color.g, color.b);
                            colors.push(color.r, color.g, color.b);
                        };
                        
                        // Připojování segmentů na základě case kódu
                        switch (code) {
                            case 1:  addSegment(e3, e0); break;
                            case 2:  addSegment(e0, e1); break;
                            case 3:  addSegment(e3, e1); break;
                            case 4:  addSegment(e1, e2); break;
                            case 5:  addSegment(e3, e2); addSegment(e0, e1); break;
                            case 6:  addSegment(e0, e2); break;
                            case 7:  addSegment(e3, e2); break;
                            case 8:  addSegment(e2, e3); break;
                            case 9:  addSegment(e0, e2); break;
                            case 10: addSegment(e0, e3); addSegment(e1, e2); break;
                            case 11: addSegment(e1, e2); break;
                            case 12: addSegment(e1, e3); break;
                            case 13: addSegment(e0, e1); break;
                            case 14: addSegment(e0, e3); break;
                        }
                    }
                }
            }
        }
    }
    
    return { vertices, colors };
}

/**
 * Aktualizuje 3D vrstevnicové čáry ve vizualizéru.
 */
function updateBoundaryContours() {
    const contourData = generateContourLines(currentN, currentL, currentM, Rmax, Pmax);
    visualizer.updateContourLines(contourData.vertices, contourData.colors);
}

/**
 * Dynamicky přebarví a upraví jas všech existujících nasimulovaných bodů elektronu.
 */
function recolorPoints() {
    const normalizeColor = toggleNormalizeColor.checked;
    const count = visualizer.pointCount;
    const positions = visualizer.positions;
    const colors = visualizer.colors;
    
    const colorPos = visualizer.colorPos;
    const colorNeg = visualizer.colorNeg;
    
    for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const x = positions[idx];
        const y = positions[idx + 1];
        const z = positions[idx + 2];
        
        const psi = getActiveWaveFunction(x, y, z);
        const color = psi >= 0 ? colorPos : colorNeg;
        
        let scale = 1.0;
        if (normalizeColor) {
            const P = psi * psi;
            scale = Math.pow(Math.min(1.0, P / Pmax), 0.32);
        }
        
        colors[idx] = color.r * scale;
        colors[idx + 1] = color.g * scale;
        colors[idx + 2] = color.b * scale;
    }
    
    visualizer.geometry.attributes.color.needsUpdate = true;
}

/**
 * Detekuje preferovaný jazyk z URL (hash #en, #/en, #cs, query ?lang=en, nebo podcesty /en).
 */
function detectInitialLanguage() {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    if (hash.includes('en') || search.includes('en') || pathname.endsWith('/en') || pathname.endsWith('/en/')) {
        return 'en';
    }
    if (hash.includes('cs') || hash.includes('cz') || search.includes('cs') || search.includes('cz') || pathname.endsWith('/cs') || pathname.endsWith('/cs/')) {
        return 'cs';
    }

    return 'cs';
}

/**
 * Nastavení aktuálního jazyka rozhraní (CZ nebo EN).
 */
function setLanguage(lang, updateUrl = false) {
    currentLang = lang;
    
    // Aktualizace URL hashe (např. #en nebo #cs), pokud je požadováno
    if (updateUrl && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + lang);
    }
    
    // Projít všechny elementy s data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.innerHTML = TRANSLATIONS[lang][key];
        }
    });
    
    // Projít všechny elementy s data-i18n-title pro tooltipy/titulky
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.dataset.i18nTitle;
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.title = TRANSLATIONS[lang][key];
        }
    });

    // Aktualizovat texty závislé na stavu
    updateThemeButtonText();
    
    // Tlačítko přepínání jazyků ukazuje cílový jazyk pro přepnutí
    if (lang === 'cs') {
        btnLangToggle.textContent = '🇬🇧';
        btnLangToggle.title = 'Switch to English / Přepnout do angličtiny';
        document.documentElement.lang = 'cs';
    } else {
        btnLangToggle.textContent = '🇨🇿';
        btnLangToggle.title = 'Switch to Czech / Přepnout do češtiny';
        document.documentElement.lang = 'en';
    }
    
    // Repopulovat L a M selecty, aby se přeložily dynamické popisky
    repopulateLSelect(currentN);
    selectL.value = currentL;
    repopulateMSelect(currentL, currentM);
    
    repopulateLSelectGeneric(selectLA, molN_A);
    selectLA.value = molL_A;
    repopulateMSelectGeneric(selectMA, molL_A, molM_A);
    
    repopulateLSelectGeneric(selectLB, molN_B);
    selectLB.value = molL_B;
    repopulateMSelectGeneric(selectMB, molL_B, molM_B);
    
    // Aktualizovat panel s teorií a rovnicí
    updateTheoryPanel();
    
    // Aktualizovat statistiku bodů podle jazykového formátování
    updatePointCountUI();
    
    // Vyžádat kompletní MathJax překreslení stránky (pro přečtení nových textů)
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(err => console.error(err));
    }
}

/**
 * Pomocná funkce pro aktualizaci textu tlačítka motivu vzhledu podle jazyka a stavu.
 */
function updateThemeButtonText() {
    const isLight = document.body.classList.contains('light-mode');
    if (currentLang === 'cs') {
        btnThemeToggle.textContent = isLight ? '🌙 Tmavý režim' : '☀️ Světlý režim';
        btnThemeToggle.title = 'Přepnout světlý/tmavý režim';
    } else {
        btnThemeToggle.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
        btnThemeToggle.title = 'Toggle light/dark mode';
    }
}

/**
 * Aktualizuje barvy v HTML legendě (barevné pilulky fází) podle aktuálního tématu a barevného schématu.
 */
function updateLegendColors() {
    if (!visualizer) return;
    const colorPosHex = '#' + visualizer.colorPos.getHexString();
    const colorNegHex = '#' + visualizer.colorNeg.getHexString();
    
    const dotPos = document.querySelector('.dot-pos');
    const dotNeg = document.querySelector('.dot-neg');
    
    if (dotPos && dotNeg) {
        dotPos.style.backgroundColor = colorPosHex;
        dotPos.style.boxShadow = `0 0 8px ${colorPosHex}80`;
        
        dotNeg.style.backgroundColor = colorNegHex;
        dotNeg.style.boxShadow = `0 0 8px ${colorNegHex}80`;
    }
}

/**
 * Aktualizuje faviconu v prohlížeči z aktuálně vykreslené 3D scény v WebGL canvasu.
 */
function updateFaviconFromWebGLCanvas() {
    if (!visualizer || !visualizer.renderer) return;
    
    const webglCanvas = visualizer.renderer.domElement;
    if (!webglCanvas) return;
    
    const faviconSize = 64;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = faviconSize;
    tempCanvas.height = faviconSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    const w = webglCanvas.width;
    const h = webglCanvas.height;
    const size = Math.min(w, h);
    const sx = (w - size) / 2;
    const sy = (h - size) / 2;
    
    const isLightMode = document.body.classList.contains('light-mode');
    tempCtx.fillStyle = isLightMode ? '#f8fafc' : '#0b0e14';
    tempCtx.fillRect(0, 0, faviconSize, faviconSize);
    
    tempCtx.drawImage(webglCanvas, sx, sy, size, size, 0, 0, faviconSize, faviconSize);
    
    try {
        const dataUrl = tempCanvas.toDataURL('image/png');
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = dataUrl;
    } catch (e) {
        console.error('Error generating favicon:', e);
    }
}

let faviconTimeout = null;
function triggerFaviconUpdate() {
    // Spouštíme s mírným zpožděním (debounce), aby se nesnižoval výkon při kontinuálním generování
    if (faviconTimeout) clearTimeout(faviconTimeout);
    faviconTimeout = setTimeout(() => {
        updateFaviconFromWebGLCanvas();
    }, 1000);
}

/**
 * Kontroluje parametr url ?capture=true a pokud je přítomen, automaticky vygeneruje orbital 3dz2 s 5000 body,
 * uloží jeho screenshot a odešle jej na lokální server.
 */
function checkAutoCapture() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('capture') === 'true') {
        console.log('[AutoCapture] Spouštím automatické generování favicony...');
        
        // Nastavení na 3dz2 (n=3, l=2, m=0)
        selectN.value = 3;
        repopulateLSelect(3);
        selectL.value = 2;
        repopulateMSelect(2);
        selectM.value = 0;
        updateOrbitalState(3, 2, 0);
        
        // Přidáme 5000 bodů
        addElectrons(5000);
        
        // Překreslíme WebGL přímo teď
        visualizer.renderer.render(visualizer.scene, visualizer.camera);
        
        const webglCanvas = visualizer.renderer.domElement;
        const faviconSize = 64;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = faviconSize;
        tempCanvas.height = faviconSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        const w = webglCanvas.width;
        const h = webglCanvas.height;
        const size = Math.min(w, h);
        const sx = (w - size) / 2;
        const sy = (h - size) / 2;
        
        tempCtx.fillStyle = '#0b0e14';
        tempCtx.fillRect(0, 0, faviconSize, faviconSize);
        tempCtx.drawImage(webglCanvas, sx, sy, size, size, 0, 0, faviconSize, faviconSize);
        
        tempCanvas.toBlob((blob) => {
            console.log('[AutoCapture] Odesílám obrázek na server...');
            fetch('/save-favicon', {
                method: 'POST',
                body: blob
            })
            .then(res => res.text())
            .then(text => {
                console.log('[AutoCapture] Odpověď serveru:', text);
                alert('Favicon captured and saved successfully! Server is exiting...');
            })
            .catch(err => {
                console.error('[AutoCapture] Chyba ukládání favicony:', err);
            });
        }, 'image/png');
    }
}
