document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════════════
    // CMS CONTENT LOADER
    // Fetches _data/*.json and populates DOM elements by ID.
    // Falls back gracefully to static HTML if fetch fails.
    // ═══════════════════════════════════════════════════════

    async function fetchJSON(path) {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn(`[CMS] Could not load ${path}:`, e.message);
            return null;
        }
    }

    function set(id, value) {
        const el = document.getElementById(id);
        if (el && value !== undefined && value !== null && value !== '') {
            if (id === 'cms-studio-body' && value.includes('\n')) {
                el.innerHTML = value.split('\n\n').map(p => `<p style="margin-bottom: 1.5rem;">${p.replace(/\n/g, '<br>')}</p>`).join('');
            } else {
                el.textContent = value;
            }
        }
    }

    function setHref(id, href) {
        const el = document.getElementById(id);
        if (el && href) {
            el.setAttribute('href', href);
            el.textContent = href; // display URL text (for email/social)
        }
    }

    function setAttr(id, attr, value) {
        const el = document.getElementById(id);
        if (el && value) el.setAttribute(attr, value);
    }

    function buildProjectsGrid(projects) {
        const grid = document.getElementById('cms-projects-grid');
        if (!grid || !projects?.length) return;
        grid.innerHTML = projects.map(p => `
            <a href="${p.link || '#'}" class="project-card${p.featured ? ' large' : ''}">
                <img src="${p.image}" alt="${p.image_alt || p.name}" loading="lazy">
                <div class="project-info">
                    <h3>${p.name}</h3>
                    <p>${p.category}</p>
                </div>
            </a>
        `).join('');
    }

    function buildServicesList(services) {
        const list = document.getElementById('cms-services-list');
        if (!list || !services?.length) return;
        list.innerHTML = services.map(s => `
            <a href="${s.link || '#'}" class="service-item">
                <div class="service-content">
                    <h3>${s.title}</h3>
                    <p>${s.description}</p>
                    <span class="learn-more">Learn More <span class="arrow">→</span></span>
                </div>
            </a>
        `).join('');
    }

    async function loadContent() {
        const [hero, studio, projectsData, servicesData, settings] = await Promise.all([
            fetchJSON('_data/hero.json'),
            fetchJSON('_data/studio.json'),
            fetchJSON('_data/projects.json'),
            fetchJSON('_data/services.json'),
            fetchJSON('_data/settings.json'),
        ]);

        // ── Hero ───────────────────────────────────────────
        if (hero) {
            set('cms-hero-headline', hero.headline);
            set('cms-hero-headline-em', hero.headline_em);
            set('cms-hero-sub', hero.subheadline);
            const bg = document.getElementById('cms-hero-bg');
            if (bg && hero.background_image) {
                bg.style.backgroundImage = `url('${hero.background_image}')`;
            }
        }

        // ── Studio / About ─────────────────────────────────
        if (studio) {
            set('cms-studio-title', studio.title);
            set('cms-studio-lead', studio.lead);
            set('cms-studio-body', studio.body);
            const cta = document.getElementById('cms-studio-cta');
            if (cta) {
                cta.textContent = studio.cta_label;
                cta.setAttribute('href', studio.cta_href);
            }
            setAttr('cms-studio-img', 'src', studio.image);
            setAttr('cms-studio-img', 'alt', studio.image_alt);
        }

        // ── Projects ───────────────────────────────────────
        if (projectsData?.projects) {
            buildProjectsGrid(projectsData.projects);
        }

        // ── Services ───────────────────────────────────────
        if (servicesData?.services) {
            buildServicesList(servicesData.services);
        }

        // ── Settings ───────────────────────────────────────
        if (settings) {
            // Header
            const studioNameEl = document.getElementById('cms-studio-name');
            if (studioNameEl && settings.studio_name) {
                // Show only the first word in the logo mark
                studioNameEl.textContent = settings.studio_name.split(' ')[0].toUpperCase();
            }

            // CTA section
            set('cms-cta-heading', settings.cta_heading);
            set('cms-cta-sub', settings.cta_subheading);
            set('cms-cta-btn', settings.cta_button_label);
            const ctaBg = document.getElementById('cms-cta-bg');
            if (ctaBg && settings.cta_background_image) {
                ctaBg.style.backgroundImage = `url('${settings.cta_background_image}')`;
            }

            // Footer
            set('cms-footer-name', settings.studio_name?.split(' ')[0]?.toUpperCase());
            set('cms-footer-tagline', settings.tagline);
            set('cms-footer-location', settings.location);
            set('cms-footer-year', settings.copyright_year);
            set('cms-footer-copy-name', settings.studio_name);

            const emailEl = document.getElementById('cms-footer-email');
            if (emailEl && settings.email) {
                emailEl.textContent = settings.email;
                emailEl.setAttribute('href', `mailto:${settings.email}`);
            }

            const igEl = document.getElementById('cms-footer-instagram');
            if (igEl) {
                igEl.textContent = 'Instagram';
                if (settings.instagram_url) igEl.setAttribute('href', settings.instagram_url);
            }
            const piEl = document.getElementById('cms-footer-pinterest');
            if (piEl) {
                piEl.textContent = 'Pinterest';
                if (settings.pinterest_url) piEl.setAttribute('href', settings.pinterest_url);
            }
        }

        // Re-observe newly built cards (after grid/list rebuild)
        document.querySelectorAll(
            '.project-card, .service-item, .stagger-child'
        ).forEach(el => {
            el.classList.remove('visible');
            revealObserver.observe(el);
        });
        document.querySelectorAll('.services-list, .footer-grid').forEach(el => {
            el.querySelectorAll(':scope > *').forEach(child => {
                child.classList.add('stagger-child');
            });
            staggerObserver.observe(el);
        });
    }

    // ═══════════════════════════════════════════════════════
    // HEADER SCROLL EFFECT
    // ═══════════════════════════════════════════════════════
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // ═══════════════════════════════════════════════════════
    // MOBILE MENU TOGGLE
    // ═══════════════════════════════════════════════════════
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav  = document.querySelector('nav');

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.classList.toggle('open');
        mobileNav.classList.toggle('mobile-open', isOpen);
        document.body.classList.toggle('menu-active', isOpen);
    });

    document.querySelectorAll('.nav-link, .cta-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            mobileNav.classList.remove('mobile-open');
            document.body.classList.remove('menu-active');
        });
    });

    // ═══════════════════════════════════════════════════════
    // SMOOTH SCROLL
    // ═══════════════════════════════════════════════════════
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            let href = this.getAttribute('href');
            if (href.startsWith('index.html')) {
                const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '' || !window.location.pathname.includes('.html');
                if (!isHomePage) {
                    return;
                }
                href = href.substring(10); // strip 'index.html'
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    // ═══════════════════════════════════════════════════════
    // PARALLAX HERO & SELECTED PROJECTS FONT COLOR TRANSITION
    // ═══════════════════════════════════════════════════════
    const heroBg = document.getElementById('cms-hero-bg');
    if (heroBg) {
        const selectedProjectsTitle = document.querySelector('#projects .section-title');
        
        const checkOverlap = () => {
            if (selectedProjectsTitle) {
                const titleRect = selectedProjectsTitle.getBoundingClientRect();
                const heroRect = heroBg.getBoundingClientRect();
                
                // Overlap exists if the top of the title is above the bottom of the hero image
                // and the bottom of the title is below the top of the hero image.
                const isOverlapping = titleRect.top < heroRect.bottom && titleRect.bottom > heroRect.top;
                
                selectedProjectsTitle.classList.toggle('over-image', isOverlapping);
            }
        };

        window.addEventListener('scroll', () => {
            heroBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
            checkOverlap();
        }, { passive: true });

        // Run once on load/init
        checkOverlap();
    }

    // ═══════════════════════════════════════════════════════
    // SCROLL REVEAL (Intersection Observer)
    // ═══════════════════════════════════════════════════════
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll(
        '.reveal-text, .fade-in, .reveal, .project-card, .service-item, .section-header'
    ).forEach(el => revealObserver.observe(el));

    // ═══════════════════════════════════════════════════════
    // STAGGERED CHILDREN
    // ═══════════════════════════════════════════════════════
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.querySelectorAll(':scope > *');
                children.forEach((child, i) => {
                    setTimeout(() => child.classList.add('visible'), i * 150);
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.services-list, .footer-grid').forEach(el => {
        el.querySelectorAll(':scope > *').forEach(child => child.classList.add('stagger-child'));
        staggerObserver.observe(el);
    });

    // ═══════════════════════════════════════════════════════
    // HERO ENTRY ANIMATION
    // ═══════════════════════════════════════════════════════
    setTimeout(() => {
        const heroText = document.querySelector('.reveal-text');
        const heroPara = document.querySelector('.fade-in');
        if (heroText) heroText.classList.add('visible');
        if (heroPara) setTimeout(() => heroPara.classList.add('visible'), 600);
    }, 400);

    // ═══════════════════════════════════════════════════════
    // CUSTOM CURSOR (Desktop only)
    // ═══════════════════════════════════════════════════════
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor    = document.createElement('div'); cursor.id    = 'cursor';
        const cursorDot = document.createElement('div'); cursorDot.id = 'cursor-dot';
        document.body.append(cursor, cursorDot);

        let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top  = mouseY + 'px';
        });

        const animateDot = () => {
            dotX += (mouseX - dotX) * 0.1;
            dotY += (mouseY - dotY) * 0.1;
            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top  = dotY + 'px';
            requestAnimationFrame(animateDot);
        };
        animateDot();

        document.querySelectorAll('a, button, .project-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
        });
    }

    // ═══════════════════════════════════════════════════════
    // KICK OFF CONTENT LOAD
    // ═══════════════════════════════════════════════════════
    loadContent();

});
