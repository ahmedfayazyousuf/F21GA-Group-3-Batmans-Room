// Simple 3D math library for WebGPU

export const vec3 = {
    create: (x = 0, y = 0, z = 0) => [x, y, z],
    
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    
    subtract: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    
    scale: (v, s) => [v[0] * s, v[1] * s, v[2] * s],
    
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    
    cross: (a, b) => [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ],
    
    length: (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]),
    
    normalize: (v) => {
        const len = vec3.length(v);
        if (len === 0) return [0, 0, 0];
        return [v[0] / len, v[1] / len, v[2] / len];
    },
    
    distance: (a, b) => vec3.length(vec3.subtract(a, b)),
};

export const mat4 = {
    create: () => new Float32Array(16),
    
    identity: () => {
        const m = mat4.create();
        m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
        return m;
    },
    
    multiply: (a, b) => {
        const out = mat4.create();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return out;
    },
    
    translate: (m, v) => {
        const out = [...m];
        out[12] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12];
        out[13] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13];
        out[14] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];
        out[15] = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15];
        return new Float32Array(out);
    },
    
    rotate: (m, angle, axis) => {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const [x, y, z] = vec3.normalize(axis);
        
        const t = 1 - c;
        const rot = mat4.create();
        
        rot[0] = t * x * x + c;
        rot[1] = t * x * y + s * z;
        rot[2] = t * x * z - s * y;
        rot[4] = t * x * y - s * z;
        rot[5] = t * y * y + c;
        rot[6] = t * y * z + s * x;
        rot[8] = t * x * z + s * y;
        rot[9] = t * y * z - s * x;
        rot[10] = t * z * z + c;
        rot[15] = 1;
        
        return mat4.multiply(m, rot);
    },
    
    scale: (m, v) => {
        const out = [...m];
        out[0] *= v[0];
        out[1] *= v[0];
        out[2] *= v[0];
        out[4] *= v[1];
        out[5] *= v[1];
        out[6] *= v[1];
        out[8] *= v[2];
        out[9] *= v[2];
        out[10] *= v[2];
        return new Float32Array(out);
    },
    
    perspective: (fov, aspect, near, far) => {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        
        const m = mat4.create();
        m[0] = f / aspect;
        m[5] = f;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[14] = (2 * far * near) * nf;
        return m;
    },
    
    lookAt: (eye, center, up) => {
        const z = vec3.normalize(vec3.subtract(eye, center));
        const x = vec3.normalize(vec3.cross(up, z));
        const y = vec3.cross(z, x);
        
        const m = mat4.create();
        m[0] = x[0];
        m[1] = y[0];
        m[2] = z[0];
        m[4] = x[1];
        m[5] = y[1];
        m[6] = z[1];
        m[8] = x[2];
        m[9] = y[2];
        m[10] = z[2];
        m[12] = -vec3.dot(x, eye);
        m[13] = -vec3.dot(y, eye);
        m[14] = -vec3.dot(z, eye);
        m[15] = 1;
        return m;
    },
};
