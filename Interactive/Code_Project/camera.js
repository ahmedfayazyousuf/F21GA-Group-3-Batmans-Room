import { mat4, vec3 } from './math.js';

export class Camera {
    constructor(aspect = 16/9) {
        this.aspect = aspect;
        this.fov = 45 * Math.PI / 180;
        this.near = 0.1;
        this.far = 100.0;
        
        this.position = [0, 0, 5];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        
        this.yaw = -90;
        this.pitch = 0;
        
        this.initialPosition = [...this.position];
        this.initialTarget = [...this.target];
        this.initialYaw = this.yaw;
        this.initialPitch = this.pitch;
    }
    
    getViewMatrix() {
        return mat4.lookAt(this.position, this.target, this.up);
    }
    
    getProjectionMatrix() {
        return mat4.perspective(this.fov, this.aspect, this.near, this.far);
    }
    
    getViewProjectionMatrix() {
        const view = this.getViewMatrix();
        const proj = this.getProjectionMatrix();
        return mat4.multiply(proj, view);
    }
    
    rotate(dx, dy) {
        const sensitivity = 0.1;
        this.yaw += dx * sensitivity;
        this.pitch -= dy * sensitivity;
        
        // Clamp pitch
        this.pitch = Math.max(-89, Math.min(89, this.pitch));
        
        // Calculate new target based on yaw and pitch
        const yawRad = this.yaw * Math.PI / 180;
        const pitchRad = this.pitch * Math.PI / 180;
        
        const distance = vec3.distance(this.position, this.target);
        const dir = [
            Math.cos(pitchRad) * Math.cos(yawRad),
            Math.sin(pitchRad),
            Math.cos(pitchRad) * Math.sin(yawRad)
        ];
        
        this.target = [
            this.position[0] + dir[0] * distance,
            this.position[1] + dir[1] * distance,
            this.position[2] + dir[2] * distance
        ];
    }
    
    moveForward(speed) {
        const dir = vec3.normalize(vec3.subtract(this.target, this.position));
        this.position = vec3.add(this.position, vec3.scale(dir, speed));
        this.target = vec3.add(this.target, vec3.scale(dir, speed));
    }
    
    moveBackward(speed) {
        const dir = vec3.normalize(vec3.subtract(this.target, this.position));
        this.position = vec3.subtract(this.position, vec3.scale(dir, speed));
        this.target = vec3.subtract(this.target, vec3.scale(dir, speed));
    }
    
    moveLeft(speed) {
        const dir = vec3.normalize(vec3.subtract(this.target, this.position));
        const right = vec3.normalize(vec3.cross(dir, this.up));
        this.position = vec3.subtract(this.position, vec3.scale(right, speed));
        this.target = vec3.subtract(this.target, vec3.scale(right, speed));
    }
    
    moveRight(speed) {
        const dir = vec3.normalize(vec3.subtract(this.target, this.position));
        const right = vec3.normalize(vec3.cross(dir, this.up));
        this.position = vec3.add(this.position, vec3.scale(right, speed));
        this.target = vec3.add(this.target, vec3.scale(right, speed));
    }
    
    moveUp(speed) {
        this.position[1] += speed;
        this.target[1] += speed;
    }
    
    moveDown(speed) {
        this.position[1] -= speed;
        this.target[1] -= speed;
    }
    
    reset() {
        this.position = [...this.initialPosition];
        this.target = [...this.initialTarget];
        this.yaw = this.initialYaw;
        this.pitch = this.initialPitch;
    }
    
    setAspect(aspect) {
        this.aspect = aspect;
    }
}
