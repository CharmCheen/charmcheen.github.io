document.addEventListener("DOMContentLoaded", () => {
    
    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = "2026"; // Hardcoded to 2026 based on user instruction
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



});
