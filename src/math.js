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
 * - Pmax: maximální hodnota hustoty pravděpodobnosti |psi|^2 v krabici
 * - Pmax_radial: maximální hodnota radiálně vážené hustoty r^2 * |psi|^2 pro sférické vzorkování
 */
export function getOrbitalParams(n, l, m) {
    let Pmax = 0;
    let Pmax_radial = 0;
    let Rmax_detected = 2.0; // Minimální rozumný poloměr
    const samples = 15000;
    const points = [];
    
    // Maximální teoretický poloměr vyhledávání
    const R_search = 3 * n * n + 5 * n + 10;
    
    for (let i = 0; i < samples; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const u3 = Math.random();
        
        // Střídáme rovnoměrné vzorkování a vzorkování koncentrované u středu (pro zachycení jader i prstenců)
        const r = R_search * (i % 2 === 0 ? u1 : Math.pow(u1, 2));
        const theta = Math.acos(2 * u2 - 1);
        const phi = 2 * Math.PI * u3;
        
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);
        
        const P = probabilityDensity(n, l, m, x, y, z);
        if (P > Pmax) {
            Pmax = P;
        }
        
        const P_radial = r * r * P;
        if (P_radial > Pmax_radial) {
            Pmax_radial = P_radial;
        }
        
        points.push({ r, P, P_radial });
    }
    
    if (Pmax === 0) Pmax = 1e-5;
    if (Pmax_radial === 0) Pmax_radial = 1e-5;
    
    // Detekujeme aktivní poloměr pomocí radiální pravděpodobnosti (vážené přes r^2)
    const threshold_radial = 1e-5 * Pmax_radial;
    for (let i = 0; i < samples; i++) {
        const pt = points[i];
        if (pt.P_radial >= threshold_radial) {
            if (pt.r > Rmax_detected) {
                Rmax_detected = pt.r;
            }
        }
    }
    
    // Přidáme 15% bezpečnostní okraj
    const Rmax = Math.max(5.0, Rmax_detected * 1.15);
    
    return {
        Rmax,
        Pmax: Pmax * 1.1,
        Pmax_radial: Pmax_radial * 1.1
    };
}

/**
 * Celková vlnová funkce pro molekulový orbital v aproximaci LCAO (Linear Combination of Atomic Orbitals).
 * Dva atomové orbitaly A a B jsou umístěny na ose Z ve vzdálenostech -d/2 a d/2.
 */
export function molecularWaveFunction(n_A, l_A, m_A, n_B, l_B, m_B, d, c_A, c_B, x, y, z) {
    // Atom A na pozici (0, 0, -d/2)
    const psi_A = waveFunction(n_A, l_A, m_A, x, y, z + d / 2);
    // Atom B na pozici (0, 0, d/2)
    const psi_B = waveFunction(n_B, l_B, m_B, x, y, z - d / 2);
    return c_A * psi_A + c_B * psi_B;
}

/**
 * Hustota pravděpodobnosti molekulového orbitalu |psi_MO|^2.
 */
export function molecularProbabilityDensity(n_A, l_A, m_A, n_B, l_B, m_B, d, c_A, c_B, x, y, z) {
    const psi = molecularWaveFunction(n_A, l_A, m_A, n_B, l_B, m_B, d, c_A, c_B, x, y, z);
    return psi * psi;
}

/**
 * Odhadne parametry molekulového orbitalu (Rmax a Pmax) pro potřeby Monte Carlo vzorkování.
 */
export function getMolecularOrbitalParams(n_A, l_A, m_A, n_B, l_B, m_B, d, c_A, c_B) {
    let Pmax = 0;
    let Pmax_radial = 0;
    let Rmax_detected = 2.0;
    const samples = 20000;
    const points = [];
    
    // Získáme odhady pro jednotlivé atomové orbitaly
    const paramsA = getOrbitalParams(n_A, l_A, m_A);
    const paramsB = getOrbitalParams(n_B, l_B, m_B);
    
    // Základní poloměr vyhledávání musí pokrýt oba atomy a jejich rozsah
    const baseRmax = Math.max(paramsA.Rmax, paramsB.Rmax) + d / 2;
    
    for (let i = 0; i < samples; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const u3 = Math.random();
        
        // Vzorkujeme body soustředěné kolem jádra A, jádra B a středu mezi nimi
        let centerZ = 0;
        const roll = Math.random();
        if (roll < 0.45) {
            centerZ = -d / 2; // Kolem atomu A
        } else if (roll < 0.90) {
            centerZ = d / 2;  // Kolem atomu B
        } else {
            centerZ = 0;      // V mezijaderném prostoru
        }
        
        const r = baseRmax * (i % 2 === 0 ? u1 : Math.pow(u1, 2));
        const theta = Math.acos(2 * u2 - 1);
        const phi = 2 * Math.PI * u3;
        
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta) + centerZ;
        
        const P = molecularProbabilityDensity(n_A, l_A, m_A, n_B, l_B, m_B, d, c_A, c_B, x, y, z);
        if (P > Pmax) {
            Pmax = P;
        }
        
        // Celková vzdálenost od těžiště (počátku)
        const distFromOrigin = Math.sqrt(x*x + y*y + z*z);
        const P_radial = distFromOrigin * distFromOrigin * P;
        if (P_radial > Pmax_radial) {
            Pmax_radial = P_radial;
        }
        
        points.push({ r: distFromOrigin, P, P_radial });
    }
    
    if (Pmax === 0) Pmax = 1e-5;
    if (Pmax_radial === 0) Pmax_radial = 1e-5;
    
    // Detekujeme aktivní poloměr od počátku pomocí radiální pravděpodobnosti
    const threshold_radial = 1e-5 * Pmax_radial;
    for (let i = 0; i < samples; i++) {
        const pt = points[i];
        if (pt.P_radial >= threshold_radial) {
            if (pt.r > Rmax_detected) {
                Rmax_detected = pt.r;
            }
        }
    }
    
    // Bezpečnostní rezerva
    const Rmax = Math.max(paramsA.Rmax + d/2, Rmax_detected * 1.15);
    
    return {
        Rmax,
        Pmax: Pmax * 1.1,
        Pmax_radial: Pmax_radial * 1.1
    };
}

