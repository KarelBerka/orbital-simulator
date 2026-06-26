import { getOrbitalParams, waveFunction, probabilityDensity } from './math.js';
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
        'help-rotate': '🖱️ <b>Levé tlačítko:</b> Rotace scény',
        'help-zoom': '⚙️ <b>Kolečko:</b> Přiblížení (Zoom)',
        'help-pan': '✋ <b>Pravé tlačítko:</b> Posun scény',
        'github-repo': 'GitHub Repozitář',
        'authors-list': 'Autoři: Karel Berka (UPOL) & Lukáš Peterka (VŠCHT)'
    },
    en: {
        'meta-title': '3D Atomic Orbitals Simulator',
        'app-title': 'Atomic Orbitals <span>Simulator</span>',
        'app-subtitle': 'Visualization of electron probability density using Monte Carlo rejection sampling',
        'orbital-selection': 'Orbital Selection',
        'quantum-numbers': 'Quantum Numbers',
        'n-label': 'Principal (n)',
        'l-label': 'Azimuthal (l)',
        'm-label': 'Magnetic (m)',
        'quick-presets': 'Quick Presets',
        'generate-positions': 'Generate Electron Positions',
        'add-1-title': 'Determine one electron position',
        'add-100-title': 'Determine 100 positions',
        'add-1000-title': 'Determine 1000 positions',
        'auto-generation': 'Auto-generation',
        'generation-speed': 'Generation Speed',
        'speed-slow': 'Slow',
        'speed-fast': 'Ultra fast',
        'clear-points': 'Clear points',
        'status-phase': 'Status and Phase',
        'measured-positions': 'Measured positions',
        'phase-pos': 'Phase $+$',
        'phase-neg': 'Phase $-$',
        '2d-slice': '2D Orbital Slice',
        'plane-xy': 'XY Plane (z = 0)',
        'plane-xz': 'XZ Plane (y = 0)',
        'plane-yz': 'YZ Plane (x = 0)',
        'math-description': 'Mathematical Description',
        'theory-para': 'The wave function $\\psi_{n,l,m}$ describes the stationary state of the electron. The probability density of finding the electron is given by the square of the wave function $|\\psi|^2$.',
        'nodal-surfaces-title': 'Nodal surfaces (places with zero probability)',
        'radial-nodes-label': 'Radial nodal surfaces ($n-l-1$):',
        'angular-nodes-label': 'Angular nodal surfaces ($l$):',
        'total-nodes-label': 'Total nodal surfaces ($n-1$):',
        'vis-appearance': 'Visualization and Appearance',
        'point-size': 'Point Size',
        'phase-colors': 'Phase Color Scheme',
        'color-orange-cyan': 'Orange / Cyan',
        'color-classic': 'Red / Blue',
        'color-pink-green': 'Pink / Green',
        'color-purple-yellow': 'Purple / Yellow',
        'boundary-threshold': 'Orbital shape threshold (isosurface)',
        'larger-shell': 'Larger shell',
        'smaller-core': 'Smaller core',
        'origin-grid': 'Origin Grid',
        'show-axes': 'Show XYZ Axes',
        'auto-rotate': 'Auto-rotate Scene',
        'theoretical-shape': 'Theoretical shape (contour model)',
        'normalize-brightness': 'Normalized point brightness',
        'help-rotate': '🖱️ <b>Left button:</b> Rotate scene',
        'help-zoom': '⚙️ <b>Scroll wheel:</b> Zoom',
        'help-pan': '✋ <b>Right button:</b> Pan scene',
        'github-repo': 'GitHub Repository',
        'authors-list': 'Authors: Karel Berka (UPOL) & Lukáš Peterka (VŠCHT)'
    }
};

// Globální stav aplikace
let visualizer = null;
let currentN = 1;
let currentL = 0;
let currentM = 0;
let Rmax = 7;
let Pmax = 1;
let autoGenInterval = null;
let slicePlane = 'xy';
let currentLang = 'cs';
let isModalOpen = false;

// Elementy UI
const selectN = document.getElementById('select-n');
const selectL = document.getElementById('select-l');
const selectM = document.getElementById('select-m');
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

// Modal elementy pro zvětšený 2D řez
const sliceModal = document.getElementById('slice-modal');
const modalSliceCanvas = document.getElementById('modal-slice-canvas');
const modalClose = document.getElementById('modal-close');

// Uzlové statistiky
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
    
    // Nastavení výchozího jazyka (Čeština)
    setLanguage('cs');
    
    // Spuštění smyčky pro automatické generování bodů
    startAutoGenLoop();
    
    // Prověřit, zda je spuštěn automatický záchyt ikony (favicony)
    checkAutoCapture();
});

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
        setLanguage(nextLang);
    });
}

function setupPhysicsControls() {
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
            
            updateOrbitalState(n, l, m);
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
 * Dynamicky naplní select pro L podle zvoleného N (omezeno na s, p, d, f)
 */
function repopulateLSelect(n) {
    const prevVal = selectL.value;
    selectL.innerHTML = '';
    
    const maxL = Math.min(n - 1, 3);
    
    const labels = ['0 (s)', '1 (p)', '2 (d)', '3 (f)'];
    for (let l = 0; l <= maxL; l++) {
        const opt = document.createElement('option');
        opt.value = l;
        opt.textContent = labels[l];
        selectL.appendChild(opt);
    }
    
    if (parseInt(prevVal) <= maxL) {
        selectL.value = prevVal;
    } else {
        selectL.value = 0;
    }
}

/**
 * Dynamicky naplní select pro M podle zvoleného L
 */
function repopulateMSelect(l, preserveVal = 0) {
    selectM.innerHTML = '';
    
    for (let m = -l; m <= l; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        
        const name = ORBITAL_NAMES[l]?.[m] || m;
        opt.textContent = `${m} (${name})`;
        selectM.appendChild(opt);
    }
    
    selectM.value = preserveVal;
}

/**
 * Změna aktuálního orbitalu a reset simulace
 */
function updateOrbitalState(n, l, m) {
    currentN = n;
    currentL = l;
    currentM = m;
    
    // Získání fyzikálních parametrů (krychle a maximum pravděpodobnosti)
    const params = getOrbitalParams(n, l, m);
    Rmax = params.Rmax;
    Pmax = params.Pmax;
    
    // Generování a vykreslení teoretického tvaru orbitalu (3D vrstevnice)
    updateBoundaryContours();
    visualizer.toggleBoundaryShell(toggleBoundary.checked);
    
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
    const maxAttempts = 20000;
    
    while (attempts < maxAttempts) {
        attempts++;
        const x = (Math.random() * 2 - 1) * Rmax;
        const y = (Math.random() * 2 - 1) * Rmax;
        const z = (Math.random() * 2 - 1) * Rmax;
        
        const psi = waveFunction(n, l, m, x, y, z);
        const P = psi * psi;
        
        const P_rand = Math.random() * Pmax;
        if (P_rand < P) {
            return { x, y, z, phase: psi };
        }
    }
    
    return { x: 0, y: 0, z: 0, phase: 0 };
}

function updatePointCountUI() {
    statCount.textContent = visualizer.pointCount.toLocaleString(currentLang === 'cs' ? 'cs-CZ' : 'en-US');
}

/**
 * Vykreslí 2D řez orbitalem do vedlejšího Canvasu
 */
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
            
            const psi = waveFunction(currentN, currentL, currentM, x, y, z);
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
    const radialNodes = currentN - currentL - 1;
    const angularNodes = currentL;
    const totalNodes = currentN - 1;
    
    valRadialNodes.textContent = radialNodes;
    valAngularNodes.textContent = angularNodes;
    valTotalNodes.textContent = totalNodes;
    
    const latex = getLatexFormula(currentN, currentL, currentM);
    equationBox.innerHTML = latex;
    
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([equationBox]).catch(err => console.error(err));
    }
}

/**
 * Pomocná funkce pro vytvoření LaTeX zápisu vybraného stavu
 */
function getLatexFormula(n, l, m) {
    let radialLatex = '';
    
    if (n === 1 && l === 0) {
        radialLatex = '2 e^{-r}';
    } else if (n === 2 && l === 0) {
        radialLatex = '\\frac{1}{2\\sqrt{2}} (2-r) e^{-r/2}';
    } else if (n === 2 && l === 1) {
        radialLatex = '\\frac{1}{2\\sqrt{6}} r e^{-r/2}';
    } else if (n === 3 && l === 0) {
        radialLatex = '\\frac{2}{81\\sqrt{3}} (27 - 18r + 2r^2) e^{-r/3}';
    } else if (n === 3 && l === 1) {
        radialLatex = '\\frac{4}{27\\sqrt{6}} r (6 - r) e^{-r/3}';
    } else if (n === 3 && l === 2) {
        radialLatex = '\\frac{4}{81\\sqrt{30}} r^2 e^{-r/3}';
    } else {
        const k = n - l - 1;
        const alpha = 2 * l + 1;
        radialLatex = `N_{${n},${l}} \\cdot e^{-\\frac{r}{${n}}} \\cdot \\left(\\frac{2r}{${n}}\\right)^{${l}} L_{${k}}^{${alpha}}\\left(\\frac{2r}{${n}}\\right)`;
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
    
    // Škálování prahu podle n pro kompenzaci prostorového rozptylu pravděpodobnosti u vyšších stavů
    const scaleFactor = Math.pow(n, 2.0);
    const C = (isoVal * Pmax) / scaleFactor;
    const thresholdVal = Math.sqrt(C); // vlnová funkce psi se rovná +/- thresholdVal pro hustotu C
    
    // Dynamický počet řezů a jemnost mřížky podle n (vyšší stavy mají více jemných vnitřních struktur)
    const N_slices = 11 + n * 4; // n=1: 15, n=2: 19, n=3: 23, n=4: 27, n=5: 31 (vždy liché číslo)
    const S = 35 + n * 5;        // n=1: 40, n=2: 45, n=3: 50, n=4: 55, n=5: 60
    
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
                        
                        const psi = waveFunction(n, l, m, x, y, z);
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
        
        const psi = waveFunction(currentN, currentL, currentM, x, y, z);
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
 * Nastavení aktuálního jazyka rozhraní (CZ nebo EN).
 */
function setLanguage(lang) {
    currentLang = lang;
    
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
