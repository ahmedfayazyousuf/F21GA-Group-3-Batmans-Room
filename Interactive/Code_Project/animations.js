// Animation system for rotating objects, moving lights, camera paths

export class AnimationSystem {
    constructor() {
        this.animations = [];
        this.time = 0;
    }
    
    addRotation(mesh, axis = [0, 1, 0], speed = 1.0) {
        this.animations.push({
            type: 'rotation',
            mesh: mesh,
            axis: axis,
            speed: speed,
            originalTransform: null,
        });
    }
    
    addFloat(mesh, amplitude = 0.1, speed = 1.0, axis = [0, 1, 0]) {
        this.animations.push({
            type: 'float',
            mesh: mesh,
            amplitude: amplitude,
            speed: speed,
            axis: axis,
            originalPosition: null,
        });
    }
    
    addPulse(light, minIntensity = 0.5, maxIntensity = 2.0, speed = 1.0) {
        this.animations.push({
            type: 'pulse',
            light: light,
            minIntensity: minIntensity,
            maxIntensity: maxIntensity,
            speed: speed,
            originalIntensity: light.intensity,
        });
    }
    
    addOrbit(light, center = [0, 0, 0], radius = 5.0, speed = 1.0, axis = [0, 1, 0]) {
        this.animations.push({
            type: 'orbit',
            light: light,
            center: center,
            radius: radius,
            speed: speed,
            axis: axis,
            originalPosition: light.position ? [...light.position] : [0, 0, 0],
        });
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        for (const anim of this.animations) {
            switch (anim.type) {
                case 'rotation':
                    if (!anim.originalTransform) {
                        anim.originalTransform = [...anim.mesh.transform];
                    }
                    // Rotation will be applied in render
                    break;
                    
                case 'float':
                    if (!anim.originalPosition) {
                        // Extract position from transform
                        anim.originalPosition = [
                            anim.mesh.transform[12],
                            anim.mesh.transform[13],
                            anim.mesh.transform[14],
                        ];
                    }
                    const floatOffset = Math.sin(this.time * anim.speed) * anim.amplitude;
                    anim.mesh.transform[12] = anim.originalPosition[0] + floatOffset * anim.axis[0];
                    anim.mesh.transform[13] = anim.originalPosition[1] + floatOffset * anim.axis[1];
                    anim.mesh.transform[14] = anim.originalPosition[2] + floatOffset * anim.axis[2];
                    break;
                    
                case 'pulse':
                    const pulseValue = (Math.sin(this.time * anim.speed) + 1.0) / 2.0;
                    anim.light.intensity = anim.minIntensity + (anim.maxIntensity - anim.minIntensity) * pulseValue;
                    break;
                    
                case 'orbit':
                    const angle = this.time * anim.speed;
                    if (anim.axis[1] > 0) {
                        // Orbit around Y axis
                        anim.light.position[0] = anim.center[0] + Math.cos(angle) * anim.radius;
                        anim.light.position[1] = anim.center[1];
                        anim.light.position[2] = anim.center[2] + Math.sin(angle) * anim.radius;
                    }
                    break;
            }
        }
    }
    
    getRotationMatrix(mesh) {
        const anim = this.animations.find(a => a.type === 'rotation' && a.mesh === mesh);
        if (!anim) return null;
        
        const angle = this.time * anim.speed;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const [x, y, z] = anim.axis;
        
        // Rotation matrix around arbitrary axis
        const c = cos;
        const s = sin;
        const t = 1 - cos;
        
        return [
            t * x * x + c,      t * x * y - s * z,  t * x * z + s * y,  0,
            t * x * y + s * z,  t * y * y + c,      t * y * z - s * x,  0,
            t * x * z - s * y,  t * y * z + s * x,  t * z * z + c,      0,
            0,                  0,                  0,                   1,
        ];
    }
}

