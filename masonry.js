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
        const media = items.map(item => item.querySelector('img, video'));

        let scheduled = false;
        let lastWidth = gallery.clientWidth;
        const layout = () => {
            scheduled = false;
            const styles = getComputedStyle(gallery);
            const count = Number(styles.getPropertyValue('--gallery-columns')) || 3;
            const cropLimit = clamp(Number(styles.getPropertyValue('--gallery-crop-limit').trim() || 0.15), 0, 0.3);
            const keep = 1 - cropLimit;
            const gap = parseFloat(styles.getPropertyValue('--image-gap')) || 6;
            const padding = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']
                .map(side => parseFloat(styles[side]) || 0);
            const availableWidth = gallery.clientWidth - padding[0] - padding[1];
            if (availableWidth <= 0) return;
            const width = (availableWidth - gap * (count - 1)) / count;
            gallery.classList.add('is-masonry');
            items.forEach(item => {item.style.width = `${width}px`;});

            // Toujours repartir des dimensions originales, même après un recadrage.
            const entries = items.map((item, index) => {
                const element = media[index];
                const video = element?.tagName === 'VIDEO';
                const image = video ? null : element;
                const originalWidth = video ? element.videoWidth : image?.naturalWidth;
                const originalHeight = video ? element.videoHeight : image?.naturalHeight;
                const ready = !!(originalWidth && originalHeight);
                if (video) {
                    if (ready) element.style.setProperty('--video-ratio', `${originalWidth} / ${originalHeight}`);
                    else element.style.removeProperty('--video-ratio');
                }
                if (image && !ready) {
                    image.classList.remove('is-cropped');
                    image.style.removeProperty('--crop-height');
                }
                const caption = video
                    ? item.querySelector('.gallery__video-caption')
                    : null;

                const captionHeight = caption
                    ? caption.getBoundingClientRect().height
                    : 0;

                const height = ready
                    ? width * originalHeight / originalWidth + captionHeight
                    : item.getBoundingClientRect().height;
                return {item, image, video, ready, height, renderedHeight: height, top: 0};
            });
            const arrange = order => {
                const heights = Array(count).fill(padding[2]);
                const tails = Array(count).fill(null);
                const placed = order.map(entry => {
                    const column = heights.indexOf(Math.min(...heights));
                    const photo = {...entry, column, top: heights[column]};
                    heights[column] += entry.height + gap;
                    tails[column] = photo;
                    return photo;
                });
                const occupied = tails.filter(Boolean);
                const lastPhotos = occupied.filter(entry => entry.ready && entry.image);
                if (lastPhotos.length && occupied.length > 1 && cropLimit > 0) {
                    // Les vidéos gardent leur hauteur entière ; seules les photos peuvent être recadrées.
                    const canCrop = entry => entry.ready && entry.image;
                    const lower = Math.max(...occupied.map(entry => entry.top + entry.height * (canCrop(entry) ? keep : 1)));
                    const upper = Math.min(...occupied.map(entry => entry.top + entry.height / (canCrop(entry) ? keep : 1)));
                    const ends = occupied.map(entry => entry.top + entry.height).sort((a, b) => a - b);
                    const median = (ends[Math.floor((ends.length - 1) / 2)] + ends[Math.floor(ends.length / 2)]) / 2;
                    // Si les intervalles ne se croisent pas, combler au mieux les colonnes courtes.
                    const target = lower > upper ? lower : clamp(median, lower, upper);
                    lastPhotos.forEach(entry => {
                        const height = clamp(target - entry.top, entry.height * keep, entry.height / keep);
                        entry.renderedHeight = Math.abs(height - entry.height) > 0.01 ? height : entry.height;
                    });
                }
                const ends = tails.map(entry => entry ? entry.top + entry.renderedHeight : padding[2]);
                const bottom = Math.max(...ends);
                const blank = ends.reduce((sum, end) => sum + bottom - end, 0);
                return {placed, bottom, blank};
            };

            let best = arrange(entries);
            const baseline = best;
            const tailStart = Math.max(count, entries.length - 6);
            const prefix = entries.slice(0, tailStart);
            const tail = entries.slice(tailStart);
            // Au plus deux échanges voisins dans les six dernières images.
            // Garder le DOM intact, la première rangée et les années de l'accueil.
            if (tail.length > 1 && entries.every(entry => entry.ready)) {
                const seen = new Set();
                let bestMoves = Infinity;
                const explore = (order, moves) => {
                    const key = order.join(',');
                    if (seen.has(key)) return;
                    seen.add(key);
                    if (moves) {
                        const candidate = arrange([...prefix, ...order.map(index => tail[index])]);
                        const savesSpace = candidate.blank <= baseline.blank - gap;
                        const noLonger = candidate.bottom <= baseline.bottom + 0.01;
                        if (savesSpace && noLonger && (candidate.blank < best.blank - 0.01 ||
                            (Math.abs(candidate.blank - best.blank) <= 0.01 && moves < bestMoves))) {
                            best = candidate;
                            bestMoves = moves;
                        }
                    }
                    if (moves === 2) return;
                    for (let i = 0; i < order.length - 1; i++) {
                        const a = tail[order[i]], b = tail[order[i + 1]];
                        // Préserver la position des vidéos dans l'ordre d'insertion.
                        if (a.video || b.video) continue;
                        if (gallery.hasAttribute('data-projects') && a.item.dataset.year !== b.item.dataset.year) continue;
                        const next = [...order];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        explore(next, moves + 1);
                    }
                };
                explore(tail.map((_, index) => index), 0);
            }

            best.placed.forEach(entry => {
                entry.item.style.left = `${padding[0] + entry.column * (width + gap)}px`;
                entry.item.style.top = `${entry.top}px`;
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

            gallery.style.height = `${best.bottom + padding[3]}px`;
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
        gallery.querySelectorAll('img, video').forEach(element => {
            if (element.tagName === 'VIDEO') {
                element.addEventListener('loadedmetadata', schedule);
                element.addEventListener('resize', schedule);
                element.addEventListener('emptied', schedule);
            } else {
                element.addEventListener('load', schedule);
            }
            element.addEventListener('error', schedule);
        });
        window.addEventListener('resize', schedule);
        schedule();
    });
})();
