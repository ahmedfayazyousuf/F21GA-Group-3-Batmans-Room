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
            this.camera.position = [0, 2, 5];
            this.camera.target = [0, 0, 0];
            
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
                this.input.keys['r'] = false;
            }
        }
        
        this.scene.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
        
        this.animationId = requestAnimationFrame(() => this.animate());
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
