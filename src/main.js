import { getOrbitalParams, waveFunction, probabilityDensity } from './math.js';
import { OrbitalVisualizer } from './visualizer.js';

// Konstanta s názvy orbitalů pro zobrazení
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

// Globální stav aplikace
let visualizer = null;
let currentN = 1;
let currentL = 0;
let currentM = 0;
let Rmax = 7;
let Pmax = 1;
let autoGenInterval = null;
let slicePlane = 'xy';

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
    
    // Nastavení výchozího stavu
    updateOrbitalState(1, 0, 0);
    
    // Spuštění smyčky pro automatické generování bodů
    startAutoGenLoop();
});

function setupThreeControls() {
    sliderPointSize.addEventListener('input', (e) => {
        visualizer.setPointSize(parseFloat(e.target.value));
    });
    
    selectColors.addEventListener('change', (e) => {
        visualizer.setColorScheme(e.target.value);
        recolorPoints();
        updateSliceCanvas();
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
        const boundaryPts = generateBoundaryPoints(currentN, currentL, currentM, Rmax, Pmax);
        visualizer.updateBoundaryShell(boundaryPts);
    });
    
    btnThemeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        if (isLight) {
            btnThemeToggle.textContent = '🌙 Tmavý režim';
            visualizer.setTheme('light');
        } else {
            btnThemeToggle.textContent = '☀️ Světlý režim';
            visualizer.setTheme('dark');
        }
        recolorPoints();
        const boundaryPts = generateBoundaryPoints(currentN, currentL, currentM, Rmax, Pmax);
        visualizer.updateBoundaryShell(boundaryPts);
        updateSliceCanvas();
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
            repopulateMSelect(l);
            selectM.value = m;
            
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
    });
}

/**
 * Dynamicky naplní select pro L podle zvoleného N (omezeno na s, p, d, f)
 */
function repopulateLSelect(n) {
    const prevVal = selectL.value;
    selectL.innerHTML = '';
    
    // Limitujeme do l=3 (f-orbitaly), i když n je větší
    const maxL = Math.min(n - 1, 3);
    
    const labels = ['0 (s)', '1 (p)', '2 (d)', '3 (f)'];
    for (let l = 0; l <= maxL; l++) {
        const opt = document.createElement('option');
        opt.value = l;
        opt.textContent = labels[l];
        selectL.appendChild(opt);
    }
    
    // Pokusíme se zachovat předchozí hodnotu, pokud je stále validní
    if (parseInt(prevVal) <= maxL) {
        selectL.value = prevVal;
    } else {
        selectL.value = 0;
    }
}

/**
 * Dynamicky naplní select pro M podle zvoleného L
 */
function repopulateMSelect(l) {
    selectM.innerHTML = '';
    
    for (let m = -l; m <= l; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        
        // Získání chemického názvu (např. p_x, d_z^2)
        const name = ORBITAL_NAMES[l]?.[m] || m;
        opt.textContent = `${m} (${name})`;
        selectM.appendChild(opt);
    }
    
    // Vždy nastavíme prostřední (např. 0) jako výchozí
    selectM.value = 0;
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
    
    // Generování a vykreslení teoretického tvaru orbitalu (hranice/obal)
    const boundaryPts = generateBoundaryPoints(n, l, m, Rmax, Pmax);
    visualizer.updateBoundaryShell(boundaryPts);
    visualizer.toggleBoundaryShell(toggleBoundary.checked);
    
    // Smazání stávajících bodů (požadavek uživatele)
    visualizer.clearPoints();
    updatePointCountUI();
    
    // Aktualizace 2D řezu
    updateSliceCanvas();
    
    // Aktualizace teoretického panelu a uzlových statistik
    updateTheoryPanel();
    
    // Zrušení označení presetu, pokud aktuální stav neodpovídá žádnému tlačítku
    const presetButtons = document.querySelectorAll('.btn-preset');
    let matchedPreset = false;
    presetButtons.forEach(btn => {
        if (parseInt(btn.dataset.n) === n && parseInt(btn.dataset.l) === l && parseInt(btn.dataset.m) === m) {
            btn.classList.add('active');
            matchedPreset = true;
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
    // Generování bodů pomocí Rejection Samplingu
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
}

/**
 * Generování polohy elektronu metodou Rejection Sampling
 */
function sampleElectronPosition(n, l, m, Rmax, Pmax) {
    let attempts = 0;
    const maxAttempts = 20000;
    
    while (attempts < maxAttempts) {
        attempts++;
        // Náhodný bod v krychli [-Rmax, Rmax]^3
        const x = (Math.random() * 2 - 1) * Rmax;
        const y = (Math.random() * 2 - 1) * Rmax;
        const z = (Math.random() * 2 - 1) * Rmax;
        
        // Hodnota vlnové funkce v tomto bodě
        const psi = waveFunction(n, l, m, x, y, z);
        const P = psi * psi;
        
        // Rejection sampling test
        const P_rand = Math.random() * Pmax;
        if (P_rand < P) {
            return { x, y, z, phase: psi };
        }
    }
    
    // Fallback v případě selhání (např. extrémní numerický podtečení)
    return { x: 0, y: 0, z: 0, phase: 0 };
}

function updatePointCountUI() {
    statCount.textContent = visualizer.pointCount.toLocaleString('cs-CZ');
}

/**
 * Vykreslí 2D řez orbitalem do vedlejšího Canvasu
 */
function updateSliceCanvas() {
    const width = sliceCanvas.width;
    const height = sliceCanvas.height;
    const ctx = sliceCanvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    
    const colorPos = visualizer.colorPos;
    const colorNeg = visualizer.colorNeg;
    const isLightMode = document.body.classList.contains('light-mode');
    
    // Vzorkování 2D plochy
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
    
    // Nakreslení tenkých dělících os
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
 * Spustí periodickou smyčku pro automatické generování bodů
 */
function startAutoGenLoop() {
    const genStep = () => {
        if (toggleAuto.checked) {
            // Rychlost: počet bodů na jeden animační snímek (1 až 15 bodů)
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
    // Uzlové statistiky
    const radialNodes = currentN - currentL - 1;
    const angularNodes = currentL;
    const totalNodes = currentN - 1;
    
    valRadialNodes.textContent = radialNodes;
    valAngularNodes.textContent = angularNodes;
    valTotalNodes.textContent = totalNodes;
    
    // Generování LaTeXu
    const latex = getLatexFormula(currentN, currentL, currentM);
    equationBox.innerHTML = latex;
    
    // Vyžádání překreslení od MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([equationBox]).catch(err => console.error(err));
    }
}

/**
 * Pomocná funkce pro vytvoření LaTeX zápisu vybraného stavu
 */
function getLatexFormula(n, l, m) {
    let radialLatex = '';
    
    // Specifické případy pro jednodušší zobrazení
    if (n === 1 && l === 0) {
        radialLatex = '2 e^{-r}';
    } else if (n === 2 && l === 0) {
        radialLatex = '\\frac{1}{2\\sqrt{2}} (2-r) e^{-r/2}';
    } else if (n === 2 && l === 1) {
        radialLatex = '\\frac{1}{2\\sqrt{6}} r e^{-r/2}';
    } else if (n === 3 && l === 0) {
        radialLatex = '\\frac{2}{27\\sqrt{3}} (27 - 18r + 2r^2) e^{-r/3}';
    } else if (n === 3 && l === 1) {
        radialLatex = '\\frac{4}{27\\sqrt{6}} r (6 - r) e^{-r/3}';
    } else if (n === 3 && l === 2) {
        radialLatex = '\\frac{4}{81\\sqrt{30}} r^2 e^{-r/3}';
    } else {
        // Obecný zápis
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
 * Vygeneruje mrak bodů na rozhraní (izoploše) teoretického tvaru orbitalu.
 */
function generateBoundaryPoints(n, l, m, Rmax, Pmax) {
    const points = [];
    const N = 40; // Jemnost mřížky 40x40x40 (cca 64 000 bodů)
    
    const isoVal = parseFloat(sliderBoundaryIso.value);
    const threshold = isoVal * Pmax;
    
    const grid = new Float32Array(N * N * N);
    const phases = new Float32Array(N * N * N);
    
    // Spočítáme hodnoty na mřížce
    for (let z = 0; z < N; z++) {
        const fz = ((z / (N - 1)) * 2 - 1) * Rmax;
        for (let y = 0; y < N; y++) {
            const fy = ((y / (N - 1)) * 2 - 1) * Rmax;
            for (let x = 0; x < N; x++) {
                const fx = ((x / (N - 1)) * 2 - 1) * Rmax;
                
                const psi = waveFunction(n, l, m, fx, fy, fz);
                const idx = x + y * N + z * N * N;
                grid[idx] = psi * psi;
                phases[idx] = psi;
            }
        }
    }
    
    // Detekce přechodu přes práh (boundary voxels)
    for (let z = 1; z < N - 1; z++) {
        const fz = ((z / (N - 1)) * 2 - 1) * Rmax;
        for (let y = 1; y < N - 1; y++) {
            const fy = ((y / (N - 1)) * 2 - 1) * Rmax;
            for (let x = 1; x < N - 1; x++) {
                const idx = x + y * N + z * N * N;
                const val = grid[idx];
                
                if (val >= threshold) {
                    const n1 = grid[(x + 1) + y * N + z * N * N];
                    const n2 = grid[(x - 1) + y * N + z * N * N];
                    const n3 = grid[x + (y + 1) * N + z * N * N];
                    const n4 = grid[x + (y - 1) * N + z * N * N];
                    const n5 = grid[x + y * N + (z + 1) * N * N];
                    const n6 = grid[x + y * N + (z - 1) * N * N];
                    
                    if (n1 < threshold || n2 < threshold || n3 < threshold || n4 < threshold || n5 < threshold || n6 < threshold) {
                        const fx = ((x / (N - 1)) * 2 - 1) * Rmax;
                        points.push({ x: fx, y: fy, z: fz, phase: phases[idx] });
                    }
                }
            }
        }
    }
    
    return points;
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
