(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const backToTop = document.querySelector('.btn');

    backToTop?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
        });
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
