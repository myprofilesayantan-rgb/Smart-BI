/**
 * process.js — Process & Workflow Section GSAP Animations
 */

window.SmartBI_Process = {
  init() {
    this.initProcessLogos();
  },

  initProcessLogos() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.fromTo(
      '#section-process .skill-logo-item',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#section-process',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onComplete: function() {
          gsap.set('#section-process .skill-logo-item', { clearProps: "opacity,transform" });
          document.querySelectorAll('#section-process .skill-logo-item').forEach(item => {
            item.classList.add('animated');
            
            // Seed random duration between 3.2s and 5.8s for smooth, slow float
            const randomDuration = (3.2 + Math.random() * 2.6).toFixed(2);
            // Seed random negative delay between -5.8s and 0s to start animation mid-cycle
            const randomDelay = (-1 * Math.random() * randomDuration).toFixed(2);
            
            item.style.setProperty('--bounce-duration', `${randomDuration}s`);
            item.style.setProperty('--bounce-delay', `${randomDelay}s`);
          });
        }
      }
    );
  }
};
