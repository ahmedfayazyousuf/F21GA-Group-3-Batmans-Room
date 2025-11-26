export class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseLocked = false;
        this.onMouseMove = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'Escape') {
                this.unlockMouse();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse
        this.canvas.addEventListener('click', () => {
            this.lockMouse();
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.mouseLocked) {
                const dx = e.movementX || 0;
                const dy = e.movementY || 0;
                
                if (this.onMouseMove && (dx !== 0 || dy !== 0)) {
                    this.onMouseMove(dx, dy);
                }
            }
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    lockMouse() {
        this.canvas.requestPointerLock();
        this.mouseLocked = true;
    }
    
    unlockMouse() {
        document.exitPointerLock();
        this.mouseLocked = false;
    }
}
