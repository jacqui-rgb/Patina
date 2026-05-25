document.addEventListener('DOMContentLoaded', () => {

    // ─── Header Scroll Effect ────────────────────────────────────────────────
    const header = document.getElementById('main-header');
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ─── Mobile Menu Toggle ──────────────────────────────────────────────────
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav  = document.querySelector('nav');

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.classList.toggle('open');
        mobileNav.classList.toggle('mobile-open', isOpen);
        document.body.classList.toggle('menu-active', isOpen);
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-link, .cta-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            mobileNav.classList.remove('mobile-open');
            document.body.classList.remove('menu-active');
        });
    });

    // ─── Smooth Scroll ──────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── Parallax Hero Background ────────────────────────────────────────────
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const offset = window.scrollY;
            heroBg.style.transform = `translateY(${offset * 0.4}px)`;
        }, { passive: true });
    }

    // ─── Scroll Reveal (Intersection Observer) ───────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target); // fire once
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll(
        '.reveal-text, .fade-in, .reveal, .project-card, .service-item, .section-header'
    ).forEach(el => revealObserver.observe(el));

    // ─── Staggered Children Animation ───────────────────────────────────────
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
        // Pre-mark children for animation
        el.querySelectorAll(':scope > *').forEach(child => {
            child.classList.add('stagger-child');
        });
        staggerObserver.observe(el);
    });

    // ─── Hero Entry Animation ────────────────────────────────────────────────
    setTimeout(() => {
        const heroText = document.querySelector('.reveal-text');
        const heroPara = document.querySelector('.fade-in');
        if (heroText) heroText.classList.add('visible');
        if (heroPara) setTimeout(() => heroPara.classList.add('visible'), 600);
    }, 400);

    // ─── Custom Cursor (Desktop only) ────────────────────────────────────────
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.id = 'cursor';
        document.body.appendChild(cursor);

        const cursorDot = document.createElement('div');
        cursorDot.id = 'cursor-dot';
        document.body.appendChild(cursorDot);

        let mouseX = 0, mouseY = 0;
        let dotX = 0, dotY = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
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

        // Grow on hover over interactive elements
        document.querySelectorAll('a, button, .project-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
        });
    }

});
