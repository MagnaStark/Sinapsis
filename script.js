document.addEventListener('DOMContentLoaded', () => {
    /* ==================== MENÚ MÓVIL ==================== */
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.nav-link');

    // Abrir/Cerrar menú
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer click en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    /* ==================== ANIMACIONES DE SCROLL (REVEAL) ==================== */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Ejecutar una vez al inicio para mostrar elementos visibles
    revealOnScroll();

    /* ==================== NAVBAR SCROLL EFFECT ==================== */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ==================== INICIALIZAR ICONOS LUCIDE ==================== */
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    /* ==================== AÑO ACTUAL EN FOOTER ==================== */
    const yearSpan = document.getElementById('current-year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});