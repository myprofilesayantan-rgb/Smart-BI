/**
 * hero.js — Hero Entrance & Typewriter Animation
 *
 * Parses the hero heading HTML and wraps visible characters in spans,
 * then uses GSAP to stagger-reveal them for a typewriter effect.
 */

window.SmartBI_Hero = {
  init() {
    this.initHeroAnimations();
  },

  initHeroAnimations() {
    const eyebrow = document.querySelector('.hero-eyebrow');
    const emoji   = document.querySelector('.hero-emoji-container');
    const heading = document.querySelector('.hero-heading');

    if (!heading) return;

    // Helper: Parse H1 innerHTML and wrap visible characters in spans
    // to prevent layout shifting during animation
    const originalHTML = heading.innerHTML.trim();
    let parsedHTML = '';
    let inTag = false;

    for (let i = 0; i < originalHTML.length; i++) {
      const char = originalHTML[i];
      if (char === '<') {
        inTag = true;
        parsedHTML += char;
      } else if (char === '>') {
        inTag = false;
        parsedHTML += char;
      } else if (inTag) {
        parsedHTML += char;
      } else {
        if (char === ' ') {
          parsedHTML += `<span class="typewriter-char" style="display: none; opacity: 0;"> </span>`;
        } else {
          parsedHTML += `<span class="typewriter-char" style="display: none; opacity: 0;">${char}</span>`;
        }
      }
    }
    heading.innerHTML = parsedHTML + '<span class="hero-cursor">|</span>';
 
    // Trigger animations via GSAP
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({ delay: 0.1 });
 
      if (eyebrow) gsap.set(eyebrow, { opacity: 0 });
      if (emoji)   gsap.set(emoji, { opacity: 0 });
 
      // Fade-in/slide-up eyebrow and emoji container
      tl.fromTo(
        [eyebrow, emoji],
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
      );
 
      // Stagger reveal of character spans with deliberate typing speed
      const chars = heading.querySelectorAll('.typewriter-char');
      tl.to(chars, {
        display: 'inline',
        opacity: 1,
        duration: 0.02,
        stagger: 0.07,        /* Realistically slow typing speed (approx 14 chars/sec) */
        ease: 'none',
        onComplete: () => {
          // Fade out cursor after typing completes
          setTimeout(() => {
            const cursor = heading.querySelector('.hero-cursor');
            if (cursor) {
              cursor.style.transition = 'opacity 1s ease';
              cursor.style.opacity = '0';
              setTimeout(() => { cursor.style.display = 'none'; }, 1000);
            }
          }, 3000);
        }
      }, '-=0.1');
 
    } else {
      // Fallback if GSAP is not loaded
      if (eyebrow) eyebrow.style.opacity = '1';
      if (emoji)   emoji.style.opacity = '1';
      const chars = heading.querySelectorAll('.typewriter-char');
      chars.forEach(c => { c.style.display = 'inline'; c.style.opacity = '1'; });
      const cursor = heading.querySelector('.hero-cursor');
      if (cursor) cursor.style.display = 'none';
    }
  }
};
