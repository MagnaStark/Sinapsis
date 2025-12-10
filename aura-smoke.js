/**
 * SINAPSIS - Aura Smoke Effect (WebGL)
 * Reemplazo del efecto de vórtice de puntos por humo fluido.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Buscamos el canvas específico
    const canvas = document.getElementById('smoke-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.warn('WebGL no disponible');
        return;
    }

    // Ajuste de tamaño responsive
    function resize() {
        const scale = window.devicePixelRatio || 1; 
        canvas.width = canvas.parentElement.offsetWidth * scale;
        canvas.height = canvas.parentElement.offsetHeight * scale;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    // --- SHADERS (La magia matemática) ---

    // Vertex Shader: Un simple cuadrado que cubre la pantalla
    const vertexSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // Fragment Shader: Simulación de fluidos
    const fragmentSource = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;

        // --- Funciones de Ruido Simplex ---
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

        // Fractal Brownian Motion (Crea la textura de humo)
        float fbm(vec2 p) {
            float f = 0.0;
            f += 0.5000 * snoise(p); p *= 2.02;
            f += 0.2500 * snoise(p); p *= 2.03;
            f += 0.1250 * snoise(p); p *= 2.01;
            return f;
        }

        void main() {
            // Normalizar coordenadas
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y; // Corregir aspecto

            // Centro de la pantalla
            vec2 center = vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5);
            
            // --- MÁSCARA DE ANILLO (AURA) ---
            // Esto asegura que el centro esté vacío para el texto
            float dist = length(st - center);
            // El humo vive entre radio 0.25 y 0.70
            float ringMask = smoothstep(0.15, 0.35, dist) * (1.0 - smoothstep(0.45, 0.85, dist));

            // --- DINÁMICA DE FLUIDOS (Domain Warping) ---
            float time = u_time * 0.15; // Velocidad del humo
            
            vec2 q = vec2(0.);
            q.x = fbm(st + 0.0 * time);
            q.y = fbm(st + vec2(1.0));

            vec2 r = vec2(0.);
            r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * time);
            r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * time);

            float f = fbm(st + r);

            // --- COLORIZACIÓN SINAPSIS ---
            // Verde brillante (#00FF88)
            vec3 colorGreen = vec3(0.0, 1.0, 0.53);
            // Verde oscuro profundo
            vec3 colorDark = vec3(0.0, 0.2, 0.1);
            // Negro
            vec3 colorBg = vec3(0.0, 0.0, 0.0);

            // Mezclamos colores basado en la densidad del humo 'f'
            vec3 color = mix(colorBg, colorDark, clamp(f * 2.0, 0.0, 1.0));
            color = mix(color, colorGreen, clamp(length(q), 0.0, 1.0));
            
            // Intensificar brillo en las crestas
            color += vec3(0.5, 1.0, 0.8) * pow(f, 3.0) * 0.5;

            // Aplicar la máscara de anillo y contraste
            gl_FragColor = vec4(color * ringMask * 1.8, 1.0);
        }
    `;

    // Compilar Shaders
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Configurar Buffer
    const positionLocation = gl.getAttribLocation(program, "position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    // Loop de Renderizado
    let startTime = performance.now();
    function render() {
        // Optimización: Detener si no se ve el canvas
        const rect = canvas.getBoundingClientRect();
        if (rect.bottom < 0) {
            requestAnimationFrame(render);
            return;
        }

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(timeLocation, (performance.now() - startTime) * 0.001);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});