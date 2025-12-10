/**
 * SINAPSIS - Aura Ring Shader
 * Genera un anillo de humo fluido con centro vacío (WebGL)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración del Canvas
    const canvas = document.getElementById('smoke-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    function resize() {
        const scale = window.devicePixelRatio || 1;
        canvas.width = canvas.parentElement.offsetWidth * scale;
        canvas.height = canvas.parentElement.offsetHeight * scale;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    // 2. Vertex Shader (Geometría básica)
    const vertexSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // 3. Fragment Shader (La magia del Anillo)
    const fragmentSource = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;

        // --- Funciones de Ruido (Noise) ---
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        // FBM para textura de humo detallada
        float fbm(vec2 p) {
            float f = 0.0;
            f += 0.5000 * snoise(p); p *= 2.02;
            f += 0.2500 * snoise(p); p *= 2.03;
            f += 0.1250 * snoise(p); p *= 2.01;
            return f;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;

            // Centro exacto
            vec2 center = vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5);
            float dist = length(st - center);

            // --- MÁSCARA DE ANILLO (CRÍTICO) ---
            // Esto define el "Donut". 
            // 0.25 = radio interno (agujero)
            // 0.65 = radio externo (límite del humo)
            float hole = smoothstep(0.20, 0.35, dist); // El agujero del centro
            float edge = 1.0 - smoothstep(0.50, 0.75, dist); // El desvanecimiento exterior
            float ringMask = hole * edge; // Intersección = Anillo

            // Dinámica de fluidos
            float time = u_time * 0.15;
            vec2 q = vec2(0.);
            q.x = fbm(st + 0.0 * time);
            q.y = fbm(st + vec2(1.0));
            vec2 r = vec2(0.);
            r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * time);
            r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * time);
            float f = fbm(st + r);

            // Colores SINAPSIS
            vec3 colorBlack = vec3(0.0);
            vec3 colorGreen = vec3(0.0, 1.0, 0.53); // #00FF88
            vec3 colorDeep = vec3(0.0, 0.3, 0.2);

            // Mezcla de colores basada en el humo
            vec3 color = mix(colorBlack, colorDeep, clamp(f * 2.5, 0.0, 1.0));
            color = mix(color, colorGreen, clamp(length(q), 0.0, 1.0));
            
            // Aplicar la máscara del anillo
            // Si ringMask es 0 (centro), el color final es negro transparente
            gl_FragColor = vec4(color * ringMask * 1.5, 1.0);
        }
    `;

    // Compilar y linkear shaders
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    // Buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");

    let startTime = performance.now();
    function render() {
        gl.uniform1f(timeLoc, (performance.now() - startTime) * 0.001);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});