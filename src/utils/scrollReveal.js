// Modern Scroll Reveal Utility
class ScrollReveal {
  constructor(options = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      triggerOnce: true,
      ...options
    };
    
    this.observer = null;
    this.elements = [];
    this.init();
  }

  init() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      this.fallback();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.options
    );

    // Observe elements with data-reveal attribute
    this.observeElements();
  }

  observeElements() {
    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach(element => {
      this.observer.observe(element);
      this.elements.push(element);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.revealElement(entry.target);
        
        if (this.options.triggerOnce) {
          this.observer.unobserve(entry.target);
        }
      } else if (!this.options.triggerOnce) {
        this.hideElement(entry.target);
      }
    });
  }

  revealElement(element) {
    const delay = element.dataset.delay || 0;
    const duration = element.dataset.duration || '0.6s';
    const direction = element.dataset.direction || 'up';
    
    setTimeout(() => {
      element.style.transition = `all ${duration} cubic-bezier(0.4, 0, 0.2, 1)`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0) translateX(0) scale(1)';
      element.classList.add('revealed');
    }, delay);
  }

  hideElement(element) {
    const direction = element.dataset.direction || 'up';
    element.style.opacity = '0';
    
    switch (direction) {
      case 'up':
        element.style.transform = 'translateY(30px)';
        break;
      case 'down':
        element.style.transform = 'translateY(-30px)';
        break;
      case 'left':
        element.style.transform = 'translateX(-30px)';
        break;
      case 'right':
        element.style.transform = 'translateX(30px)';
        break;
      case 'scale':
        element.style.transform = 'scale(0.8)';
        break;
      default:
        element.style.transform = 'translateY(30px)';
    }
  }

  fallback() {
    // Fallback for browsers without Intersection Observer
    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach(element => {
      this.revealElement(element);
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Add new elements to observe
  add(element) {
    if (this.observer) {
      this.observer.observe(element);
      this.elements.push(element);
    }
  }

  // Remove elements from observation
  remove(element) {
    if (this.observer) {
      this.observer.unobserve(element);
      const index = this.elements.indexOf(element);
      if (index > -1) {
        this.elements.splice(index, 1);
      }
    }
  }
}

// Smooth scroll utility
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          this.scrollToElement(target);
        }
      });
    });
  }

  scrollToElement(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = elementPosition - startPosition;
    const duration = 1000;
    let start = null;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = this.ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  }

  ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
}

// Parallax effect utility
class ParallaxEffect {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      this.updateParallax();
    });
  }

  updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }
}

// Navbar scroll effect
class NavbarScroll {
  constructor() {
    this.navbar = document.querySelector('nav');
    this.init();
  }

  init() {
    if (!this.navbar) return;

    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add scrolled class for styling
      if (scrollTop > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }

      // Hide/show navbar on scroll (optional)
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        this.navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop;
    });
  }
}

// Initialize all utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll reveal
  window.scrollReveal = new ScrollReveal({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true
  });

  // Initialize smooth scroll
  window.smoothScroll = new SmoothScroll();

  // Initialize parallax effect
  window.parallaxEffect = new ParallaxEffect();

  // Initialize navbar scroll effect
  window.navbarScroll = new NavbarScroll();

  // Add reveal attributes to common sections
  this.addRevealAttributes();
});

// Add reveal attributes to sections
function addRevealAttributes() {
  // Hero section
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.setAttribute('data-reveal', '');
    hero.setAttribute('data-direction', 'up');
  }

  // About section
  const about = document.querySelector('.about');
  if (about) {
    about.setAttribute('data-reveal', '');
    about.setAttribute('data-direction', 'up');
  }

  // Services section
  const services = document.querySelector('.serv');
  if (services) {
    services.setAttribute('data-reveal', '');
    services.setAttribute('data-direction', 'up');
  }

  // Footer section
  const footer = document.querySelector('.footer');
  if (footer) {
    footer.setAttribute('data-reveal', '');
    footer.setAttribute('data-direction', 'up');
  }

  // Service cards
  const serviceCards = document.querySelectorAll('.serv-card');
  serviceCards.forEach((card, index) => {
    card.setAttribute('data-reveal', '');
    card.setAttribute('data-direction', 'up');
    card.setAttribute('data-delay', index * 100);
  });

  // About features
  const aboutFeatures = document.querySelectorAll('.about-feature');
  aboutFeatures.forEach((feature, index) => {
    feature.setAttribute('data-reveal', '');
    feature.setAttribute('data-direction', 'up');
    feature.setAttribute('data-delay', index * 100);
  });
}

// Export utilities for use in components
export { ScrollReveal, SmoothScroll, ParallaxEffect, NavbarScroll };
