(() => {
    const tvViewport = window.matchMedia('(min-width: 1100px) and (min-height: 600px) and (orientation: landscape)');
    const fullscreenButtons = document.querySelectorAll('[data-tv-fullscreen]');
    const fullscreenAvailable = typeof document.documentElement.requestFullscreen === 'function' && document.fullscreenEnabled !== false;
    const surfaceSelectors = [
        '#firstRunSetup:not([hidden])', '#tutTooltip', '#tutWelcome', '#premiumModal.show',
        '#workoutPreview.show', '#settingsModal.show', '#setupCustomModal.show', '#finishedOverlay.show',
        '#modeChoice:not(.hidden)', '#coachRoundsSection:not([hidden])', '#trainingSection:not(.hidden)',
        '#sparringSetup:not(.hidden)', '.app'
    ];
    const focusable = 'button, a[href], input, select, textarea, [tabindex="0"]';

    function visible(element) {
        return element && element.getClientRects().length && getComputedStyle(element).visibility === 'visible';
    }

    function activeSurface() {
        return surfaceSelectors.map(selector => document.querySelector(selector)).find(visible);
    }

    function controls(surface) {
        return [...surface.querySelectorAll(focusable)].filter(element =>
            !element.disabled && element.tabIndex >= 0 && visible(element));
    }

    function defaultControl(surface, candidates) {
        return candidates.find(element => ['startBtn', 'continueBtn'].includes(element.id))
            || (surface.id === 'modeChoice' && candidates.find(element => element.classList.contains('mode-card')))
            || candidates[0];
    }

    function syncDisplay() {
        const isFullscreen = !!document.fullscreenElement;
        document.body.classList.toggle('tv-mode', tvViewport.matches);
        fullscreenButtons.forEach(button => {
            button.hidden = !fullscreenAvailable || (!tvViewport.matches && !isFullscreen);
            button.setAttribute('aria-pressed', String(isFullscreen));
        });
    }

    fullscreenButtons.forEach(button => button.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.documentElement.requestFullscreen();
        } catch {
            syncDisplay();
        }
    }));
    document.addEventListener('fullscreenchange', syncDisplay);

    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    document.addEventListener('keydown', event => {
        if (!document.body.classList.contains('tv-mode') || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (!directions[event.key] && !['Enter', ' ', 'Tab'].includes(event.key)) return;
        const surface = activeSurface();
        if (!surface) return;
        const candidates = controls(surface);
        const focused = document.activeElement;
        const index = candidates.indexOf(focused);

        if (event.key === 'Tab') {
            if (!candidates.length) return;
            event.preventDefault();
            const next = index < 0 ? (event.shiftKey ? candidates.length - 1 : 0)
                : (index + (event.shiftKey ? -1 : 1) + candidates.length) % candidates.length;
            candidates[next].focus();
            return;
        }
        if (focused.matches('input, select, textarea, [contenteditable="true"]')) return;
        if (event.key === 'Enter' && event.repeat) {
            event.preventDefault();
            return;
        }
        if (index >= 0 && focused.matches('[role="button"]:not(button)') && ['Enter', ' '].includes(event.key)) {
            event.preventDefault();
            if (!event.repeat) focused.click();
            return;
        }
        if (event.key === ' ' && surface.matches('.app') && (index < 0 || ['startBtn', 'continueBtn'].includes(focused.id))) {
            event.preventDefault();
            if (event.repeat) return;
            const timerButton = candidates.find(element => ['startBtn', 'continueBtn'].includes(element.id));
            timerButton?.click();
            return;
        }
        if (event.key === ' ' || (event.key === 'Enter' && index >= 0)) return;
        if (index < 0) {
            event.preventDefault();
            defaultControl(surface, candidates)?.focus();
            return;
        }

        const [x, y] = directions[event.key];
        const from = focused.getBoundingClientRect();
        let nearest, bestScore = Infinity;
        for (const candidate of candidates) {
            if (candidate === focused) continue;
            const to = candidate.getBoundingClientRect();
            const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
            const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
            const forward = dx * x + dy * y;
            if (forward <= 2) continue;
            const score = forward + 3 * Math.abs(dx * y - dy * x);
            if (score < bestScore) { nearest = candidate; bestScore = score; }
        }
        if (nearest) {
            event.preventDefault();
            nearest.focus();
        }
    });

    // Move focus into the new view when a remote button opens a different screen.
    document.addEventListener('click', event => {
        if (event.detail !== 0 || !document.body.classList.contains('tv-mode')) return;
        requestAnimationFrame(() => {
            const surface = activeSurface();
            if (!surface) return;
            const candidates = controls(surface);
            if (!candidates.includes(document.activeElement)) defaultControl(surface, candidates)?.focus();
        });
    });

    if (tvViewport.addEventListener) tvViewport.addEventListener('change', syncDisplay);
    else tvViewport.addListener(syncDisplay);
    syncDisplay();
})();
