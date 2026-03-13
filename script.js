document.addEventListener("DOMContentLoaded", () => {
    
    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    /* 
     * 1. ENTRY ANIMATION (Staggered Fade-in)
     */
    const bentoElements = document.querySelectorAll('.bento-element');
    
    if(typeof gsap !== 'undefined') {
        gsap.set(bentoElements, { 
            y: 40, 
            opacity: 0,
            scale: 0.98
        });

        gsap.to(bentoElements, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            stagger: 0.1, 
            ease: "expo.out", // Upgraded to expo.out for crisper Vercel-like snap
            delay: 0.1 
        });
    }

    /* 
     * 2. 3D HOVER EFFECT (Tilt & Glow for Bento Cards)
     * Disabled on anchors that wrap cards to prevent tricky pointer issues,
     * but enabled for pure static cards.
     */
    const bentoCards = document.querySelectorAll('.bento-card:not(a)');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice) {
        bentoCards.forEach(card => {
            let bounds;
            
            card.addEventListener('mouseenter', () => {
                bounds = card.getBoundingClientRect();
                card.style.transition = 'transform 0.1s ease';
            });

            card.addEventListener('mousemove', (e) => {
                if (!bounds) return;
                
                const mouseX = e.clientX - bounds.left;
                const mouseY = e.clientY - bounds.top;
                
                const centerX = bounds.width / 2;
                const centerY = bounds.height / 2;
                
                const rotateX = ((mouseY - centerY) / centerY) * -2;
                const rotateY = ((mouseX - centerX) / centerX) * 2;
                
                card.style.transform = `perspective(1000px) translateY(-5px) scale3d(1.01, 1.01, 1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = `perspective(1000px) translateY(0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg)`;
                bounds = null;
            });
        });
    }

    /*
     * 3. LIGHTBOX LOGIC
     */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    const openLightbox = (src) => {
        if (!lightbox) return;
        lightboxImg.src = src;
        lightbox.classList.remove('hidden');
        // Force reflow
        void lightbox.offsetWidth;
        
        lightbox.classList.remove('opacity-0');
        lightboxImg.classList.remove('scale-95');
        lightboxImg.classList.add('scale-100');
        document.body.style.overflow = 'hidden'; // Lock scroll
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.add('opacity-0');
        lightboxImg.classList.remove('scale-100');
        lightboxImg.classList.add('scale-95');
        
        // Wait for CSS transition to finish before hiding
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImg.src = ''; // Clear source
            document.body.style.overflow = ''; // Unlock scroll
        }, 300);
    };

    if (lightbox) {
        lightboxClose.addEventListener('click', closeLightbox);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.closest('.relative')) {
                 if (e.target !== lightboxImg && e.target !== lightboxClose && !lightboxClose.contains(e.target)) {
                     closeLightbox();
                 }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
                closeLightbox();
            }
        });
    }

    /*
     * 4. DYNAMIC PHOTO GALLERY LOADER WITH INTERSECTION OBSERVER
     */
    const galleryContainer = document.getElementById('photo-gallery');
    if (galleryContainer) {
        const basePath = "picture/photographer/";
        // Removing hardcoded maxImages for infinite loading
        
        // Setup observer for scroll-triggered image loading animation
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    
                    if(typeof gsap !== 'undefined') {
                        gsap.to(el, {
                            opacity: 1, 
                            scale: 1, 
                            y: 0, 
                            duration: 0.8, 
                            ease: "power2.out"
                        });
                    } else {
                        // Fallback purely CSS
                        el.style.opacity = 1;
                        el.style.transform = 'translateY(0) scale(1)';
                    }
                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        const loadNextImage = (index) => {
            const imgSrc = `${basePath}${index}.jpg`;
            const img = new Image();

            img.onload = () => {
                // Image exists! Creates wrapper and injects into DOM.
                const wrapper = document.createElement('div');
                wrapper.className = "photo-item aspect-[3/2] flex items-center justify-center bg-white/5 opacity-0 translate-y-8 scale-95";
                
                img.className = "w-full h-full object-cover transition-transform duration-700 hover:scale-105 select-none";
                img.loading = "lazy";
                
                wrapper.appendChild(img);
                
                // Bind lightbox to wrapper click (Interactive Enlarge)
                wrapper.addEventListener('click', () => {
                    openLightbox(imgSrc);
                });

                galleryContainer.appendChild(wrapper);
                
                // Observe this new photo wrapper
                imageObserver.observe(wrapper);

                // Recursively check and load the next sequentially named image
                loadNextImage(index + 1);
            };

            img.onerror = () => {
                // Sequence ends (file not found). Stop loading silently.
                // This achieves "infinite expansion" without any code changes!
            };

            img.src = imgSrc;
        };

        // Start loading sequence from 1.jpg
        loadNextImage(1);
    }

});
