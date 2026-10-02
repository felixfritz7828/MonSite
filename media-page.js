(() => {
    const recording = document.querySelector('#page-recording');
    if (!recording) return;
    const videos = Array.from(document.querySelectorAll('video'));
    const button = document.querySelector('#start-recording');
    const status = document.querySelector('#recording-status');
    const help = document.querySelector('#recording-help');
    const title = recording.dataset?.recordingTitle || 'Dosette';

    // Un seul élément audio ; le petit lecteur pilote celui qui existe déjà.
    const mini = document.createElement('div');
    mini.className = 'mini-recording';
    mini.inert = true;
    mini.setAttribute('role', 'group');
    mini.setAttribute('aria-label', `Lecteur de ${title}`);
    const miniStatus = document.createElement('span');
    miniStatus.className = 'mini-recording__status';
    const miniButton = document.createElement('button');
    miniButton.type = 'button';
    miniButton.setAttribute('aria-controls', recording.id);
    mini.append(miniStatus, miniButton);
    document.body.append(mini);

    let resumeAfterVideo = false;
    let resumeAfterNavigation = false;
    let leavingPage = false;
    let automaticAttempts = 0;
    let awaitingGesture = false;

    const videoIsPlaying = () => videos.some(video => !video.paused && !video.ended);
    const inform = (message = '') => {
        const paused = recording.paused || recording.ended;
        if (status) status.textContent = `${title} en ${paused ? 'pause' : 'cours'}`;
        miniStatus.textContent = `${title} en ${paused ? 'pause' : 'cours'}`;
        miniButton.textContent = paused ? '▶' : '❚❚';
        miniButton.setAttribute('aria-label', paused
            ? `Lire ${title}` : `Mettre ${title} en pause`);
        if (button) {
            button.hidden = !paused || videoIsPlaying();
            button.textContent = recording.currentTime > 0 && !recording.ended
                ? `Reprendre ${title}` : `Écouter ${title}`;
        }
        if (help) {
            help.textContent = message;
            help.hidden = !message;
        }
    };

    const startRecording = async (automatic = true) => {
        if (leavingPage || (automatic && videoIsPlaying())) return;
        if (!automatic) {
            awaitingGesture = false;
            resumeAfterVideo = false;
            videos.forEach(video => video.pause());
        }
        if (automatic) automaticAttempts++;
        try {
            await recording.play();
        } catch (error) {
            if (leavingPage || videoIsPlaying() || !recording.paused || error.name === 'AbortError') return;
            if (error.name === 'NotAllowedError') {
                awaitingGesture = automatic;
                inform("Utilisez le bouton ou le lecteur pour activer le son.");
            } else {
                awaitingGesture = false;
                inform('L’enregistrement est indisponible pour le moment.');
            }
        } finally {
            if (automatic) automaticAttempts--;
        }
    };

    // Les commandes du lecteur audio permettent aussi de reprendre manuellement.
    recording.addEventListener('play', () => {
        if (recording.paused || recording.ended) return;
        if (leavingPage) {
            recording.pause();
            return;
        }
        if (automaticAttempts && videoIsPlaying()) {
            resumeAfterVideo = true;
            recording.pause();
            return;
        }
        awaitingGesture = false;
        resumeAfterVideo = false;
        videos.forEach(video => video.pause());
        inform();
    });
    recording.addEventListener('pause', () => {
        if (leavingPage || !recording.paused) return;
        if (!videoIsPlaying()) awaitingGesture = false;
        inform(recording.ended ? 'L’enregistrement est terminé.' : '');
    });
    recording.addEventListener('ended', () => {
        awaitingGesture = false;
        inform('L’enregistrement est terminé.');
    });
    recording.addEventListener('error', () => {
        awaitingGesture = false;
        if (!leavingPage) inform('L’enregistrement est indisponible pour le moment.');
    });

    videos.forEach(video => {
        video.addEventListener('play', () => {
            if (video.paused || video.ended) return;
            if (leavingPage) {
                video.pause();
                return;
            }
            awaitingGesture = false;
            // Conserver l'intention de reprise lors d'un passage d'une vidéo à l'autre.
            resumeAfterVideo = resumeAfterVideo || (!recording.paused && !recording.ended);
            recording.pause();
            videos.forEach(other => { if (other !== video) other.pause(); });
            inform();
        });
        const resumeRecording = () => {
            if (leavingPage || videoIsPlaying() || !resumeAfterVideo) return;
            resumeAfterVideo = false;
            startRecording();
        };
        video.addEventListener('pause', resumeRecording);
        video.addEventListener('ended', resumeRecording);
        video.addEventListener('error', () => {
            video.pause();
            resumeRecording();
        });
    });

    button?.addEventListener('click', () => startRecording(false));
    miniButton.addEventListener('click', () => {
        awaitingGesture = false;
        resumeAfterVideo = false;
        if (recording.paused || recording.ended) startRecording(false);
        else recording.pause();
    });

    // Après un refus d'autoplay, retenter lors d'un véritable clic dans la page.
    // Les liens, contrôles et vidéos gardent leur action habituelle.
    document.addEventListener('click', event => {
        if (!event.isTrusted || !awaitingGesture || leavingPage || videoIsPlaying()) return;
        if (event.target.closest?.('a, button, audio, video, input, textarea, select, summary, [contenteditable]')) return;
        startRecording();
    });

    // Afficher le petit lecteur uniquement après avoir dépassé celui du haut.
    const updateVisibility = () => {
        const visible = recording.getBoundingClientRect().bottom <= 0;
        mini.inert = !visible;
        mini.classList.toggle('is-visible', visible);
    };
    updateVisibility();
    if ('IntersectionObserver' in window) {
        const observer = new window.IntersectionObserver(entries => {
            const entry = entries[entries.length - 1];
            const visible = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
            mini.inert = !visible;
            mini.classList.toggle('is-visible', visible);
        });
        observer.observe(recording);
    } else {
        window.addEventListener('scroll', updateVisibility, {passive: true});
        window.addEventListener('resize', updateVisibility);
    }

    // Arrêter le son à la sortie, y compris si la page est conservée dans le cache.
    window.addEventListener('pagehide', () => {
        resumeAfterNavigation = resumeAfterVideo || (!recording.paused && !recording.ended);
        leavingPage = true;
        awaitingGesture = false;
        resumeAfterVideo = false;
        recording.pause();
        videos.forEach(video => video.pause());
    });
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        leavingPage = false;
        updateVisibility();
        if (resumeAfterNavigation) startRecording();
        resumeAfterNavigation = false;
    });

    // Le navigateur reste maître de l'autorisation de lecture automatique avec son.
    inform();
    startRecording();
})();
