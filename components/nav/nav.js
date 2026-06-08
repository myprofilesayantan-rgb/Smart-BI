/**
 * nav.js — Navigation ScrollSpy
 * LOCKED SECTION — do not edit without explicit user unlock instruction
 *
 * Highlights the active navigation link based on scroll position.
 */

window.SmartBI_Nav = {
  init() {
    this.initScrollSpy();
    this.initDropdown();
  },

  initScrollSpy() {
    const navItems = document.querySelectorAll('.nav-link-item');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPosition = window.scrollY + 120; // offset for nav height

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      if (currentSectionId) {
        navItems.forEach(item => {
          // If this is the dropdown wrapper and the dropdown is open, keep it active
          if (item.classList.contains('nav-dropdown-wrapper')) {
            const dropdown = document.getElementById('mindmap-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
              return;
            }
          }
          item.classList.remove('active');
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') === `#${currentSectionId}`) {
            item.classList.add('active');
          }
        });
      }
    });
  },

  initDropdown() {
    const trigger = document.getElementById('mindmap-trigger');
    const dropdown = document.getElementById('mindmap-dropdown');
    const wrapper = trigger ? trigger.closest('.nav-dropdown-wrapper') : null;
    if (!trigger || !dropdown || !wrapper) return;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = dropdown.classList.contains('show');
      
      if (isOpen) {
        dropdown.classList.remove('show');
        wrapper.classList.remove('active');
      } else {
        dropdown.classList.add('show');
        wrapper.classList.add('active');
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove('show');
        wrapper.classList.remove('active');
      }
    });
  }
};
