// Global Scripts for eFactu Comparator

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initFaqs();
  markActiveNavLink();
});

/**
 * Adds shadow & style changes to header when page is scrolled
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Check initially
}

/**
 * Handles mobile burger menu open/close drawer
 */
function initMobileMenu() {
  const burger = document.querySelector('.burger-menu');
  const body = document.body;

  if (!burger) return;

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    body.classList.toggle('nav-mobile-active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (body.classList.contains('nav-mobile-active')) {
      const nav = document.querySelector('.nav');
      if (nav && !nav.contains(e.target) && !burger.contains(e.target)) {
        body.classList.remove('nav-mobile-active');
      }
    }
  });

  // Close menu when clicking a link
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      body.classList.remove('nav-mobile-active');
    });
  });
}

/**
 * Handles accordions in FAQ Page and custom result accordions
 */
function initFaqs() {
  // We delegation-bind this to support dynamic elements (like results accordions)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-question') || e.target.closest('.platform-accordion-trigger');
    if (!trigger) return;

    e.preventDefault();
    
    // Check if it's a FAQ item or Platform Result Accordion
    const isFaq = trigger.classList.contains('faq-question');
    
    if (isFaq) {
      const item = trigger.closest('.faq-item');
      if (!item) return;

      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      // Close all other FAQs in the list
      const allItems = item.parentElement.querySelectorAll('.faq-item');
      allItems.forEach(i => {
        i.classList.remove('active');
        const ans = i.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    } else {
      // Platform Accordion Trigger
      const card = trigger.closest('.platform-card');
      if (!card) return;

      const content = card.querySelector('.platform-accordion-content');
      const isActive = trigger.classList.contains('active');

      if (isActive) {
        trigger.classList.remove('active');
        content.classList.remove('open');
        content.style.maxHeight = null;
      } else {
        trigger.classList.add('active');
        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        
        // Recalculate parent height if it's inside some other container
      }
    }
  });
}

/**
 * Highlights active page link in header menu
 */
function markActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (!linkPath) return;
    
    // Check if the current URL ends with the link path, or if we are at root for index.html
    const isRoot = (currentPath === '/' || currentPath.endsWith('index.html')) && (linkPath === '/' || linkPath.endsWith('index.html'));
    const isSubPage = currentPath.includes(linkPath.replace('.html', '')) && linkPath !== '/' && !linkPath.endsWith('index.html');
    
    if (isRoot || isSubPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
