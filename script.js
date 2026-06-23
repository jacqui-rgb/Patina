document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════════════
    // IMAGE PROTECT SYSTEM
    // Global protection preventing right-clicking, image-dragging, page-saving, printing, and inspecting
    // ═══════════════════════════════════════════════════════
    // Disable right-click context menu globally across the website
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    }, true);

    // Disable dragging globally (stops dragging images/links to desktop)
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
    }, true);

    // Intercept keyboard shortcuts used to save, print, or inspect elements
    document.addEventListener('keydown', (e) => {
        // Prevent Save Page: Ctrl+S or Cmd+S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
        }
        // Prevent Print Page / Print to PDF: Ctrl+P or Cmd+P
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
        }
        // Prevent View Source: Ctrl+U or Cmd+Option+U
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
        }
        // Prevent Inspect / DevTools: F12, Ctrl+Shift+I / Cmd+Option+I, Ctrl+Shift+C
        if (e.key === 'F12' || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
            e.preventDefault();
        }
    }, true);

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
            if (id === 'cms-studio-body') {
                if (value.includes('\n')) {
                    el.innerHTML = value.split('\n\n').map(p => `<p style="margin-bottom: 1.5rem;">${p.replace(/\n/g, '<br>')}</p>`).join('');
                } else {
                    el.innerHTML = `<p style="margin-bottom: 1.5rem;">${value}</p>`;
                }
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
                <h3>${s.title}</h3>
                <div class="service-desc">
                    <p>${s.description}</p>
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
                studioNameEl.textContent = settings.studio_name;
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
            set('cms-footer-name', settings.studio_name);
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
                igEl.setAttribute('target', '_blank');
                igEl.setAttribute('rel', 'noopener noreferrer');
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

        // Ensure any external links (including dynamically loaded ones) open in a new tab
        handleExternalLinks();
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
        const cursor = document.createElement('div'); cursor.id = 'cursor';
        document.body.append(cursor);

        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top  = mouseY + 'px';
        });

        document.querySelectorAll('a, button, .project-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
        });
    }

    // ═══════════════════════════════════════════════════════
    // EXTERNAL LINKS HANDLER
    // Ensures any links to external pages or websites open in a new tab.
    // ═══════════════════════════════════════════════════════
    function handleExternalLinks() {
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href').trim();
            // Match absolute URLs starting with http://, https://, or //
            if (/^(https?:)?\/\//i.test(href)) {
                try {
                    const url = new URL(href, window.location.href);
                    if (url.hostname !== window.location.hostname) {
                        link.setAttribute('target', '_blank');
                        // Use rel="noopener noreferrer" for secure opening in new tab
                        link.setAttribute('rel', 'noopener noreferrer');
                    }
                } catch (e) {
                    // Fallback simple check if URL is parsed incorrectly
                    if (!href.includes(window.location.hostname)) {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    }
                }
            }
        });
    }

    // Run initially for any hardcoded static external links
    handleExternalLinks();

    // ═══════════════════════════════════════════════════════
    // FAQ ACCORDIONS (Progressive Enhancement)
    // ═══════════════════════════════════════════════════════
    function initFAQAccordions() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(item => {
            const question = item.querySelector('h3');
            if (!question) return;

            // Create trigger button wrapper (for perfect semantic HTML & keyboard accessibility)
            const trigger = document.createElement('button');
            trigger.className = 'faq-trigger';
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('type', 'button');

            // Insert trigger before the h3, and move h3 inside it
            question.parentNode.insertBefore(trigger, question);
            trigger.appendChild(question);

            // Add plus/minus indicator icon inside the trigger
            const icon = document.createElement('span');
            icon.className = 'faq-icon';
            trigger.appendChild(icon);

            // Wrap all remaining content of .faq-item (the answer) in a collapsible container
            const answer = document.createElement('div');
            answer.className = 'faq-answer';

            const answerInner = document.createElement('div');
            answerInner.className = 'faq-answer-inner';

            // Gather all siblings after the trigger and move them into the inner answer
            while (trigger.nextSibling) {
                answerInner.appendChild(trigger.nextSibling);
            }

            answer.appendChild(answerInner);
            item.appendChild(answer);

            // Toggle function
            const toggleItem = () => {
                const isActive = item.classList.contains('active');
                
                // Toggle active class and aria-expanded
                if (isActive) {
                    item.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            };

            // Click listener
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                toggleItem();
            });

            // If the custom cursor is enabled, also grow the cursor on trigger hover
            if (window.matchMedia('(pointer: fine)').matches) {
                const cursor = document.getElementById('cursor');
                if (cursor) {
                    trigger.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
                    trigger.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════
    // FAQ CATEGORY NAVIGATION
    // ═══════════════════════════════════════════════════════
    function initFAQCategoryNav() {
        const faqNavContainer = document.getElementById('faq-categories-nav');
        if (!faqNavContainer) return;

        const faqList = document.querySelector('.faq-list');
        if (!faqList) return;

        const categories = faqList.querySelectorAll('.faq-category');
        if (categories.length < 2) return;

        // Add class to list indicating navigation is active
        faqList.classList.add('has-nav');

        categories.forEach((category, index) => {
            const titleElement = category.querySelector('.faq-category-title');
            if (!titleElement) return;

            // Get clean text of category title
            const categoryTitle = titleElement.textContent.trim();

            // Create button for category tab
            const btn = document.createElement('button');
            btn.className = 'faq-nav-btn';
            btn.textContent = categoryTitle;
            btn.setAttribute('type', 'button');

            // Handle active/inactive states
            if (index === 0) {
                btn.classList.add('active');
                category.classList.add('active-category');
                
                // Force reveal of items in active category
                category.querySelectorAll('.reveal').forEach(item => {
                    item.classList.add('visible');
                });
            }

            // Click listener
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                // Deactivate all buttons & categories
                faqNavContainer.querySelectorAll('.faq-nav-btn').forEach(b => b.classList.remove('active'));
                categories.forEach(c => c.classList.remove('active-category'));

                // Activate selected
                btn.classList.add('active');
                category.classList.add('active-category');

                // Force reveal of items in the newly active category
                category.querySelectorAll('.reveal').forEach(item => {
                    item.classList.add('visible');
                });

                // Scroll to top of FAQ nav with safe header offset
                const rect = faqNavContainer.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                window.scrollTo({
                    top: absoluteTop - 100,
                    behavior: 'smooth'
                });
            });

            // Handle custom cursor if present
            if (window.matchMedia('(pointer: fine)').matches) {
                const cursor = document.getElementById('cursor');
                if (cursor) {
                    btn.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
                    btn.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
                }
            }

            faqNavContainer.appendChild(btn);
        });
    }

    // Initialize FAQ accordions and category navigation
    initFAQAccordions();
    initFAQCategoryNav();

    // ═══════════════════════════════════════════════════════
    // KICK OFF CONTENT LOAD
    // ═══════════════════════════════════════════════════════
    loadContent();

});
