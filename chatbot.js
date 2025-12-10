/**
 * SINAPSIS Chatbot
 * Chatbot simple con flujos predefinidos
 */

(function() {
    // Configuración
    const CONFIG = {
        whatsapp: '529991002072',
        primaryColor: '#00FF88',
        companyName: 'SINAPSIS'
    };

    // Datos de servicios
    const SERVICIOS = {
        web: {
            titulo: 'Páginas Web Profesionales',
            descripcion: 'Creamos sitios web modernos, responsivos y optimizados para convertir visitantes en clientes.',
            caracteristicas: [
                'Diseño moderno y responsive',
                'Optimización SEO incluida',
                'Formularios y WhatsApp integrado',
                'Panel administrable (opcional)'
            ]
        },
        sistemas: {
            titulo: 'Sistemas de Gestión',
            descripcion: 'Centraliza tu información y automatiza tareas con sistemas a la medida de tu negocio.',
            caracteristicas: [
                'CRM y gestión de clientes',
                'Control de inventarios',
                'Sistema de citas y agenda',
                'Facturación integrada'
            ]
        },
        ia: {
            titulo: 'Automatización con IA',
            descripcion: 'Implementamos inteligencia artificial para automatizar procesos y mejorar la atención al cliente.',
            caracteristicas: [
                'Chatbots inteligentes',
                'Asistentes virtuales',
                'Análisis predictivo',
                'Automatización de tareas'
            ]
        },
        diagnostico: {
            titulo: 'Diagnóstico Digital Gratuito',
            descripcion: 'Analizamos tu negocio y te decimos exactamente qué necesitas para digitalizarte. Sin costo ni compromiso.',
            caracteristicas: [
                'Evaluación de procesos actuales',
                'Identificación de oportunidades',
                'Plan de acción personalizado',
                'Cotización detallada'
            ]
        },
        consultoria: {
            titulo: 'Consultoría Digital',
            descripcion: 'Te acompañamos en todo el proceso de transformación digital de tu empresa.',
            caracteristicas: [
                'Estrategia personalizada',
                'Capacitación a tu equipo',
                'Seguimiento mensual',
                'Soporte continuo'
            ]
        }
    };

    // Flujos de conversación
    const FLUJOS = {
        inicio: {
            mensaje: '¡Hola! 👋 Soy el asistente virtual de SINAPSIS. ¿En qué puedo ayudarte hoy?',
            opciones: [
                { texto: '🌐 Páginas Web', valor: 'web' },
                { texto: '📊 Sistemas de Gestión', valor: 'sistemas' },
                { texto: '🤖 Automatización con IA', valor: 'ia' },
                { texto: '🎯 Diagnóstico Gratuito', valor: 'diagnostico' },
                { texto: '💼 Consultoría', valor: 'consultoria' },
                { texto: '💬 Hablar con alguien', valor: 'contacto' }
            ]
        },
        servicio: {
            mensaje: '¿Te gustaría más información o prefieres que te contactemos?',
            opciones: [
                { texto: '📅 Agendar llamada', valor: 'agendar' },
                { texto: '💬 WhatsApp directo', valor: 'whatsapp' },
                { texto: '🔙 Ver otros servicios', valor: 'inicio' }
            ]
        },
        contacto: {
            mensaje: '¿Cómo prefieres que te contactemos?',
            opciones: [
                { texto: '💬 WhatsApp', valor: 'whatsapp' },
                { texto: '📧 Correo electrónico', valor: 'email' },
                { texto: '📞 Llamada telefónica', valor: 'agendar' }
            ]
        }
    };

    // Estado del chat
    let chatState = {
        isOpen: false,
        currentFlow: 'inicio',
        selectedService: null,
        messages: []
    };

    // Crear estilos
    function createStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .sinapsis-chatbot {
                --chat-primary: ${CONFIG.primaryColor};
                --chat-bg: #0A0A0A;
                --chat-card: #111111;
                --chat-border: rgba(255,255,255,0.1);
                --chat-text: #FFFFFF;
                --chat-text-secondary: #A0A0A0;
                font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
            }

            .chat-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: var(--chat-primary);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
                transition: all 0.3s ease;
            }

            .chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(0, 255, 136, 0.5);
            }

            .chat-toggle svg {
                width: 28px;
                height: 28px;
                fill: #0A0A0A;
                transition: transform 0.3s ease;
            }

            .chat-toggle.active svg {
                transform: rotate(90deg);
            }

            .chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                max-width: calc(100vw - 48px);
                height: 520px;
                max-height: calc(100vh - 120px);
                background: var(--chat-bg);
                border: 1px solid var(--chat-border);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s ease;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }

            .chat-window.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }

            .chat-header {
                padding: 16px 20px;
                background: var(--chat-card);
                border-bottom: 1px solid var(--chat-border);
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .chat-avatar {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, var(--chat-primary), #00CC6A);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #0A0A0A;
                font-size: 16px;
            }

            .chat-header-info h4 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: var(--chat-text);
            }

            .chat-header-info span {
                font-size: 12px;
                color: var(--chat-primary);
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .chat-header-info span::before {
                content: '';
                width: 6px;
                height: 6px;
                background: var(--chat-primary);
                border-radius: 50%;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .chat-messages::-webkit-scrollbar {
                width: 6px;
            }

            .chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }

            .chat-messages::-webkit-scrollbar-thumb {
                background: var(--chat-border);
                border-radius: 3px;
            }

            .chat-message {
                max-width: 85%;
                animation: messageIn 0.3s ease;
            }

            @keyframes messageIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chat-message.bot {
                align-self: flex-start;
            }

            .chat-message.user {
                align-self: flex-end;
            }

            .message-bubble {
                padding: 12px 16px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.5;
            }

            .bot .message-bubble {
                background: var(--chat-card);
                border: 1px solid var(--chat-border);
                color: var(--chat-text);
                border-bottom-left-radius: 4px;
            }

            .user .message-bubble {
                background: var(--chat-primary);
                color: #0A0A0A;
                border-bottom-right-radius: 4px;
            }

            .chat-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 12px;
            }

            .chat-option {
                padding: 12px 16px;
                background: transparent;
                border: 1px solid var(--chat-border);
                border-radius: 12px;
                color: var(--chat-text);
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
                font-family: inherit;
            }

            .chat-option:hover {
                border-color: var(--chat-primary);
                background: rgba(0, 255, 136, 0.1);
                color: var(--chat-primary);
            }

            .service-card {
                background: var(--chat-card);
                border: 1px solid var(--chat-border);
                border-radius: 12px;
                padding: 16px;
                margin-top: 8px;
            }

            .service-card h5 {
                margin: 0 0 8px 0;
                color: var(--chat-primary);
                font-size: 15px;
            }

            .service-card p {
                margin: 0 0 12px 0;
                color: var(--chat-text-secondary);
                font-size: 13px;
                line-height: 1.5;
            }

            .service-card ul {
                margin: 0 0 12px 0;
                padding-left: 0;
                list-style: none;
            }

            .service-card li {
                font-size: 12px;
                color: var(--chat-text-secondary);
                padding: 4px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .service-card li::before {
                content: '✓';
                color: var(--chat-primary);
                font-weight: bold;
            }

            .service-meta {
                display: flex;
                gap: 16px;
                padding-top: 12px;
                border-top: 1px solid var(--chat-border);
            }

            .service-meta span {
                font-size: 12px;
                color: var(--chat-text);
            }

            .service-meta strong {
                color: var(--chat-primary);
            }

            .chat-footer {
                padding: 16px 20px;
                border-top: 1px solid var(--chat-border);
                text-align: center;
            }

            .chat-footer span {
                font-size: 11px;
                color: var(--chat-text-secondary);
            }

            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: var(--chat-card);
                border: 1px solid var(--chat-border);
                border-radius: 16px;
                border-bottom-left-radius: 4px;
                width: fit-content;
            }

            .typing-indicator span {
                width: 8px;
                height: 8px;
                background: var(--chat-text-secondary);
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }

            @media (max-width: 480px) {
                .sinapsis-chatbot {
                    bottom: 16px;
                    right: 16px;
                }

                .chat-window {
                    width: calc(100vw - 32px);
                    height: calc(100vh - 100px);
                    bottom: 70px;
                    right: -8px;
                }

                .chat-toggle {
                    width: 54px;
                    height: 54px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Crear HTML del chatbot
    function createChatbot() {
        const container = document.createElement('div');
        container.className = 'sinapsis-chatbot';
        container.innerHTML = `
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-avatar">S</div>
                    <div class="chat-header-info">
                        <h4>SINAPSIS</h4>
                        <span>En línea</span>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-footer">
                    <span>Powered by SINAPSIS 🚀</span>
                </div>
            </div>
            <button class="chat-toggle" id="chatToggle" aria-label="Abrir chat">
                <svg viewBox="0 0 24 24" id="chatIcon">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
            </button>
        `;
        document.body.appendChild(container);

        // Event listeners
        document.getElementById('chatToggle').addEventListener('click', toggleChat);
    }

    // Toggle chat
    function toggleChat() {
        chatState.isOpen = !chatState.isOpen;
        const window = document.getElementById('chatWindow');
        const toggle = document.getElementById('chatToggle');
        
        window.classList.toggle('active', chatState.isOpen);
        toggle.classList.toggle('active', chatState.isOpen);

        // Cambiar icono
        const icon = document.getElementById('chatIcon');
        if (chatState.isOpen) {
            icon.innerHTML = '<path d="M18 6L6 18M6 6l12 12"/>';
            if (chatState.messages.length === 0) {
                setTimeout(() => showFlow('inicio'), 300);
            }
        } else {
            icon.innerHTML = '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>';
        }
    }

    // Mostrar mensaje
    function addMessage(content, isBot = true, options = null) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
        
        let html = `<div class="message-bubble">${content}</div>`;
        
        if (options && options.length > 0) {
            html += '<div class="chat-options">';
            options.forEach(opt => {
                html += `<button class="chat-option" data-value="${opt.valor}">${opt.texto}</button>`;
            });
            html += '</div>';
        }
        
        messageDiv.innerHTML = html;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Event listeners para opciones
        if (options) {
            messageDiv.querySelectorAll('.chat-option').forEach(btn => {
                btn.addEventListener('click', () => handleOption(btn.dataset.value));
            });
        }

        chatState.messages.push({ content, isBot });
    }

    // Mostrar indicador de escritura
    function showTyping() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Ocultar indicador de escritura
    function hideTyping() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    }

    // Mostrar flujo
    function showFlow(flowName) {
        const flow = FLUJOS[flowName];
        if (!flow) return;

        showTyping();
        setTimeout(() => {
            hideTyping();
            addMessage(flow.mensaje, true, flow.opciones);
        }, 800);
    }

    // Mostrar información de servicio
    function showServiceInfo(serviceKey) {
        const servicio = SERVICIOS[serviceKey];
        if (!servicio) return;

        chatState.selectedService = serviceKey;

        const serviceHtml = `
            ¡Excelente elección! Aquí tienes información sobre este servicio:
            <div class="service-card">
                <h5>${servicio.titulo}</h5>
                <p>${servicio.descripcion}</p>
                <ul>
                    ${servicio.caracteristicas.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        `;

        showTyping();
        setTimeout(() => {
            hideTyping();
            addMessage(serviceHtml, true);
            
            setTimeout(() => {
                showFlow('servicio');
            }, 500);
        }, 1000);
    }

    // Manejar opción seleccionada
    function handleOption(value) {
        // Mostrar respuesta del usuario
        const opciones = [...FLUJOS.inicio.opciones, ...FLUJOS.servicio.opciones, ...FLUJOS.contacto.opciones];
        const opcion = opciones.find(o => o.valor === value);
        if (opcion) {
            addMessage(opcion.texto, false);
        }

        setTimeout(() => {
            switch(value) {
                case 'web':
                case 'sistemas':
                case 'ia':
                case 'diagnostico':
                case 'consultoria':
                    showServiceInfo(value);
                    break;
                
                case 'contacto':
                    showFlow('contacto');
                    break;
                
                case 'inicio':
                    showFlow('inicio');
                    break;
                
                case 'whatsapp':
                    openWhatsApp();
                    break;
                
                case 'agendar':
                    showAgendarInfo();
                    break;
                
                case 'email':
                    showEmailInfo();
                    break;
                
                default:
                    showFlow('inicio');
            }
        }, 300);
    }

    // Abrir WhatsApp
    function openWhatsApp() {
        let mensaje = 'Hola, me interesa conocer más sobre los servicios de SINAPSIS.';
        
        if (chatState.selectedService && SERVICIOS[chatState.selectedService]) {
            mensaje = `Hola, me interesa el servicio de ${SERVICIOS[chatState.selectedService].titulo}. ¿Me pueden dar más información?`;
        }

        const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;
        
        showTyping();
        setTimeout(() => {
            hideTyping();
            addMessage('¡Perfecto! Te redirijo a WhatsApp para que hables con nuestro equipo. 💬', true);
            setTimeout(() => {
                window.open(url, '_blank');
            }, 1000);
        }, 500);
    }

    // Mostrar info para agendar
    function showAgendarInfo() {
        showTyping();
        setTimeout(() => {
            hideTyping();
            const mensaje = `
                ¡Claro! Para agendar una llamada puedes:
                <div class="service-card">
                    <p>📱 <strong>WhatsApp:</strong> +52 999 100 2072</p>
                    <p>📧 <strong>Email:</strong> contacto@sinapsisco.com</p>
                    <p>Escríbenos y coordinamos un horario que te funcione. Generalmente respondemos en menos de 2 horas.</p>
                </div>
            `;
            addMessage(mensaje, true, [
                { texto: '💬 Ir a WhatsApp', valor: 'whatsapp' },
                { texto: '🔙 Ver otros servicios', valor: 'inicio' }
            ]);
        }, 800);
    }

    // Mostrar info de email
    function showEmailInfo() {
        showTyping();
        setTimeout(() => {
            hideTyping();
            const mensaje = `
                Puedes escribirnos a:
                <div class="service-card">
                    <p>📧 <strong>contacto@sinapsisco.com</strong></p>
                    <p>Te responderemos en menos de 24 horas con toda la información que necesites.</p>
                </div>
            `;
            addMessage(mensaje, true, [
                { texto: '💬 Prefiero WhatsApp', valor: 'whatsapp' },
                { texto: '🔙 Ver servicios', valor: 'inicio' }
            ]);
        }, 800);
    }

    // Inicializar
    function init() {
        createStyles();
        createChatbot();
        console.log('🤖 SINAPSIS Chatbot cargado');
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
