/**
 * Fyzikální a matematický modul pro výpočet vlnových funkcí atomu vodíku.
 */

// Pomocná funkce pro faktoriál
export function factorial(n) {
    if (n < 0) return 0;
    let res = 1;
    for (let i = 2; i <= n; i++) {
        res *= i;
    }
    return res;
}

// Pomocná funkce pro kombinační číslo
export function binomialCoefficient(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    const min = (k < n - k) ? k : n - k;
    for (let i = 1; i <= min; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

/**
 * Přidružený Laguerreův polynom L_k^alpha(x)
 */
export function associatedLaguerre(k, alpha, x) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
        const coeff = Math.pow(-1, i) * binomialCoefficient(k + alpha, k - i) / factorial(i);
        sum += coeff * Math.pow(x, i);
    }
    return sum;
}

/**
 * Radiální vlnová funkce R_{n,l}(r) pro atom vodíku (Z=1, Bohrův poloměr a_0 = 1)
 */
export function radialWaveFunction(n, l, r) {
    if (l >= n || l < 0) return 0;
    
    const k = n - l - 1;
    const alpha = 2 * l + 1;
    const x = (2 * r) / n;
    
    // Normalizační konstanta: sqrt( (2/n)^3 * (n-l-1)! / (2n * (n+l)!) )
    const term1 = Math.pow(2 / n, 3);
    const term2 = factorial(k) / (2 * n * factorial(n + l));
    const norm = Math.sqrt(term1 * term2);
    
    const expTerm = Math.exp(-r / n);
    const powerTerm = Math.pow(x, l);
    const laguerreTerm = associatedLaguerre(k, alpha, x);
    
    return norm * expTerm * powerTerm * laguerreTerm;
}

/**
 * Reálné sférické harmonické funkce Y_{l,m} vyjádřené v kartézských souřadnicích.
 * x, y, z jsou souřadnice bodu, r je vzdálenost od počátku.
 */
export function realSphericalHarmonic(l, m, x, y, z) {
    const r = Math.sqrt(x*x + y*y + z*z);
    if (r === 0) {
        return l === 0 ? 0.5 * Math.sqrt(1 / Math.PI) : 0;
    }
    
    const dx = x / r;
    const dy = y / r;
    const dz = z / r;
    
    const PI = Math.PI;

    if (l === 0) {
        // s-orbital
        return Math.sqrt(1 / (4 * PI));
    }
    
    if (l === 1) {
        // p-orbitaly
        const c = Math.sqrt(3 / (4 * PI));
        if (m === -1) return c * dy; // p_y
        if (m === 0)  return c * dz; // p_z
        if (m === 1)  return c * dx; // p_x
    }
    
    if (l === 2) {
        // d-orbitaly
        if (m === -2) return Math.sqrt(15 / (4 * PI)) * dx * dy;          // d_xy
        if (m === -1) return Math.sqrt(15 / (4 * PI)) * dy * dz;          // d_yz
        if (m === 0)  return Math.sqrt(5 / (16 * PI)) * (3 * dz * dz - 1); // d_z^2
        if (m === 1)  return Math.sqrt(15 / (4 * PI)) * dx * dz;          // d_xz
        if (m === 2)  return Math.sqrt(15 / (16 * PI)) * (dx * dx - dy * dy); // d_x^2-y^2
    }
    
    if (l === 3) {
        // f-orbitaly
        if (m === -3) return Math.sqrt(35 / (32 * PI)) * dy * (3 * dx * dx - dy * dy); // f_y(3x^2-y^2)
        if (m === -2) return Math.sqrt(105 / (4 * PI)) * dx * dy * dz;                 // f_xyz
        if (m === -1) return Math.sqrt(21 / (32 * PI)) * dy * (5 * dz * dz - 1);       // f_yz^2
        if (m === 0)  return Math.sqrt(7 / (16 * PI)) * dz * (5 * dz * dz - 3);        // f_z^3
        if (m === 1)  return Math.sqrt(21 / (32 * PI)) * dx * (5 * dz * dz - 1);       // f_xz^2
        if (m === 2)  return Math.sqrt(105 / (16 * PI)) * dz * (dx * dx - dy * dy);     // f_z(x^2-y^2)
        if (m === 3)  return Math.sqrt(35 / (32 * PI)) * dx * (dx * dx - 3 * dy * dy); // f_x(x^2-3y^2)
    }
    
    return 0;
}

/**
 * Celková vlnová funkce psi(x,y,z) pro hydrogenní stav (n, l, m).
 */
export function waveFunction(n, l, m, x, y, z) {
    const r = Math.sqrt(x*x + y*y + z*z);
    const R = radialWaveFunction(n, l, r);
    const Y = realSphericalHarmonic(l, m, x, y, z);
    return R * Y;
}

/**
 * Hustota pravděpodobnosti výskytu elektronu |psi(x,y,z)|^2.
 */
export function probabilityDensity(n, l, m, x, y, z) {
    const psi = waveFunction(n, l, m, x, y, z);
    return psi * psi;
}

/**
 * Odhadne parametry orbitalu:
 * - Rmax: velikost ohraničující krabice [-Rmax, Rmax]^3
 * - Pmax: maximální hodnota hustoty pravděpodobnosti |psi|^2 v krabici (pro rejection sampling)
 */
export function getOrbitalParams(n, l, m) {
    // Empirický odhad velikosti orbitalu
    // Velikost atomových orbitalů roste jako n^2.
    const Rmax = 3 * n * n + 4 * n + l * 2;
    
    // Provedeme numerický odhad maxima |psi|^2
    // Vzorkujeme prostor jemnou mřížkou a náhodně, abychom našli maximum.
    let Pmax = 0;
    const samples = 20000;
    
    // Pro s-orbitaly je maximum často v počátku nebo blízko něj
    // Pro ostatní orbitaly je v počátku nula, takže musíme vzorkovat širší okolí.
    for (let i = 0; i < samples; i++) {
        // Vzorkujeme s větší hustotou blízko středu, kde jsou orbitaly nejkoncentrovanější
        // Použijeme kvadratické rozložení pro r
        const u1 = Math.random();
        const u2 = Math.random();
        const u3 = Math.random();
        
        // Transformace pro koncentraci bodů u středu
        const r = Rmax * Math.pow(u1, 2); 
        const theta = Math.acos(2 * u2 - 1);
        const phi = 2 * Math.PI * u3;
        
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);
        
        const P = probabilityDensity(n, l, m, x, y, z);
        if (P > Pmax) {
            Pmax = P;
        }
    }
    
    // Bezpečnostní koeficient 1.1x k zabránění oříznutí špiček
    if (Pmax === 0) Pmax = 1e-5; // Bezpečnostní minimum
    
    return {
        Rmax,
        Pmax: Pmax * 1.1
    };
}
