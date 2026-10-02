(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let backToTop = document.querySelector('.btn');
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
        });
    };

    if (backToTop) {
        // Compatibilité avec les anciennes pages dont la flèche était une div.
        if (backToTop.tagName !== 'BUTTON') {
            const replacement = document.createElement('button');
            replacement.className = backToTop.className;
            replacement.textContent = '↑';
            backToTop.replaceWith(replacement);
            backToTop = replacement;
        }
        backToTop.type = 'button';
        backToTop.setAttribute('aria-label', 'Retour en haut de la page');

        const isIndex = /(?:^|\/)(?:index\.html)?$/i.test(window.location.pathname);
        const gallery = isIndex ? document.querySelector('.gallery[data-projects]') : null;
        let menu = null;
        let shell = null;
        let backdrop = null;

        const fitMenu = () => {
            if (!menu || menu.hidden) return;
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            const viewportWidth = window.visualViewport?.width || window.innerWidth;
            const availableHeight = viewportHeight - 12;
            const maxColumns = Math.min(4, Math.max(2, Math.floor((viewportWidth - 24) / 160)));
            // Garder tous les projets visibles, même dans une fenêtre peu haute.
            for (let fontSize = 14; fontSize >= 8; fontSize--) {
                for (let columns = 1; columns <= maxColumns; columns++) {
                    shell.style.setProperty('--project-columns', columns);
                    shell.style.setProperty('--project-font-size', `${fontSize}px`);
                    shell.style.setProperty('--project-width', `${360 * columns}px`);
                    if (shell.getBoundingClientRect().height <= availableHeight) return;
                }
            }
        };

        const closeMenu = (restoreFocus = false) => {
            if (!menu) return;
            menu.hidden = true;
            shell.classList.remove('is-open');
            backdrop.classList.remove('is-visible');
            backToTop.setAttribute('aria-expanded', 'false');
            backToTop.setAttribute('aria-label', 'Ouvrir la liste des projets');
            if (restoreFocus) backToTop.focus({preventScroll: true});
        };

        if (gallery) {
            menu = document.createElement('nav');
            menu.id = 'project-shortcuts';
            menu.className = 'project-shortcuts';
            menu.hidden = true;
            menu.setAttribute('aria-label', 'Projets');
            const list = document.createElement('ul');

            // Reprendre automatiquement les noms et les liens des projets de l'index.
            const seen = new Set();
            gallery.querySelectorAll('a.gallery__link[href]').forEach(project => {
                const href = project.getAttribute('href');
                if (seen.has(href)) return;
                const label = project.querySelector('.gallery_overlay span');
                const name = label ? Array.from(label.childNodes)
                    .map(node => node.nodeName === 'BR' ? ' ' : node.textContent)
                    .join('').replace(/\s+/g, ' ').trim() : '';
                if (!name) return;
                seen.add(href);
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = href;
                link.textContent = name;
                link.addEventListener('click', () => closeMenu());
                item.append(link);
                list.append(item);
            });
            menu.append(list);
            shell = document.createElement('div');
            shell.className = 'project-navigation';
            shell.inert = true;
            backToTop.replaceWith(shell);
            shell.append(menu, backToTop);
            backToTop.setAttribute('aria-controls', menu.id);
            backToTop.setAttribute('aria-expanded', 'false');
            backToTop.setAttribute('aria-label', 'Ouvrir la liste des projets');
            backdrop = document.createElement('div');
            backdrop.className = 'project-menu-backdrop';
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.append(backdrop);
            // Intercepter le premier clic extérieur avant les liens de la page.
            document.addEventListener('click', event => {
                if (menu.hidden || menu.contains(event.target) || backToTop.contains(event.target)) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                closeMenu(true);
            }, {capture: true});
            window.addEventListener('resize', fitMenu);
            window.visualViewport?.addEventListener('resize', fitMenu);
            document.fonts?.ready.then(fitMenu);
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && !menu.hidden) {
                    event.preventDefault();
                    closeMenu(true);
                }
            });
        }

        backToTop.addEventListener('click', () => {
            if (!menu) return scrollToTop();
            if (!menu.hidden) {
                closeMenu(true);
                scrollToTop();
                return;
            }
            menu.hidden = false;
            shell.classList.add('is-open');
            backdrop.classList.add('is-visible');
            fitMenu();
            backToTop.setAttribute('aria-expanded', 'true');
            backToTop.setAttribute('aria-label', 'Remonter en haut de la page');
            if (!reducedMotion.matches) {
                shell.animate?.([
                    {clipPath: 'inset(calc(100% - 50px) 0 0 calc(100% - 50px) round 10px)'},
                    {clipPath: 'inset(0 0 0 0 round 10px)'},
                ], {duration: 180, easing: 'ease-out'});
            }
        });

        const updateVisibility = () => {
            const visible = window.scrollY > 0;
            backToTop.inert = !visible;
            backToTop.classList.toggle('is-visible', visible);
            if (shell) {
                shell.inert = !visible;
                shell.classList.toggle('is-visible', visible);
            }
            if (!visible) closeMenu();
        };
        window.addEventListener('scroll', updateVisibility, {passive: true});
        window.addEventListener('pageshow', () => {
            closeMenu();
            updateVisibility();
        });
        updateVisibility();
    }

    // Même mouvement pour toutes les images et vidéos, y compris les anciennes pages.
    document.querySelectorAll('[data-aos]').forEach(element => {
        if (element.matches('img, video') || element.querySelector('img, video')) {
            element.setAttribute('data-aos', 'fade-down');
            element.classList.add('media-reveal');
        }
    });

    // Sans AOS, le CSS laisse les contenus visibles.
    if (window.AOS) {
        window.AOS.init({
            duration: 1000,
            disable: () => reducedMotion.matches,
        });
        document.documentElement.classList.add('aos-ready');
    }
})();
