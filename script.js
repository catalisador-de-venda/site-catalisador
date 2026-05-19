/**
 * ==========================================================================
 * CONFIGURAÇÃO — ajuste antes de publicar
 * ========================================================================== */
const CATALISADOR_CONFIG = {
    /** Número com DDI + DDD, somente dígitos. Ex.: 5511999999999 */
    whatsappNumber: '5583993892685',
    /**
     * URL do Web App publicado (Google Apps Script).
     * Substitua após publicar — ver INTEGRACAO-GOOGLE-SHEETS.md
     */
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbzCNfK1j-HG7xK3ycfAvGiXiruPLZK1OadL01ss6YwR5mbijFbDwKkLnRB-UCCR90o2/exec',
    /** Mensagem pré-preenchida ao abrir o WhatsApp */
    whatsappMessage: 'Olá, acabei de solicitar o diagnóstico comercial.',
    /** Se true, redireciona para o WhatsApp após envio bem-sucedido */
    redirectToWhatsApp: true,
};

/**
 * ==========================================================================
 * CATALISADOR DE VENDAS - SCRIPT GLOBAL PREMIUM
 * --------------------------------------------------------------------------
 * Filosofia:
 * 1. Microinteracoes com transform/opacity para manter performance.
 * 2. Efeitos discretos: glow reativo, parallax leve e tilt suave.
 * 3. JavaScript puro, sem frameworks, sem dependencias externas.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * ======================================================================
     * 1. HELPERS GERAIS
     * ====================================================================== */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const runInFrame = (() => {
        let ticking = false;

        return (callback) => {
            if (ticking) return;

            ticking = true;
            window.requestAnimationFrame(() => {
                callback();
                ticking = false;
            });
        };
    })();

    /**
     * ======================================================================
     * 2. NAVBAR SCROLL - GLASSMORPHISM COM SOMBRA EDITORIAL
     * ====================================================================== */
    const navbar = document.getElementById('navbar');

    const updateNavbar = () => {
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add('bg-dark/85', 'backdrop-blur-xl', 'border-b', 'border-white/5', 'py-4', 'nav-scrolled');
            navbar.classList.remove('py-6', 'border-transparent');
        } else {
            navbar.classList.add('py-6', 'border-transparent');
            navbar.classList.remove('bg-dark/85', 'backdrop-blur-xl', 'border-b', 'border-white/5', 'py-4', 'nav-scrolled');
        }
    };

    updateNavbar();
    window.addEventListener('scroll', () => runInFrame(updateNavbar), { passive: true });

    /**
     * ======================================================================
     * 3. MOUSE REACTIVE GLOW - LUZ SUTIL SEM PESAR O LAYOUT
     * ====================================================================== */
    const mouseGlow = document.getElementById('mouse-glow');

    if (mouseGlow && !prefersReducedMotion && window.matchMedia('(min-width: 1025px)').matches) {
        let latestPointer = {
            x: window.innerWidth * 0.5,
            y: window.innerHeight * 0.18
        };

        const paintMouseGlow = () => {
            document.documentElement.style.setProperty('--mouse-x', `${latestPointer.x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${latestPointer.y}px`);
        };

        // Performance: atualiza apenas quando o mouse se move, sem loop infinito.
        window.addEventListener('pointermove', (event) => {
            latestPointer = {
                x: event.clientX,
                y: event.clientY
            };

            runInFrame(paintMouseGlow);
        }, { passive: true });
    }

    /**
     * ======================================================================
     * 4. MENU MOBILE - ABERTURA LIMPA E FECHAMENTO EM ANCORAS
     * ====================================================================== */
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    const setMobileMenuState = (isOpen) => {
        if (!mobileMenu || !mobileBtn) return;

        isMenuOpen = isOpen;
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('overflow-hidden', isOpen);

        mobileMenu.classList.toggle('opacity-0', !isOpen);
        mobileMenu.classList.toggle('pointer-events-none', !isOpen);
        mobileMenu.classList.toggle('opacity-100', isOpen);
        mobileMenu.classList.toggle('pointer-events-auto', isOpen);
    };

    if (mobileBtn && mobileMenu) {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.addEventListener('click', () => setMobileMenuState(!isMenuOpen));

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMobileMenuState(false));
        });
    }

    /**
     * ======================================================================
     * 4. REVEAL CINEMATICO EM SCROLL
     * ====================================================================== */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach((element) => revealOnScroll.observe(element));

    // Garante que o primeiro frame nao deixe conteudo visivel aguardando observer.
    window.setTimeout(() => {
        revealElements.forEach((element) => {
            if (element.getBoundingClientRect().top < window.innerHeight) {
                element.classList.add('active');
            }
        });
    }, 120);

    /**
     * ======================================================================
     * 6. PARALLAX SUAVE - PROFUNDIDADE SEM EXCESSO
     * ====================================================================== */
    const parallaxLayers = window.matchMedia('(min-width: 1024px)').matches
        ? document.querySelectorAll('[data-parallax-speed]')
        : [];

    const updateParallax = () => {
        if (prefersReducedMotion || !parallaxLayers.length) return;

        const viewportHeight = window.innerHeight;

        parallaxLayers.forEach((layer) => {
            const rect = layer.getBoundingClientRect();
            const speed = Number(layer.dataset.parallaxSpeed || 0);
            const centerDelta = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
            const movement = clamp(centerDelta * speed * -80, -48, 48);

            layer.style.transform = `translate3d(0, ${movement}px, 0)`;
        });
    };

    updateParallax();
    window.addEventListener('scroll', () => runInFrame(updateParallax), { passive: true });
    window.addEventListener('resize', () => runInFrame(updateParallax), { passive: true });

    /**
     * ======================================================================
     * 7. CARD GLOW + TILT - MICROINTERACAO PREMIUM
     * ----------------------------------------------------------------------
     * A pagina ja usa varios cards em Tailwind. Aqui adicionamos a classe
     * premium-card apenas aos blocos visuais, preservando o HTML original.
     * ====================================================================== */
    document.querySelectorAll('section div.group.relative').forEach((card) => {
        card.classList.add('premium-card');
    });

    const interactiveCards = document.querySelectorAll('.premium-card, .premium-tilt, .diagnostic-card, .fit-card, .editorial-photo:not(.editorial-photo-couple)');
    const canUsePremiumPointer = !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    interactiveCards.forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            if (!canUsePremiumPointer) return;

            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;

            card.style.setProperty('--card-x', `${percentX}%`);
            card.style.setProperty('--card-y', `${percentY}%`);

            if (!card.classList.contains('premium-tilt')) return;

            const rotateY = clamp((percentX - 50) / 12, -4, 4);
            const rotateX = clamp((50 - percentY) / 16, -3, 3);
            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -2px, 0)`;
        }, { passive: true });

        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--card-x');
            card.style.removeProperty('--card-y');
            card.style.transform = '';
        });
    });

    /**
     * ======================================================================
     * 8. FALLBACK DE IMAGENS EDITORIAIS
     * ====================================================================== */
    const markBrokenImage = (image) => {
        image.classList.add('image-error');
        const frame = image.closest('.editorial-photo, .hero-portrait');
        if (frame) frame.classList.add('is-placeholder');
    };

    document.querySelectorAll('.editorial-photo img, .hero-image').forEach((image) => {
        if (image.complete && image.naturalWidth === 0) {
            markBrokenImage(image);
            return;
        }

        image.addEventListener('error', () => markBrokenImage(image), { once: true });
    });

    /**
     * ======================================================================
     * 9. FORMULARIO - FLOATING LABELS, MASCARA E FEEDBACK SOFISTICADO
     * ====================================================================== */
    const diagnosticForm = document.getElementById('diagnostic-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const formSuccess = document.getElementById('form-success');
    const whatsappInput = document.getElementById('whatsapp');
    const formFields = document.querySelectorAll('.form-field');

    const syncFloatingLabels = () => {
        formFields.forEach((field) => {
            const control = field.querySelector('input, textarea, select');
            if (!control) return;

            field.classList.toggle('has-value', Boolean(control.value));
        });
    };

    formFields.forEach((field) => {
        const control = field.querySelector('input, textarea, select');
        if (!control) return;

        control.addEventListener('input', syncFloatingLabels);
        control.addEventListener('change', syncFloatingLabels);
        control.addEventListener('blur', syncFloatingLabels);
    });

    syncFloatingLabels();

    if (whatsappInput) {
        whatsappInput.addEventListener('input', (event) => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
            const match = digits.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);

            event.target.value = !match[2]
                ? match[1]
                : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;

            syncFloatingLabels();
        });
    }

    const formError = document.getElementById('form-error');
    const formHint = document.getElementById('form-hint');
    const STORAGE_KEY_LAST_SUBMIT = 'catalisador_last_submit';
    let isSubmitting = false;

    const hideFormError = () => {
        if (!formError) return;
        formError.textContent = '';
        formError.classList.add('hidden');
        if (formHint) formHint.classList.remove('hidden');
    };

    const showFormError = (message) => {
        if (!formError) return;
        formError.textContent = message;
        formError.classList.remove('hidden');
        if (formHint) formHint.classList.add('hidden');
    };

    const setSubmitLoading = (loading) => {
        if (!submitBtn || !btnText || !btnSpinner) return;

        btnText.classList.toggle('hidden', loading);
        btnSpinner.classList.toggle('hidden', !loading);
        submitBtn.classList.toggle('cursor-not-allowed', loading);
        submitBtn.classList.toggle('opacity-80', loading);
        submitBtn.disabled = loading;
    };

    const getFormPayload = () => ({
        nome: document.getElementById('nome')?.value?.trim() || '',
        whatsapp: document.getElementById('whatsapp')?.value?.trim() || '',
        empresa: document.getElementById('empresa')?.value?.trim() || '',
        desafio: document.getElementById('desafio')?.value || '',
        faturamento: document.getElementById('faturamento')?.value || '',
    });

    const validatePayload = (payload) => {
        if (!payload.nome || payload.nome.length < 2) {
            return 'Informe seu nome completo.';
        }

        const whatsappDigits = payload.whatsapp.replace(/\D/g, '');
        if (whatsappDigits.length < 10) {
            return 'Informe um WhatsApp válido com DDD.';
        }

        if (!payload.empresa || payload.empresa.length < 2) {
            return 'Informe o nome da empresa.';
        }

        if (!payload.desafio) {
            return 'Selecione o principal gargalo.';
        }

        if (!payload.faturamento) {
            return 'Selecione a faixa de faturamento mensal.';
        }

        return '';
    };

    const buildSubmitFingerprint = (payload) => {
        const digits = payload.whatsapp.replace(/\D/g, '');
        return `${digits}|${payload.nome.toLowerCase()}|${payload.empresa.toLowerCase()}`;
    };

    const isDuplicateSubmit = (fingerprint) => {
        try {
            return sessionStorage.getItem(STORAGE_KEY_LAST_SUBMIT) === fingerprint;
        } catch {
            return false;
        }
    };

    const markSubmitSuccess = (fingerprint) => {
        try {
            sessionStorage.setItem(STORAGE_KEY_LAST_SUBMIT, fingerprint);
        } catch {
            /* sessionStorage indisponível — segue sem bloqueio persistente */
        }
    };

    const buildWhatsAppUrl = () => {
        const message = encodeURIComponent(CATALISADOR_CONFIG.whatsappMessage || '');
        const number = String(CATALISADOR_CONFIG.whatsappNumber || '').replace(/\D/g, '');
        return `https://wa.me/${number}?text=${message}`;
    };

    const redirectToWhatsApp = () => {
        if (!CATALISADOR_CONFIG.redirectToWhatsApp) return;

        const number = String(CATALISADOR_CONFIG.whatsappNumber || '').replace(/\D/g, '');
        if (!number) return;

        const url = buildWhatsAppUrl();
        const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = url;
            return;
        }

        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened) {
            window.location.href = url;
        }
    };

    const sendToGoogleSheets = async (payload) => {
        const scriptUrl = String(CATALISADOR_CONFIG.googleScriptUrl || '').trim();

        if (!scriptUrl) {
            throw new Error('Configure a URL do Google Apps Script em CATALISADOR_CONFIG.googleScriptUrl.');
        }

        const body = new URLSearchParams({
            nome: payload.nome,
            whatsapp: payload.whatsapp,
            empresa: payload.empresa,
            gargalo: payload.desafio,
            faturamento: payload.faturamento,
            enviadoEm: new Date().toISOString(),
        });

        /* GET evita bloqueios de CORS/preflight comuns em Apps Script + GitHub Pages */
        const response = await fetch(`${scriptUrl}?${body.toString()}`, {
            method: 'GET',
            cache: 'no-store',
        });

        const raw = await response.text();
        let result = {};

        try {
            result = raw ? JSON.parse(raw) : {};
        } catch {
            result = { ok: response.ok };
        }

        if (!response.ok || result.ok === false) {
            throw new Error(result.error || 'Não foi possível registrar seu pedido. Tente novamente.');
        }

        return result;
    };

    const showFormSuccessOverlay = () => {
        if (!formSuccess) return;
        formSuccess.classList.remove('opacity-0', 'pointer-events-none');
    };

    if (diagnosticForm && submitBtn && btnText && btnSpinner && formSuccess) {
        diagnosticForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideFormError();

            if (isSubmitting) return;

            if (!diagnosticForm.reportValidity()) return;

            const payload = getFormPayload();
            const validationError = validatePayload(payload);

            if (validationError) {
                showFormError(validationError);
                return;
            }

            const fingerprint = buildSubmitFingerprint(payload);

            if (isDuplicateSubmit(fingerprint)) {
                showFormError('Este formulário já foi enviado. Aguarde ou fale conosco pelo WhatsApp.');
                return;
            }

            if (!String(CATALISADOR_CONFIG.googleScriptUrl || '').trim()) {
                showFormError('Integração pendente: configure a URL do Google Apps Script antes de publicar.');
                return;
            }

            isSubmitting = true;
            setSubmitLoading(true);

            try {
                await sendToGoogleSheets(payload);
                markSubmitSuccess(fingerprint);

                diagnosticForm.reset();
                syncFloatingLabels();
                showFormSuccessOverlay();
                setSubmitLoading(false);
                isSubmitting = false;

                window.setTimeout(() => {
                    redirectToWhatsApp();
                }, 900);

                if (!CATALISADOR_CONFIG.redirectToWhatsApp) {
                    window.setTimeout(() => {
                        formSuccess.classList.add('opacity-0', 'pointer-events-none');
                    }, 5000);
                }
            } catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Erro ao enviar. Verifique sua conexão e tente novamente.';

                showFormError(message);
                setSubmitLoading(false);
                isSubmitting = false;
            }
        });
    }

    /**
     * ======================================================================
     * 10b. CTA FLUTUANTE MOBILE
     * ====================================================================== */
    const mobileCtaBar = document.getElementById('mobile-cta-bar');
    const diagnosticoSection = document.getElementById('diagnostico');

    if (mobileCtaBar && diagnosticoSection) {
        const toggleMobileCta = () => {
            const rect = diagnosticoSection.getBoundingClientRect();
            const show = rect.top > window.innerHeight * 0.72;
            mobileCtaBar.classList.toggle('is-visible', show);
        };

        toggleMobileCta();
        window.addEventListener('scroll', () => runInFrame(toggleMobileCta), { passive: true });
    }

    /**
     * ======================================================================
     * 11. SCROLL SUAVE PARA ANCORAS COM COMPENSACAO DA NAVBAR
     * ====================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            event.preventDefault();

            const headerOffset = 92;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    });
});
