(() => {
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    document.querySelectorAll('.gallery').forEach(gallery => {
        const items = Array.from(gallery.children);
        if (!items.length) return;

        // L'accueil reste classé du plus récent au plus ancien.
        if (gallery.hasAttribute('data-projects')) {
            items.sort((a, b) => (Number(b.dataset.year) || 0) - (Number(a.dataset.year) || 0));
            items.forEach(item => gallery.appendChild(item));
        }
        const photos = items.map(item => item.querySelector('img'));

        let scheduled = false;
        let lastWidth = gallery.clientWidth;
        const layout = () => {
            scheduled = false;
            const styles = getComputedStyle(gallery);
            const count = Number(styles.getPropertyValue('--gallery-columns')) || 3;
            const cropLimit = clamp(Number(styles.getPropertyValue('--gallery-crop-limit').trim() || 0.15), 0, 0.3);
            const keep = 1 - cropLimit;
            const gap = parseFloat(styles.getPropertyValue('--image-gap')) || 5;
            const availableWidth = gallery.clientWidth - 16;
            if (availableWidth <= 0) return;
            const width = (availableWidth - gap * (count - 1)) / count;
            const heights = Array(count).fill(0);
            const tails = Array(count).fill(null);
            gallery.classList.add('is-masonry');
            items.forEach(item => {item.style.width = `${width}px`;});

            // Toujours repartir des dimensions originales, même après un recadrage.
            const entries = items.map((item, index) => {
                const image = photos[index];
                const ready = !!(image?.naturalWidth && image?.naturalHeight);
                if (image && !ready) {
                    image.classList.remove('is-cropped');
                    image.style.removeProperty('--crop-height');
                }
                const height = ready
                    ? width * image.naturalHeight / image.naturalWidth
                    : item.getBoundingClientRect().height;
                return {item, image, ready, height, renderedHeight: height, top: 0};
            });
            entries.forEach(entry => {
                const column = heights.indexOf(Math.min(...heights));
                entry.top = heights[column];
                entry.item.style.left = `${8 + column * (width + gap)}px`;
                entry.item.style.top = `${entry.top}px`;
                heights[column] += entry.height + gap;
                tails[column] = entry;
            });

            // Rapprocher les fins des colonnes sans modifier les photos précédentes.
            const lastPhotos = tails.filter(entry => entry?.ready);
            if (lastPhotos.length > 1 && cropLimit > 0) {
                const lower = Math.max(...lastPhotos.map(entry => entry.top + entry.height * keep));
                const upper = Math.min(...lastPhotos.map(entry => entry.top + entry.height / keep));
                const ends = lastPhotos.map(entry => entry.top + entry.height).sort((a, b) => a - b);
                const median = (ends[Math.floor((ends.length - 1) / 2)] + ends[Math.floor(ends.length / 2)]) / 2;
                // Si un alignement complet dépasserait la limite, réduire l'écart au maximum.
                const target = clamp(median, Math.min(lower, upper), Math.max(lower, upper));
                lastPhotos.forEach(entry => {
                    entry.renderedHeight = clamp(target - entry.top, entry.height * keep, entry.height / keep);
                });
            }
            entries.forEach(entry => {
                if (!entry.image) return;
                const cropped = Math.abs(entry.renderedHeight - entry.height) > 0.01;
                entry.image.classList.toggle('is-cropped', cropped);
                if (cropped) {
                    entry.image.style.setProperty('--crop-height', `${entry.renderedHeight}px`);
                } else {
                    entry.image.style.removeProperty('--crop-height');
                    entry.renderedHeight = entry.height;
                }
            });

            const bottom = Math.max(...tails.filter(Boolean).map(entry => entry.top + entry.renderedHeight));
            gallery.style.height = `${bottom + 4}px`;
            lastWidth = gallery.clientWidth;
            if (document.documentElement.classList.contains('aos-ready')) window.AOS?.refresh();
        };
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(layout);
        };

        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(entries => {
                if (gallery.clientWidth !== lastWidth || entries.some(entry => entry.target !== gallery)) schedule();
            });
            observer.observe(gallery);
            items.forEach(item => observer.observe(item));
        }
        gallery.querySelectorAll('img').forEach(image => {
            image.addEventListener('load', schedule);
            image.addEventListener('error', schedule);
        });
        window.addEventListener('resize', schedule);
        schedule();
    });
})();
