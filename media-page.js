(() => {
    const recording = document.querySelector('#page-recording');
    if (!recording) return;
    const videos = Array.from(document.querySelectorAll('video'));
    const button = document.querySelector('#start-recording');
    const status = document.querySelector('#recording-status');
    const help = document.querySelector('#recording-help');
    const title = recording.dataset?.recordingTitle || 'Dosette';
    let resumeAfterVideo = false;
    let resumeAfterNavigation = false;
    let leavingPage = false;
    let automaticAttempts = 0;

    const videoIsPlaying = () => videos.some(video => !video.paused && !video.ended);
    const inform = (message = '') => {
        const paused = recording.paused || recording.ended;
        if (status) status.textContent = `${title} en ${paused ? 'pause' : 'cours'}`;
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
        if (leavingPage || videoIsPlaying()) return;
        if (automatic) automaticAttempts++;
        try {
            await recording.play();
        } catch (error) {
            if (leavingPage || videoIsPlaying() || error.name === 'AbortError') return;
            if (error.name === 'NotAllowedError') {
                inform("Utilisez le bouton ou le lecteur pour activer le son.");
            } else {
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
        resumeAfterVideo = false;
        videos.forEach(video => video.pause());
        inform();
    });
    recording.addEventListener('pause', () => {
        if (leavingPage || !recording.paused) return;
        inform(recording.ended ? 'L’enregistrement est terminé.' : '');
    });
    recording.addEventListener('ended', () => inform('L’enregistrement est terminé.'));
    recording.addEventListener('error', () => {
        if (!leavingPage) inform('L’enregistrement est indisponible pour le moment.');
    });

    videos.forEach(video => {
        video.addEventListener('play', () => {
            if (video.paused || video.ended) return;
            if (leavingPage) {
                video.pause();
                return;
            }
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

    // Arrêter le son à la sortie, y compris si la page est conservée dans le cache.
    window.addEventListener('pagehide', () => {
        resumeAfterNavigation = resumeAfterVideo || (!recording.paused && !recording.ended);
        leavingPage = true;
        resumeAfterVideo = false;
        recording.pause();
        videos.forEach(video => video.pause());
    });
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        leavingPage = false;
        if (resumeAfterNavigation) startRecording();
        resumeAfterNavigation = false;
    });

    // Le navigateur reste maître de l'autorisation de lecture automatique avec son.
    inform();
    startRecording();
})();
