/**
 * SINAPSIS - Plasma Vortex Effect
 * Efecto de plasma con vórtices y patrón de puntos (WebGL)
 * Inspirado en Aura Financial / Unicorn Studio
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURACIÓN
    // ============================================
    const CONFIG = {
        // Color (Verde SINAPSIS)
        color: [0.0, 1.0, 0.53],  // #00FF88 normalizado
        
        // Alternativa Cyan (como Aura): [0.0, 0.78, 1.0]
        
        // Efecto
        dotDensity: 80.0,       // Densidad de puntos (mayor = más pequeños)
        speed: 0.3,             // Velocidad de animación
        intensity: 1.2,         // Intensidad del brillo
        vortexStrength: 2.5,    // Fuerza del remolino
        noiseScale: 1.5,        // Escala del ruido
        
        // Fade con scroll
        fadeOnScroll: true,
        fadeStart: 0,
        fadeEnd: 600
    };

    // ============================================
    // SHADERS WEBGL
    // ============================================
    const vertexShaderSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;
        
        varying vec2 v_uv;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_opacity;
        uniform vec3 u_color;
        uniform float u_dotDensity;
        uniform float u_vortexStrength;
        uniform float u_noiseScale;
        uniform float u_intensity;
        
        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                               -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                dot(x12.zw,x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
        
        // Fractal Brownian Motion
        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for(int i = 0; i < 5; i++) {
                value += amplitude * snoise(p * frequency);
                amplitude *= 0.5;
                frequency *= 2.0;
            }
            return value;
        }
        
        // Función de vórtice
        vec2 vortex(vec2 uv, vec2 center, float strength, float time) {
            vec2 d = uv - center;
            float dist = length(d);
            float angle = atan(d.y, d.x);
            
            // Rotación que disminuye con la distancia
            float rotation = strength / (dist + 0.3) * sin(time * 0.5);
            
            float newAngle = angle + rotation;
            return center + vec2(cos(newAngle), sin(newAngle)) * dist;
        }
        
        void main() {
            vec2 uv = v_uv;
            float aspect = u_resolution.x / u_resolution.y;
            vec2 uvAspect = vec2(uv.x * aspect, uv.y);
            
            float time = u_time;
            
            // Aplicar múltiples vórtices
            vec2 distortedUV = uvAspect;
            
            // Vórtice principal (derecha-arriba)
            distortedUV = vortex(distortedUV, vec2(0.7 * aspect, 0.65), u_vortexStrength, time);
            
            // Vórtice secundario (izquierda-abajo)
            distortedUV = vortex(distortedUV, vec2(0.25 * aspect, 0.3), u_vortexStrength * 0.7, time * 1.3);
            
            // Vórtice terciario (derecha-abajo)
            distortedUV = vortex(distortedUV, vec2(0.8 * aspect, 0.2), u_vortexStrength * 0.5, time * 0.8);
            
            // Ruido para distorsión adicional
            float noise1 = fbm(distortedUV * u_noiseScale + time * 0.1);
            float noise2 = fbm(distortedUV * u_noiseScale * 1.5 - time * 0.15);
            
            // Distorsión ondulada
            distortedUV += vec2(noise1, noise2) * 0.15;
            
            // Crear patrón de puntos
            vec2 gridUV = distortedUV * u_dotDensity;
            vec2 gridId = floor(gridUV);
            vec2 gridF = fract(gridUV) - 0.5;
            
            // Añadir variación al centro de cada punto
            float randomOffset = snoise(gridId * 0.5 + time * 0.1);
            
            // Distancia al centro del punto
            float dist = length(gridF);
            
            // Calcular intensidad basada en ruido y vórtices
            float noiseValue = fbm(distortedUV * 0.8 + time * 0.05);
            float intensity = smoothstep(0.0, 1.0, noiseValue * 0.5 + 0.5);
            
            // Onda de plasma
            float plasma = sin(distortedUV.x * 3.0 + time) * 0.5 + 0.5;
            plasma += sin(distortedUV.y * 2.5 - time * 0.7) * 0.5 + 0.5;
            plasma += sin((distortedUV.x + distortedUV.y) * 2.0 + time * 0.5) * 0.5 + 0.5;
            plasma /= 3.0;
            
            // Combinar todo
            float combined = intensity * plasma;
            
            // Radio del punto basado en la intensidad
            float dotRadius = 0.35 * combined + 0.05;
            
            // Suavizado del punto
            float dot = 1.0 - smoothstep(dotRadius - 0.1, dotRadius + 0.05, dist);
            
            // Brillo adicional en zonas de alta intensidad
            float glow = exp(-dist * 3.0) * combined * 0.5;
            
            // Color final
            float finalIntensity = (dot + glow) * combined * u_intensity;
            
            // Fade en los bordes
            float edgeFade = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x);
            edgeFade *= smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);
            
            finalIntensity *= edgeFade;
            
            vec3 color = u_color * finalIntensity;
            float alpha = finalIntensity * u_opacity;
            
            gl_FragColor = vec4(color, alpha);
        }
    `;

    // ============================================
    // CLASE PRINCIPAL
    // ============================================
    class PlasmaVortex {
        constructor() {
            this.canvas = null;
            this.gl = null;
            this.program = null;
            this.startTime = Date.now();
            this.opacity = 1.0;
            this.animationId = null;
            this.uniforms = {};
            
            this.init();
        }

        init() {
            if (!this.createCanvas()) return;
            if (!this.initWebGL()) return;
            this.bindEvents();
            this.animate();
        }

        createCanvas() {
            const container = document.createElement('div');
            container.id = 'plasma-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 0;
                overflow: hidden;
            `;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'plasma-canvas';
            this.canvas.style.cssText = `
                width: 100%;
                height: 100%;
            `;

            container.appendChild(this.canvas);
            document.body.insertBefore(container, document.body.firstChild);

            return true;
        }

        initWebGL() {
            this.gl = this.canvas.getContext('webgl', {
                alpha: true,
                premultipliedAlpha: false,
                antialias: true
            });

            if (!this.gl) {
                console.warn('WebGL not supported, falling back to canvas');
                return false;
            }

            const gl = this.gl;

            // Compilar shaders
            const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

            if (!vertexShader || !fragmentShader) return false;

            // Crear programa
            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);

            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Program link error:', gl.getProgramInfoLog(this.program));
                return false;
            }

            gl.useProgram(this.program);

            // Crear quad de pantalla completa
            const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const positionLoc = gl.getAttribLocation(this.program, 'a_position');
            gl.enableVertexAttribArray(positionLoc);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

            // Obtener ubicaciones de uniforms
            this.uniforms = {
                time: gl.getUniformLocation(this.program, 'u_time'),
                resolution: gl.getUniformLocation(this.program, 'u_resolution'),
                opacity: gl.getUniformLocation(this.program, 'u_opacity'),
                color: gl.getUniformLocation(this.program, 'u_color'),
                dotDensity: gl.getUniformLocation(this.program, 'u_dotDensity'),
                vortexStrength: gl.getUniformLocation(this.program, 'u_vortexStrength'),
                noiseScale: gl.getUniformLocation(this.program, 'u_noiseScale'),
                intensity: gl.getUniformLocation(this.program, 'u_intensity')
            };

            // Configurar blending
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            this.resize();

            return true;
        }

        compileShader(type, source) {
            const gl = this.gl;
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = window.innerWidth;
            const height = window.innerHeight;

            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;

            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        bindEvents() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => this.resize(), 100);
            });

            if (CONFIG.fadeOnScroll) {
                window.addEventListener('scroll', () => {
                    const scrollY = window.scrollY;
                    if (scrollY <= CONFIG.fadeStart) {
                        this.opacity = 1;
                    } else if (scrollY >= CONFIG.fadeEnd) {
                        this.opacity = 0.1;
                    } else {
                        this.opacity = 1 - ((scrollY - CONFIG.fadeStart) / (CONFIG.fadeEnd - CONFIG.fadeStart)) * 0.9;
                    }
                }, { passive: true });
            }

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pause();
                } else {
                    this.resume();
                }
            });
        }

        render() {
            const gl = this.gl;
            if (!gl) return;

            const time = (Date.now() - this.startTime) / 1000 * CONFIG.speed;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.uniform1f(this.uniforms.time, time);
            gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
            gl.uniform1f(this.uniforms.opacity, this.opacity);
            gl.uniform3fv(this.uniforms.color, CONFIG.color);
            gl.uniform1f(this.uniforms.dotDensity, CONFIG.dotDensity);
            gl.uniform1f(this.uniforms.vortexStrength, CONFIG.vortexStrength);
            gl.uniform1f(this.uniforms.noiseScale, CONFIG.noiseScale);
            gl.uniform1f(this.uniforms.intensity, CONFIG.intensity);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        animate() {
            this.render();
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        pause() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        resume() {
            if (!this.animationId) {
                this.startTime = Date.now();
                this.animate();
            }
        }

        destroy() {
            this.pause();
            const container = document.getElementById('plasma-container');
            if (container) container.remove();
        }
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new PlasmaVortex());
    } else {
        new PlasmaVortex();
    }

    window.PlasmaVortex = PlasmaVortex;
    console.log('🌀 SINAPSIS Plasma Vortex Effect loaded');
})();
