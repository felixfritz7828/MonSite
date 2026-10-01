(() => {
    const recording = document.querySelector('#page-recording');
    if (!recording) return;
    const videos = Array.from(document.querySelectorAll('video'));
    const button = document.querySelector('#start-recording');
    const status = document.querySelector('#recording-status');
    let resumeAfterVideo = false;
    let resumeAfterNavigation = false;
    let leavingPage = false;
    let automaticAttempts = 0;

    const videoIsPlaying = () => videos.some(video => !video.paused && !video.ended);
    const inform = (message, showButton = false) => {
        if (status) status.textContent = message;
        if (button) button.hidden = !showButton;
    };

    const startRecording = async (automatic = true) => {
        if (leavingPage || videoIsPlaying()) return;
        if (automatic) automaticAttempts++;
        try {
            await recording.play();
        } catch (error) {
            if (leavingPage || videoIsPlaying() || error.name === 'AbortError') return;
            if (error.name === 'NotAllowedError') {
                inform('Cliquez sur « Lancer l’enregistrement » pour activer le son.', true);
            } else {
                inform('L’enregistrement ne peut pas être lu. Vérifiez le fichier audio.');
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
        inform('Enregistrement en cours.');
    });
    recording.addEventListener('pause', () => {
        if (leavingPage || !recording.paused) return;
        inform(videoIsPlaying()
            ? 'Enregistrement en pause pendant la vidéo.'
            : recording.ended ? 'Enregistrement terminé.' : 'Enregistrement en pause.');
    });
    recording.addEventListener('ended', () => inform('Enregistrement terminé.'));
    recording.addEventListener('error', () => {
        if (!leavingPage) inform('L’enregistrement ne peut pas être lu. Vérifiez le fichier audio.');
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
            inform('Enregistrement en pause pendant la vidéo.');
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
    startRecording();
})();
