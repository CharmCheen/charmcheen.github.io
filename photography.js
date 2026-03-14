document.addEventListener("DOMContentLoaded", () => {
    
    // Page Entry Animation
    const entryElements = document.querySelectorAll('.page-entry-anim');
    if(typeof gsap !== 'undefined') {
        gsap.set(entryElements, { y: 30, opacity: 0 });
        gsap.to(entryElements, {
            y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.1
        });
    } else {
        entryElements.forEach(el => { el.style.opacity = 1; el.style.transform = "translateY(0)"; });
    }

    /*
     * INFINITE GALLERY LOADER & STATE MANAGEMENT
     */
    const galleryContainer = document.getElementById('photography-gallery');
    const galleryLoader = document.getElementById('gallery-loader');
    
    // State array holding valid image sources
    const loadedImagesSrc = [];
    
    // Used to read the image aspect ratio and assign dynamic masonry spans gracefully
    const getGridSpanClass = (img, index) => {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (ratio > 2.0) {
            return "md:col-span-2 md:row-span-1"; // Extreme landscape
        } else if (ratio > 1.25) {
            return index % 4 === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-2 md:row-span-1";
        } else if (ratio < 0.6) {
            return "md:col-span-1 md:row-span-2"; // Extreme portrait
        } else if (ratio < 0.85) {
            return "md:col-span-1 md:row-span-2";
        } else {
            return index % 5 === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1";
        }
    };

    if (galleryContainer) {
        const basePath = "picture/photographer/";
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if(typeof gsap !== 'undefined') {
                        gsap.to(el, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power2.out" });
                    } else {
                        el.style.opacity = 1; el.style.transform = 'translateY(0) scale(1)';
                    }
                    observer.unobserve(el);
                }
            });
        }, { rootMargin: '100px', threshold: 0.1 });

        const loadNextImage = (index) => {
            const imgSrc = `${basePath}${index}.jpg`;
            const img = new Image();

            img.onload = () => {
                // Image successfully loaded
                if(galleryLoader) galleryLoader.style.display = 'none';
                
                // Track source for Lightbox Array
                loadedImagesSrc.push(imgSrc);
                const currentArrayIndex = loadedImagesSrc.length - 1; // 0-indexed position in array
                
                const wrapper = document.createElement('div');
                // Apply masonry span classes dynamically
                const spanClass = getGridSpanClass(img, index);
                wrapper.className = `photo-item flex items-center justify-center bg-white/5 opacity-0 translate-y-8 scale-95 ${spanClass}`;
                
                img.className = "w-full h-full object-cover select-none";
                img.loading = "lazy";
                
                wrapper.appendChild(img);
                
                // Bind lightbox click passing the ARRAY index, not the file index.
                wrapper.addEventListener('click', () => {
                    openLightbox(currentArrayIndex);
                });

                galleryContainer.appendChild(wrapper);
                imageObserver.observe(wrapper);

                // Recursively load next
                loadNextImage(index + 1);
            };

            img.onerror = () => {
                // Stop loading sequence.
                if(loadedImagesSrc.length === 0 && galleryLoader) {
                    galleryLoader.innerHTML = "<i class='ph ph-warning-circle text-3xl mb-2'></i><span class='text-sm text-gray-400'>No photos found in picture/photographer/ directory.</span><span class='text-xs text-gray-500 mt-1'>Add some sequentially named JPGs (1.jpg, 2.jpg) to begin.</span>";
                    gsap.to(galleryLoader, {opacity: 1, duration: 0.5});
                }
            };

            img.src = imgSrc;
        };

        // Ignite infinite loading
        loadNextImage(1);
    }

    /*
     * ADVANCED LIGHTBOX (SLIDER + ZOOM PAN)
     */
    let currentLightboxIndex = 0;
    let isZoomed = false;

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const btnClose = document.getElementById('lightbox-close');
    const btnNext = document.getElementById('lightbox-next');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnZoom = document.getElementById('lightbox-zoom');
    const zoomIcon = document.getElementById('zoom-icon');
    
    const countCurrent = document.getElementById('lightbox-current');
    const countTotal = document.getElementById('lightbox-total');

    // Update UI Elements
    const updateLightboxUI = () => {
        if (!lightboxImg || !loadedImagesSrc.length) return;
        
        // Reset zoom state when changing image
        resetZoomState();

        // Swap image src with a tiny fade effect
        gsap.to(lightboxImg, {
            opacity: 0, scale: 0.98, duration: 0.15, onComplete: () => {
                lightboxImg.src = loadedImagesSrc[currentLightboxIndex];
                
                // Wait for image loaded to fade back in
                lightboxImg.onload = () => {
                    gsap.to(lightboxImg, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
                };
            }
        });

        // Update counters
        if(countCurrent) countCurrent.textContent = currentLightboxIndex + 1;
        if(countTotal) countTotal.textContent = loadedImagesSrc.length;

        // Visual feedback on arrows (disable states seamlessly with transitions)
        if(btnPrev) {
            btnPrev.style.transition = 'opacity 0.3s ease, transform 0.3s';
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
            if(zoomIcon) {
                zoomIcon.classList.replace('ph-magnifying-glass-plus', 'ph-magnifying-glass-minus');
            }
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
            lightboxImg.style.transition = ''; // restore if stuck
            lightboxImg.style.cursor = '';
            // Retain transformOrigin so the transition un-zooms smoothly to the original spot
            if(!lightboxImg.classList.contains('cursor-zoom-in')) {
                lightboxImg.classList.add('cursor-zoom-in');
            }
        }
        if(zoomIcon) {
            zoomIcon.classList.replace('ph-magnifying-glass-minus', 'ph-magnifying-glass-plus');
        }
    };

    const openLightbox = (arrayIndex) => {
        if (!lightbox || loadedImagesSrc.length === 0) return;
        currentLightboxIndex = arrayIndex;
        
        lightbox.classList.remove('hidden');
        void lightbox.offsetWidth; // Reflow
        lightbox.classList.remove('opacity-0');
        document.body.style.overflow = 'hidden'; 
        
        updateLightboxUI();
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.add('opacity-0');
        resetZoomState();
        
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImg.src = ''; 
            document.body.style.overflow = ''; 
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

});
