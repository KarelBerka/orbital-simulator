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
        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
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

        // Inicializace 3D obrysového/konturového modelu (wireframe contour lines)
        this.contourGeometry = new THREE.BufferGeometry();
        this.maxContourVertices = 500000; // maximální počet vrcholů pro čáry
        this.contourPositions = new Float32Array(this.maxContourVertices * 3);
        this.contourColors = new Float32Array(this.maxContourVertices * 3);

        this.contourGeometry.setAttribute('position', new THREE.BufferAttribute(this.contourPositions, 3));
        this.contourGeometry.setAttribute('color', new THREE.BufferAttribute(this.contourColors, 3));
        this.contourGeometry.setDrawRange(0, 0);
        
        this.contourMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            linewidth: 1.5
        });
        
        this.contourLines = new THREE.LineSegments(this.contourGeometry, this.contourMaterial);
        this.scene.add(this.contourLines);
    }

    /**
     * Přidá jeden bod s danou fází (kladná/záporná) do vizualizace.
     */
    addPoint(x, y, z, phase, scale = 1.0) {
        if (this.pointCount >= this.maxPoints) {
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
     * Přepne viditelnost teoretického obrysového modelu orbitalu.
     */
    toggleBoundaryShell(visible) {
        this.contourLines.visible = visible;
    }

    /**
     * Vykreslí čáry tvořící 3D obrysový (konturový) model orbitalu.
     */
    updateContourLines(verticesData, colorsData) {
        const count = Math.min(verticesData.length, this.maxContourVertices * 3);
        
        for (let i = 0; i < count; i++) {
            this.contourPositions[i] = verticesData[i];
            this.contourColors[i] = colorsData[i];
        }
        
        this.contourGeometry.attributes.position.needsUpdate = true;
        this.contourGeometry.attributes.color.needsUpdate = true;
        this.contourGeometry.computeBoundingSphere();
        this.contourGeometry.computeBoundingBox();
        this.contourGeometry.setDrawRange(0, count / 3);
    }

    /**
     * Nastaví barevné téma 3D scény (světlý / tmavý režim).
     */
    setTheme(theme) {
        this.currentTheme = theme;
        this.updateColors();
        
        if (theme === 'light') {
            this.scene.background.set('#f8fafc');
            
            this.material.blending = THREE.NormalBlending;
            this.material.opacity = 0.82;
            this.material.needsUpdate = true;
            
            if (this.contourMaterial) {
                this.contourMaterial.blending = THREE.NormalBlending;
                this.contourMaterial.opacity = 0.7; // Čáry jsou ve světlém režimu lépe vidět s vyšší opacitou
                this.contourMaterial.needsUpdate = true;
            }
            
            const gridVisible = this.gridHelper.visible;
            this.scene.remove(this.gridHelper);
            this.gridHelper = new THREE.GridHelper(60, 30, '#cbd5e1', '#cbd5e1'); // Ztmavení mřížky
            this.gridHelper.visible = gridVisible;
            this.gridHelper.position.y = -0.01;
            this.scene.add(this.gridHelper);
        } else {
            this.scene.background.set('#0b0e14');
            
            this.material.blending = THREE.AdditiveBlending;
            this.material.opacity = 0.85;
            this.material.needsUpdate = true;
            
            if (this.contourMaterial) {
                this.contourMaterial.blending = THREE.AdditiveBlending;
                this.contourMaterial.opacity = 0.6;
                this.contourMaterial.needsUpdate = true;
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
     * Nastaví barevné schéma bodů a čar.
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

        // Automatické otáčení scény (synchronizované pro body i čáry kontur)
        if (this.autoRotate) {
            this.pointCloud.rotation.y += 0.002;
            if (this.contourLines) {
                this.contourLines.rotation.y = this.pointCloud.rotation.y;
            }
        } else {
            this.pointCloud.rotation.y = 0;
            if (this.contourLines) {
                this.contourLines.rotation.y = 0;
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
