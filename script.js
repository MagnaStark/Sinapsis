/**
 * SINAPSIS - JavaScript Principal
 */

document.addEventListener('DOMContentLoaded', () => {
    initLucideIcons();
    initNavigation();
    initScrollReveal();
    initStatsCounter();
    initParticles();
    initSmoothScroll();
    initFormHandling();
    initCurrentYear();
    initParallaxEffect();
    
    console.log('🚀 SINAPSIS website loaded');
});

/* LUCIDE ICONS */
function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/* NAVEGACIÓN */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    });
}

/* SCROLL REVEAL */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

/* CONTADOR DE ESTADÍSTICAS */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetValue = parseInt(target.getAttribute('data-target'));
                animateCounter(target, targetValue);
                observer.unobserve(target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/* PARTÍCULAS */
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer, i);
    }
}

function createParticle(container, index) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(0, 255, 136, ${Math.random() * 0.4 + 0.1});
        border-radius: 50%;
        left: ${startX}%;
        top: ${startY}%;
        pointer-events: none;
        animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
    `;
    
    container.appendChild(particle);
}

// Keyframes para partículas
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes floatParticle {
        0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
        }
        10% { opacity: 1; }
        50% {
            transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 50 + 20}px, -${Math.random() * 100 + 50}px) scale(1.2);
            opacity: 0.8;
        }
        90% { opacity: 1; }
    }
`;
document.head.appendChild(styleSheet);

/* SMOOTH SCROLL */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* FORMULARIO */
function initFormHandling() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (!validateForm(data)) {
            showNotification('Por favor, completa todos los campos requeridos.', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Enviando...
        `;
        
        setTimeout(() => {
            const whatsappMessage = encodeURIComponent(
                `Hola, soy ${data.name}.\n` +
                `Email: ${data.email}\n` +
                `Teléfono: ${data.phone || 'No proporcionado'}\n` +
                `Empresa: ${data.company || 'No proporcionada'}\n` +
                `Servicio: ${data.service}\n` +
                `Mensaje: ${data.message || 'Sin mensaje'}`
            );
            
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            lucide.createIcons();
            
            showNotification('¡Mensaje enviado! Te redirigimos a WhatsApp...', 'success');
            
            setTimeout(() => {
                window.open(`https://wa.me/529991002072?text=${whatsappMessage}`, '_blank');
            }, 1500);
            
        }, 1500);
    });
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorMsg = input.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    });
}

function validateForm(data) {
    const required = ['name', 'email', 'service'];
    
    for (const field of required) {
        if (!data[field] || data[field].trim() === '') return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return false;
    
    return true;
}

function validateInput(input) {
    const formGroup = input.parentElement;
    
    input.classList.remove('error');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    if (input.required && !input.value.trim()) {
        showInputError(input, 'Este campo es requerido');
        return false;
    }
    
    if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            showInputError(input, 'Ingresa un email válido');
            return false;
        }
    }
    
    return true;
}

function showInputError(input, message) {
    input.classList.add('error');
    const errorDiv = document.createElement('span');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `color:#FF6B6B;font-size:0.75rem;margin-top:0.25rem;display:block;`;
    input.parentElement.appendChild(errorDiv);
}

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const iconSvg = type === 'success' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    
    notification.innerHTML = `${iconSvg}<span>${message}</span>`;
    
    notification.style.cssText = `
        position:fixed;top:100px;right:24px;display:flex;align-items:center;gap:12px;
        padding:16px 24px;background:${type === 'success' ? 'rgba(0,255,136,0.1)' : 'rgba(255,107,107,0.1)'};
        border:1px solid ${type === 'success' ? 'rgba(0,255,136,0.3)' : 'rgba(255,107,107,0.3)'};
        border-radius:12px;color:${type === 'success' ? '#00FF88' : '#FF6B6B'};
        font-size:14px;font-family:'Outfit',sans-serif;z-index:9999;
        transform:translateX(120%);transition:transform 0.3s ease;
        box-shadow:0 10px 40px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/* AÑO ACTUAL */
function initCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

/* PARALLAX */
function initParallaxEffect() {
    const heroGlow = document.querySelector('.hero-glow');
    const heroGrid = document.querySelector('.hero-grid');
    
    if (!heroGlow) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        
        if (heroGlow) {
            heroGlow.style.transform = `translateX(-50%) translateY(${rate}px)`;
        }
        
        if (heroGrid) {
            heroGrid.style.transform = `translateY(${rate * 0.5}px)`;
        }
    });
    
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            if (heroGlow) {
                heroGlow.style.transform = `translateX(calc(-50% + ${x * 50}px)) translateY(${y * 30}px)`;
            }
        });
    }
}

/* ANIMACIÓN BARRAS */
document.addEventListener('DOMContentLoaded', () => {
    const chartBars = document.querySelectorAll('.chart-bar');
    
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'grow-bar 1s ease-out forwards';
            }
        });
    }, { threshold: 0.5 });
    
    chartBars.forEach(bar => {
        bar.style.height = '0';
        chartObserver.observe(bar);
    });
});