document.addEventListener("DOMContentLoaded", () => {

    const entryElements = document.querySelectorAll('.page-entry-anim');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealEntry = (el, delay = 0) => {
        if (prefersReducedMotion || !el.animate) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            return;
        }

        window.setTimeout(() => {
            el.animate(
                [
                    { opacity: 0, transform: 'translateY(24px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                {
                    duration: 460,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    fill: 'both'
                }
            );
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, delay);
    };

    entryElements.forEach((el, index) => revealEntry(el, index * 90));

    /*
     * INFINITE GALLERY LOADER & STATE MANAGEMENT
     */
    const galleryContainer = document.getElementById('photography-gallery');
    const galleryLoader = document.getElementById('gallery-loader');

    const curatedImageOrder = [
        2, 3, 4, 7, 8, 9, 14, 21,
        1, 5, 6, 10, 11, 12, 13, 15,
        16, 17, 18, 19, 20, 22, 23, 24,
        25, 26, 27, 28, 29, 30, 31, 32,
        33, 34, 35, 36, 37
    ];
    const imageFiles = curatedImageOrder.map(index => `${index}.jpg`);
    const basePath = "picture/photographer/";
    const thumbnailBasePath = "picture/photographer/thumbs/";
    const loadedImagesSrc = imageFiles.map(file => `${basePath}${file}`);
    const thumbnailImagesSrc = imageFiles.map(file => `${thumbnailBasePath}${file}`);

    const tallImages = new Set([4, 5, 6, 8, 10, 11, 16, 17, 18, 19, 20, 25, 26, 27, 29, 30, 33, 34]);
    const ultraWideImages = new Set([23]);

    const getGridSpanClass = (imageNumber, displayIndex) => {
        const category = ultraWideImages.has(imageNumber)
            ? 'ultra-wide'
            : tallImages.has(imageNumber)
                ? 'tall'
                : 'wide';

        if (category === 'wide' && displayIndex % 4 === 0) {
            return "md:col-span-2 md:row-span-2";
        }

        if (category === 'tall') {
            return "md:col-span-1 md:row-span-2";
        }

        return "md:col-span-2 md:row-span-1";
    };

    if (galleryContainer) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (prefersReducedMotion || !el.animate) {
                        el.style.opacity = 1; el.style.transform = 'translateY(0) scale(1)';
                    } else {
                        el.animate(
                            [
                                { opacity: 0, transform: 'translateY(28px) scale(0.97)' },
                                { opacity: 1, transform: 'translateY(0) scale(1)' }
                            ],
                            {
                                duration: 640,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            }
                        );
                        el.style.opacity = 1;
                        el.style.transform = 'translateY(0) scale(1)';
                    }
                    observer.unobserve(el);
                }
            });
        }, { rootMargin: '100px', threshold: 0.1 });

    let renderedCount = 0;
        let isRenderingBatch = false;
        const batchSize = 6;

        const renderPhoto = (thumbSrc, arrayIndex) => {
            const wrapper = document.createElement('div');
            const img = new Image();
            const imageNumber = curatedImageOrder[arrayIndex];
            const spanClass = getGridSpanClass(imageNumber, arrayIndex + 1);

            wrapper.className = `photo-item flex items-center justify-center bg-white/5 opacity-0 translate-y-8 scale-95 ${spanClass}`;
            wrapper.setAttribute('role', 'button');
            wrapper.setAttribute('tabindex', '0');
            wrapper.setAttribute('aria-label', `打开摄影作品 ${imageNumber}`);
            img.className = "w-full h-full object-cover select-none opacity-0 transition-opacity duration-500";
            img.loading = arrayIndex < batchSize ? "eager" : "lazy";
            img.decoding = "async";
            img.alt = `Changhao Qin 摄影作品 ${imageNumber}`;

            img.onload = () => {
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
            };

            img.onerror = () => {
                console.warn(`Could not load gallery image: ${thumbSrc}`);
                wrapper.remove();
            };

            wrapper.appendChild(img);
            const openPhoto = () => {
                openLightbox(arrayIndex);
            };
            wrapper.addEventListener('click', openPhoto);
            wrapper.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPhoto();
                }
            });
            galleryContainer.appendChild(wrapper);
            imageObserver.observe(wrapper);
            img.src = thumbSrc;
        };

        const renderNextBatch = () => {
            if (isRenderingBatch || renderedCount >= loadedImagesSrc.length) return;
            isRenderingBatch = true;

            const nextImages = thumbnailImagesSrc.slice(renderedCount, renderedCount + batchSize);
            nextImages.forEach((thumbSrc, offset) => {
                renderPhoto(thumbSrc, renderedCount + offset);
            });

            renderedCount += nextImages.length;
            isRenderingBatch = false;

            if (galleryLoader) {
                if (renderedCount >= loadedImagesSrc.length) {
                    galleryLoader.style.display = 'none';
                } else {
                    const loaderIcon = galleryLoader.querySelector('.gallery-loader-icon');
                    if (loaderIcon) {
                        loaderIcon.classList.remove('is-spinning');
                        loaderIcon.setAttribute('aria-label', '更多照片');
                    }
                    galleryLoader.style.opacity = '1';
                    const loaderLabel = galleryLoader.querySelector('[data-loader-label]');
                    if (loaderLabel) loaderLabel.textContent = '加载更多照片';
                }
            }
        };

        renderNextBatch();

        // Auto-load more via IntersectionObserver only (remove redundant scroll listener)
        let canAutoLoadMore = false;
        window.setTimeout(() => {
            canAutoLoadMore = true;
        }, 600);

        if (galleryLoader) {
            galleryLoader.addEventListener('click', renderNextBatch);
            galleryLoader.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    renderNextBatch();
                }
            });
            galleryLoader.classList.add('cursor-pointer');

            const batchObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && canAutoLoadMore) {
                        renderNextBatch();
                    }
                });
            }, { rootMargin: '460px', threshold: 0 });

            window.setTimeout(() => {
                batchObserver.observe(galleryLoader);
            }, 700);
        }
    }

    /*
     * ADVANCED LIGHTBOX (SLIDER + ZOOM PAN)
     */
    let currentLightboxIndex = 0;
    let isZoomed = false;
    let lastFocusedElement = null;

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const btnClose = document.getElementById('lightbox-close');
    const btnNext = document.getElementById('lightbox-next');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnZoom = document.getElementById('lightbox-zoom');
    const countCurrent = document.getElementById('lightbox-current');
    const countTotal = document.getElementById('lightbox-total');

    // Preload adjacent images for smoother navigation
    const preloadImage = (index) => {
        if (index < 0 || index >= loadedImagesSrc.length) return;
        const img = new Image();
        img.src = loadedImagesSrc[index];
    };

    // Update UI Elements
    const updateLightboxUI = () => {
        if (!lightboxImg || !loadedImagesSrc.length) return;

        // Reset zoom state when changing image
        resetZoomState();

        // Swap image src with a cross-fade effect and placeholder behavior
        const targetSrc = loadedImagesSrc[currentLightboxIndex];

        // Preload the target image before swapping
        const preload = new Image();
        preload.src = targetSrc;

        const doSwap = () => {
            lightboxImg.src = targetSrc;
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        };

        if (prefersReducedMotion || !lightboxImg.animate) {
            doSwap();
        } else {
            lightboxImg.classList.remove('transition-transform', 'duration-500');
            lightboxImg.animate(
                [
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(0.985)' }
                ],
                { duration: 140, easing: 'ease-out', fill: 'forwards' }
            ).finished.then(() => {
                lightboxImg.src = targetSrc;
                const fadeIn = () => {
                    lightboxImg.animate(
                        [
                            { opacity: 0, transform: 'scale(0.985)' },
                            { opacity: 1, transform: 'scale(1)' }
                        ],
                        { duration: 260, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }
                    );
                    lightboxImg.classList.add('transition-transform', 'duration-500');
                };
                lightboxImg.onload = fadeIn;
                if (preload.complete) fadeIn();
            });
        }

        // Update counters
        if(countCurrent) countCurrent.textContent = currentLightboxIndex + 1;
        if(countTotal) countTotal.textContent = loadedImagesSrc.length;

        // Preload neighbors
        preloadImage(currentLightboxIndex - 1);
        preloadImage(currentLightboxIndex + 1);

        // Visual feedback on arrows (disable states seamlessly with transitions)
        if(btnPrev) {
            btnPrev.style.transition = 'opacity 0.3s ease, transform 0.3s';
            btnPrev.disabled = currentLightboxIndex === 0;
            btnPrev.setAttribute('aria-disabled', String(btnPrev.disabled));
            if(currentLightboxIndex === 0) {
                btnPrev.style.opacity = '0.15';
                btnPrev.style.pointerEvents = 'none';
                btnPrev.style.cursor = 'default';
            } else {
                btnPrev.style.opacity = '';
                btnPrev.style.pointerEvents = 'auto';
                btnPrev.style.cursor = 'pointer';
            }
        }

        if(btnNext) {
            btnNext.style.transition = 'opacity 0.3s ease, transform 0.3s';
            btnNext.disabled = currentLightboxIndex === loadedImagesSrc.length - 1;
            btnNext.setAttribute('aria-disabled', String(btnNext.disabled));
            if(currentLightboxIndex === loadedImagesSrc.length - 1) {
                btnNext.style.opacity = '0.15';
                btnNext.style.pointerEvents = 'none';
                btnNext.style.cursor = 'default';
            } else {
                btnNext.style.opacity = '';
                btnNext.style.pointerEvents = 'auto';
                btnNext.style.cursor = 'pointer';
            }
        }
    };

    const navigateNext = (e) => {
        if(e) e.stopPropagation();
        if (currentLightboxIndex < loadedImagesSrc.length - 1) {
            currentLightboxIndex++;
            updateLightboxUI();
        }
    };

    const navigatePrev = (e) => {
        if(e) e.stopPropagation();
        if (currentLightboxIndex > 0) {
            currentLightboxIndex--;
            updateLightboxUI();
        }
    };

    // Zooming Mechanics
    let translateX = 0, translateY = 0;
    let isDragging = false;
    let startX = 0, startY = 0;

    const toggleZoom = (e) => {
        if(e) e.stopPropagation();
        isZoomed = !isZoomed;

        if (isZoomed) {
            // Natural Center: determine transform origin based on click coordinates if available
            if (e && e.type === 'dblclick') {
                const rect = lightboxImg.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
                lightboxImg.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
            } else {
                lightboxImg.style.transformOrigin = 'center center';
            }

            translateX = 0;
            translateY = 0;

            // Apply smooth zoom scale
            lightboxImg.style.transform = 'translate(0px, 0px) scale(2.2)';
            lightboxImg.classList.remove('cursor-zoom-in', 'cursor-zoom-out');
            lightboxImg.style.cursor = 'grab';

            // Swap UI Icon
            if(btnZoom) btnZoom.classList.add('is-zoomed');
        } else {
            resetZoomState();
        }
    };

    const resetZoomState = () => {
        isZoomed = false;
        isDragging = false;
        if(lightboxImg) {
            translateX = 0;
            translateY = 0;
            lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
            lightboxImg.style.transformOrigin = 'center center';
            lightboxImg.style.transition = ''; // restore if stuck
            lightboxImg.style.cursor = '';
            if(!lightboxImg.classList.contains('cursor-zoom-in')) {
                lightboxImg.classList.add('cursor-zoom-in');
            }
        }
        if(btnZoom) btnZoom.classList.remove('is-zoomed');
    };

    const openLightbox = (arrayIndex) => {
        if (!lightbox || loadedImagesSrc.length === 0) return;
        currentLightboxIndex = arrayIndex;
        lastFocusedElement = document.activeElement;

        lightbox.classList.remove('hidden');
        void lightbox.offsetWidth; // Reflow
        lightbox.classList.remove('opacity-0');
        document.body.style.overflow = 'hidden';

        updateLightboxUI();
        window.setTimeout(() => btnClose?.focus(), 0);
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.add('opacity-0');
        resetZoomState();

        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImg.src = '';
            document.body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }, 400);
    };

    if (lightbox) {
        // Core Event Listeners
        if(btnClose) btnClose.addEventListener('click', closeLightbox);
        if(btnNext) btnNext.addEventListener('click', navigateNext);
        if(btnPrev) btnPrev.addEventListener('click', navigatePrev);

        // Double click image to zoom & Panning Events
        if(lightboxImg) {
            lightboxImg.addEventListener('dblclick', toggleZoom);
            // Prevent event bubbling on single click of image (so it doesn't trigger background close)
            lightboxImg.addEventListener('click', (e) => e.stopPropagation());

            // Panning Mechanics
            const startDrag = (e) => {
                if(!isZoomed) return;
                if(e.type === 'mousedown') e.preventDefault(); // prevent ghost image drag browser default
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                isDragging = true;
                startX = clientX - translateX;
                startY = clientY - translateY;
                lightboxImg.style.transition = 'none'; // pure realtime dragging
                lightboxImg.style.cursor = 'grabbing';
            };

            const doDrag = (e) => {
                if(!isDragging || !isZoomed) return;
                if(e.cancelable && e.type === 'touchmove') e.preventDefault();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                translateX = clientX - startX;
                translateY = clientY - startY;
                lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(2.2)`;
            };

            const endDrag = () => {
                if(!isDragging) return;
                isDragging = false;
                lightboxImg.style.transition = ''; // restore tailwind transition
                lightboxImg.style.cursor = 'grab';
            };

            lightboxImg.addEventListener('mousedown', startDrag);
            window.addEventListener('mousemove', doDrag, { passive: false });
            window.addEventListener('mouseup', endDrag);

            lightboxImg.addEventListener('touchstart', startDrag, { passive: true });
            window.addEventListener('touchmove', doDrag, { passive: false });
            window.addEventListener('touchend', endDrag);
        }

        // Dedicated zoom button
        if(btnZoom) {
            btnZoom.addEventListener('click', toggleZoom);
        }

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            // If click target is the background wrapper itself, close.
            if (e.target === lightbox || e.target.id === 'lightbox-img-container') {
                 closeLightbox();
            }
        });

        // Keyboard Navigation (Arrow Keys + Space)
        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('hidden')) return;

            if (e.key === 'Tab') {
                const focusable = [btnZoom, btnClose, btnPrev, btnNext].filter((el) => el && !el.disabled && el.offsetParent !== null);
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
                return;
            }

            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowRight':
                case 'd':
                    navigateNext();
                    break;
                case 'ArrowLeft':
                case 'a':
                    navigatePrev();
                    break;
                case '+':
                case '=':
                case ' ': // Spacebar zooms in/out
                    e.preventDefault();
                    toggleZoom();
                    break;
            }
        });
    }

    /*
     * PAGE TRANSITIONS
     */
    const transitionOverlay = document.getElementById('page-transition-overlay');
    if (transitionOverlay) {
        if (transitionOverlay.classList.contains('is-entering')) {
            setTimeout(() => {
                transitionOverlay.classList.remove('is-entering');
            }, 700);
        }

        document.querySelectorAll('a[href^="index.html"], a[href^="/index.html"]').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

            link.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                e.preventDefault();
                transitionOverlay.classList.add('is-leaving');
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            });
        });
    }

});
