import { WebGPURenderer } from './renderer.js';
import { Scene } from './scene.js';
import { Camera } from './camera.js';
import { InputHandler } from './input.js';
import { ModelLoader } from './loader.js';

class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.loadingEl = document.getElementById('loading');
        this.errorEl = document.getElementById('error');
        this.uiEl = document.getElementById('ui');
        
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.input = null;
        this.animationId = null;
        this.lastTime = 0;
        
        this.init();
    }
    
    async init() {
        try {
            this.renderer = new WebGPURenderer(this.canvas);
            await this.renderer.init();
            
            this.scene = new Scene();
            const aspect = this.canvas.width > 0 ? this.canvas.width / this.canvas.height : 16/9;
            this.camera = new Camera(aspect);
            // Camera position from Blender:
            // Blender Location: X=6, Y=-6, Z=5.6444
            // Converted to WebGPU: [X, Z, -Y] = [6, 5.6444, 6]
            // But model is scaled down, so camera needs to be closer
            // Try scaling the Blender position by the model scale (0.1)
            this.camera.position = [6 * 0.1, 5.6444 * 0.1, 6 * 0.1];  // Scaled to match model scale
            // Camera target - looking at center of scene (model is centered at origin)
            this.camera.target = [0, 0, 0];
            
            console.log('Camera initialized at:', this.camera.position, 'looking at:', this.camera.target);
            
            // Store initial camera for reset
            this.initialCameraPos = [...this.camera.position];
            this.initialCameraTarget = [...this.camera.target];
            
            this.renderer.onResize((width, height) => {
                this.camera.setAspect(width / height);
            });
            
            this.input = new InputHandler(this.canvas);
            this.input.onMouseMove = (dx, dy) => {
                this.camera.rotate(dx, dy);
            };
            
            await this.loadScene();
            
            console.log('Scene meshes:', this.scene.meshes.length);
            console.log('Camera position:', this.camera.position);
            console.log('Camera target:', this.camera.target);
            console.log('Lights:', this.scene.lights.length);
            
            for (let i = 0; i < this.scene.meshes.length; i++) {
                const mesh = this.scene.meshes[i];
                console.log(`Mesh ${i}: has material:`, !!mesh.material, 'vertices:', mesh.vertices?.length);
            }
            
            this.loadingEl.style.display = 'none';
            this.uiEl.style.display = 'block';
            
            // Initialize dat.GUI for interactive controls
            this.setupGUI();
            
            this.animate();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError(error.message);
        }
    }
    
    async loadScene() {
        const loader = new ModelLoader();
        
        await this.scene.createDefaultScene(this.renderer);
        
        console.log('Scene loaded successfully');
    }
    
    animate() {
        const currentTime = performance.now() / 1000;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.input) {
            const moveSpeed = 3.0 * deltaTime;
            const rotSpeed = 1.5 * deltaTime;
            
            if (this.input.keys['w']) this.camera.moveForward(moveSpeed);
            if (this.input.keys['s']) this.camera.moveBackward(moveSpeed);
            if (this.input.keys['a']) this.camera.moveLeft(moveSpeed);
            if (this.input.keys['d']) this.camera.moveRight(moveSpeed);
            if (this.input.keys['q']) this.camera.moveUp(moveSpeed);
            if (this.input.keys['e']) this.camera.moveDown(moveSpeed);
            
            if (this.input.keys['l']) {
                this.scene.toggleLights();
                this.input.keys['l'] = false;
            }
            
            if (this.input.keys['b']) {
                this.renderer.toggleBloom();
                this.input.keys['b'] = false;
            }
            
            if (this.input.keys['r']) {
                this.camera.reset();
                // Also reset to initial position
                this.camera.position = [...this.initialCameraPos];
                this.camera.target = [...this.initialCameraTarget];
                this.input.keys['r'] = false;
            }
        }
        
        this.scene.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    setupGUI() {
        // dat.GUI for real-time parameter adjustment
        if (typeof dat !== 'undefined' && dat.GUI) {
            const gui = new dat.GUI({ name: 'Batman Room Controls' });
            
            // Camera controls - create object for dat.GUI to bind to
            const cameraControls = {
                posX: this.camera.position[0],
                posY: this.camera.position[1],
                posZ: this.camera.position[2],
                targetX: this.camera.target[0],
                targetY: this.camera.target[1],
                targetZ: this.camera.target[2],
                fov: (this.camera.fov * 180 / Math.PI), // Convert to degrees for display
            };
            const cameraFolder = gui.addFolder('Camera');
            cameraFolder.add(cameraControls, 'posX', -10, 10).name('Position X').onChange((value) => {
                this.camera.position[0] = value;
            });
            cameraFolder.add(cameraControls, 'posY', 0, 10).name('Position Y').onChange((value) => {
                this.camera.position[1] = value;
            });
            cameraFolder.add(cameraControls, 'posZ', -10, 10).name('Position Z').onChange((value) => {
                this.camera.position[2] = value;
            });
            cameraFolder.add(cameraControls, 'targetX', -5, 5).name('Target X').onChange((value) => {
                this.camera.target[0] = value;
            });
            cameraFolder.add(cameraControls, 'targetY', -5, 5).name('Target Y').onChange((value) => {
                this.camera.target[1] = value;
            });
            cameraFolder.add(cameraControls, 'targetZ', -5, 5).name('Target Z').onChange((value) => {
                this.camera.target[2] = value;
            });
            cameraFolder.add(cameraControls, 'fov', 30, 90).name('FOV (degrees)').onChange((value) => {
                this.camera.fov = value * Math.PI / 180;
            });
            
            // Preset camera positions for quick navigation
            const presets = {
                'Front View': () => {
                    this.camera.position = [0, 1.5, 4];
                    this.camera.target = [0, 0, 0];
                    cameraControls.posX = this.camera.position[0];
                    cameraControls.posY = this.camera.position[1];
                    cameraControls.posZ = this.camera.position[2];
                    cameraControls.targetX = this.camera.target[0];
                    cameraControls.targetY = this.camera.target[1];
                    cameraControls.targetZ = this.camera.target[2];
                    gui.updateDisplay();
                },
                'Top View': () => {
                    this.camera.position = [0, 5, 0];
                    this.camera.target = [0, 0, 0];
                    cameraControls.posX = this.camera.position[0];
                    cameraControls.posY = this.camera.position[1];
                    cameraControls.posZ = this.camera.position[2];
                    gui.updateDisplay();
                },
                'Side View': () => {
                    this.camera.position = [4, 1.5, 0];
                    this.camera.target = [0, 0, 0];
                    cameraControls.posX = this.camera.position[0];
                    cameraControls.posY = this.camera.position[1];
                    cameraControls.posZ = this.camera.position[2];
                    gui.updateDisplay();
                },
                'Close Up': () => {
                    this.camera.position = [0, 1, 2];
                    this.camera.target = [0, 0, 0];
                    cameraControls.posX = this.camera.position[0];
                    cameraControls.posY = this.camera.position[1];
                    cameraControls.posZ = this.camera.position[2];
                    gui.updateDisplay();
                },
            };
            cameraFolder.add(presets, 'Front View').name('Front View');
            cameraFolder.add(presets, 'Top View').name('Top View');
            cameraFolder.add(presets, 'Side View').name('Side View');
            cameraFolder.add(presets, 'Close Up').name('Close Up');
            cameraFolder.open();
            
            // Lighting controls
            const lightFolder = gui.addFolder('Lighting');
            lightFolder.add(this.scene, 'lightsEnabled').name('Lights On/Off');
            if (this.scene.lights.length > 0) {
                lightFolder.add(this.scene.lights[0], 'intensity', 0, 5).name('Directional Intensity');
                if (this.scene.lights[1]) {
                    lightFolder.add(this.scene.lights[1], 'intensity', 0, 5).name('Point Intensity');
                }
            }
            lightFolder.open();
            
            // Post-processing controls
            const postFolder = gui.addFolder('Post-Processing');
            postFolder.add(this.renderer, 'bloomEnabled').name('Bloom');
            if (this.renderer.postProcessor) {
                postFolder.add(this.renderer.postProcessor, 'bloomIntensity', 0, 3).name('Bloom Intensity');
                postFolder.add(this.renderer.postProcessor, 'toneMappingExposure', 0, 3).name('Exposure');
                postFolder.add(this.renderer.postProcessor, 'saturation', 0, 2).name('Saturation');
            }
            postFolder.open();
            
            // Animation controls
            const animFolder = gui.addFolder('Animations');
            animFolder.add(this.scene, 'time', 0, 100).name('Time').listen();
            animFolder.open();
            
            console.log('dat.GUI controls initialized');
        } else {
            console.warn('dat.GUI not available - controls disabled');
        }
    }
    
    showError(message) {
        this.loadingEl.style.display = 'none';
        this.errorEl.textContent = `Error: ${message}`;
        this.errorEl.style.display = 'block';
    }
}

window.addEventListener('load', () => {
    new App();
});
