import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export class OrbitalVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id '${containerId}' not found.`);
        }

        this.maxPoints = 200000;
        this.pointCount = 0;
        this.pointSize = 3.0;
        
        // Výchozí téma a schéma
        this.currentTheme = 'dark';
        this.currentScheme = 'orange-cyan';
        
        // Výchozí barvy fází
        this.colorPos = new THREE.Color('#ff5722'); // Oranžovo-červená pro kladnou fázi
        this.colorNeg = new THREE.Color('#00bcd4'); // Tyrkysová pro zápornou fázi

        this.initThree();
        this.initPoints();
        this.animate();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }

    initThree() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Scéna
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#0b0e14'); // Tmavé prémiové pozadí

        // Kamera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(40, 30, 50);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Ovládání (OrbitControls)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 300;
        this.controls.minDistance = 5;

        // Světla (pro případné budoucí mesh prvky)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 40, 20);
        this.scene.add(dirLight);

        // Pomocná mřížka a osy
        this.gridHelper = new THREE.GridHelper(60, 30, '#1e293b', '#0f172a');
        this.gridHelper.position.y = -0.01; // Lehce pod počátkem
        this.scene.add(this.gridHelper);

        // Barevné osy (X = červená, Y = zelená, Z = modrá)
        this.axesHelper = new THREE.AxesHelper(15);
        // Ztluštění os pro lepší viditelnost
        this.axesHelper.material.linewidth = 3;
        this.axesHelper.material.renderOrder = 1;
        this.scene.add(this.axesHelper);
        
        // Nastavení automatické rotace kamery
        this.autoRotate = true;
    }

    initPoints() {
        // Vytvoření BufferGeometry pro rychlé vykreslování bodů
        this.geometry = new THREE.BufferGeometry();
        
        this.positions = new Float32Array(this.maxPoints * 3);
        this.colors = new Float32Array(this.maxPoints * 3);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        
        this.geometry.setDrawRange(0, 0);

        // Společný materiál bodů s kruhovou texturou a zářením (glow)
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        
        const texture = new THREE.CanvasTexture(canvas);

        this.material = new THREE.PointsMaterial({
            size: this.pointSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            map: texture,
            blending: THREE.AdditiveBlending, // Pro zářivý efekt
            depthWrite: false
        });

        this.pointCloud = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.pointCloud);

        // Inicializace bodů pro teoretický obal orbitalu (final shape boundary shell)
        this.boundaryGeometry = new THREE.BufferGeometry();
        this.maxBoundaryPoints = 60000;
        this.boundaryPositions = new Float32Array(this.maxBoundaryPoints * 3);
        this.boundaryColors = new Float32Array(this.maxBoundaryPoints * 3);
        
        this.boundaryGeometry.setAttribute('position', new THREE.BufferAttribute(this.boundaryPositions, 3));
        this.boundaryGeometry.setAttribute('color', new THREE.BufferAttribute(this.boundaryColors, 3));
        this.boundaryGeometry.setDrawRange(0, 0);
        
        this.boundaryMaterial = new THREE.PointsMaterial({
            size: this.pointSize * 0.75,
            vertexColors: true,
            transparent: true,
            opacity: 0.28,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.boundaryPointCloud = new THREE.Points(this.boundaryGeometry, this.boundaryMaterial);
        this.scene.add(this.boundaryPointCloud);
    }

    /**
     * Přidá jeden bod s danou fází (kladná/záporná) do vizualizace.
     */
    addPoint(x, y, z, phase, scale = 1.0) {
        if (this.pointCount >= this.maxPoints) {
            // Pokud přeteče limit, vymažeme nejstarší body (kruhová fronta) nebo ignorujeme
            // Pro jednoduchost budeme ignorovat
            return;
        }

        const idx = this.pointCount * 3;
        
        // Zapsání souřadnic
        this.positions[idx] = x;
        this.positions[idx + 1] = y;
        this.positions[idx + 2] = z;

        // Výběr barvy podle fáze s aplikací jasu
        const color = phase >= 0 ? this.colorPos : this.colorNeg;
        this.colors[idx] = color.r * scale;
        this.colors[idx + 1] = color.g * scale;
        this.colors[idx + 2] = color.b * scale;

        this.pointCount++;

        // Upozornění Three.js o změně atributů
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.computeBoundingSphere();
        this.geometry.computeBoundingBox();
        this.geometry.setDrawRange(0, this.pointCount);
    }

    /**
     * Vymaže všechny vykreslené body.
     */
    clearPoints() {
        this.pointCount = 0;
        this.geometry.setDrawRange(0, 0);
    }

    /**
     * Nastaví velikost bodů.
     */
    setPointSize(size) {
        this.pointSize = size;
        this.material.size = size;
        if (this.boundaryMaterial) {
            this.boundaryMaterial.size = size * 0.75;
        }
    }

    /**
     * Přepne viditelnost pomocné mřížky.
     */
    toggleGrid(visible) {
        this.gridHelper.visible = visible;
    }

    /**
     * Přepne viditelnost os.
     */
    toggleAxes(visible) {
        this.axesHelper.visible = visible;
    }

    /**
     * Přepne viditelnost teoretického obalu orbitalu.
     */
    toggleBoundaryShell(visible) {
        this.boundaryPointCloud.visible = visible;
    }

    /**
     * Vykreslí body tvořící vnější obal orbitalu (izoplochu).
     */
    updateBoundaryShell(pointsData) {
        const count = Math.min(pointsData.length, this.maxBoundaryPoints);
        
        for (let i = 0; i < count; i++) {
            const pt = pointsData[i];
            const idx = i * 3;
            this.boundaryPositions[idx] = pt.x;
            this.boundaryPositions[idx + 1] = pt.y;
            this.boundaryPositions[idx + 2] = pt.z;
            
            const color = pt.phase >= 0 ? this.colorPos : this.colorNeg;
            this.boundaryColors[idx] = color.r;
            this.boundaryColors[idx + 1] = color.g;
            this.boundaryColors[idx + 2] = color.b;
        }
        
        this.boundaryGeometry.attributes.position.needsUpdate = true;
        this.boundaryGeometry.attributes.color.needsUpdate = true;
        this.boundaryGeometry.computeBoundingSphere();
        this.boundaryGeometry.computeBoundingBox();
        this.boundaryGeometry.setDrawRange(0, count);
    }

    /**
     * Nastaví barevné téma 3D scény (světlý / tmavý režim).
     */
    setTheme(theme) {
        this.currentTheme = theme;
        this.updateColors();
        
        if (theme === 'light') {
            this.scene.background.set('#f8fafc');
            
            // Ve světlém režimu změníme prolínání (blending) na standardní,
            // jinak jsou neonové barvy na bílém pozadí neviditelné.
            this.material.blending = THREE.NormalBlending;
            this.material.opacity = 0.82;
            this.material.needsUpdate = true;
            
            if (this.boundaryMaterial) {
                this.boundaryMaterial.blending = THREE.NormalBlending;
                this.boundaryMaterial.opacity = 0.38;
                this.boundaryMaterial.needsUpdate = true;
            }
            
            const gridVisible = this.gridHelper.visible;
            this.scene.remove(this.gridHelper);
            this.gridHelper = new THREE.GridHelper(60, 30, '#cbd5e1', '#cbd5e1'); // Ztmavení mřížky
            this.gridHelper.visible = gridVisible;
            this.gridHelper.position.y = -0.01;
            this.scene.add(this.gridHelper);
        } else {
            this.scene.background.set('#0b0e14');
            
            // Vrátíme aditivní záření pro tmavý režim
            this.material.blending = THREE.AdditiveBlending;
            this.material.opacity = 0.85;
            this.material.needsUpdate = true;
            
            if (this.boundaryMaterial) {
                this.boundaryMaterial.blending = THREE.AdditiveBlending;
                this.boundaryMaterial.opacity = 0.28;
                this.boundaryMaterial.needsUpdate = true;
            }
            
            const gridVisible = this.gridHelper.visible;
            this.scene.remove(this.gridHelper);
            this.gridHelper = new THREE.GridHelper(60, 30, '#1e293b', '#0f172a');
            this.gridHelper.visible = gridVisible;
            this.gridHelper.position.y = -0.01;
            this.scene.add(this.gridHelper);
        }
    }

    /**
     * Nastaví barevné schéma bodů.
     */
    setColorScheme(scheme) {
        this.currentScheme = scheme;
        this.updateColors();
    }

    /**
     * Dynamicky přizpůsobí barvy a jejich jas (kontrast) podle aktivního tématu a schématu.
     */
    updateColors() {
        const theme = this.currentTheme;
        const scheme = this.currentScheme;
        
        if (scheme === 'orange-cyan') {
            this.colorPos.set(theme === 'light' ? '#d84315' : '#ff5722'); // Tmavší oranžová vs neonová
            this.colorNeg.set(theme === 'light' ? '#00838f' : '#00bcd4'); // Tmavší tyrkysová vs neonová
        } else if (scheme === 'pink-green') {
            this.colorPos.set(theme === 'light' ? '#c2185b' : '#e91e63');
            this.colorNeg.set(theme === 'light' ? '#2e7d32' : '#4caf50');
        } else if (scheme === 'purple-yellow') {
            this.colorPos.set(theme === 'light' ? '#7b1fa2' : '#9c27b0');
            this.colorNeg.set(theme === 'light' ? '#ef6c00' : '#ffeb3b'); // Pro světlé pozadí dáme tmavší žlutou/oranžovou
        } else if (scheme === 'classic') {
            this.colorPos.set(theme === 'light' ? '#c62828' : '#f44336');
            this.colorNeg.set(theme === 'light' ? '#1565c0' : '#2196f3');
        }
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Automatické otáčení scény (synchronizované pro oba mraky bodů)
        if (this.autoRotate) {
            this.pointCloud.rotation.y += 0.002;
            if (this.boundaryPointCloud) {
                this.boundaryPointCloud.rotation.y = this.pointCloud.rotation.y;
            }
        } else {
            this.pointCloud.rotation.y = 0;
            if (this.boundaryPointCloud) {
                this.boundaryPointCloud.rotation.y = 0;
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
