document.addEventListener("DOMContentLoaded", () => {
    
    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    /* 
     * 1. ENTRY ANIMATION (Staggered Fade-in)
     * Using GSAP to animate elements into view smoothly.
     */
    const bentoElements = document.querySelectorAll('.bento-element');
    
    // Set initial state before animation
    gsap.set(bentoElements, { 
        y: 50, 
        opacity: 0,
        scale: 0.96
    });

    // Animate to final state with a stagger
    gsap.to(bentoElements, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        stagger: 0.08, // Delay between each element starting
        ease: "power3.out", // Quintessential Apple/Vercel smooth easing
        delay: 0.2 // Small initial delay to ensure rendering completes
    });

    /* 
     * 2. 3D HOVER EFFECT (Tilt & Glow)
     * Adds an interactive spatial feel when mice hover over the Bento Cards
     */
    const bentoCards = document.querySelectorAll('.bento-card');
    
    // Only apply 3D effect on non-touch devices
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice) {
        bentoCards.forEach(card => {
            // Store original transform to avoid overriding GSAP animations
            let bounds;
            
            card.addEventListener('mouseenter', () => {
                bounds = card.getBoundingClientRect();
                // Temporarily configure transition for smooth entering
                card.style.transition = 'transform 0.1s ease';
            });

            card.addEventListener('mousemove', (e) => {
                if (!bounds) return;
                
                const mouseX = e.clientX - bounds.left;
                const mouseY = e.clientY - bounds.top;
                
                const centerX = bounds.width / 2;
                const centerY = bounds.height / 2;
                
                // Calculate rotation (Max 3 degrees for subtlety)
                const rotateX = ((mouseY - centerY) / centerY) * -3;
                const rotateY = ((mouseX - centerX) / centerX) * 3;
                
                // Apply the transform matrix 
                // Elevate on Z axis slightly and apply rotation
                card.style.transform = `perspective(1000px) translateY(-5px) scale3d(1.01, 1.01, 1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                // Smoothly reset back to normal
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = `perspective(1000px) translateY(0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg)`;
                
                // Remove the stored bounds
                bounds = null;
            });
        });
    }

});
