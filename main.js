// ===================================
// Portfolio Website - Main JavaScript
// ===================================
'use strict';

(function () {
  // Utility: debounce
  function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {
    // ======== Navigation Menu Toggle ========
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => navMenu.classList.add('active'));
    }
    if (navClose && navMenu) {
      navClose.addEventListener('click', () => navMenu.classList.remove('active'));
    }
    if (navLinks && navLinks.length) {
      navLinks.forEach(link => link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('active');
      }));
    }

    // ======== Scroll helpers and elements ========
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');

    // Active Link on Scroll
    function scrollActive() {
      const scrollY = window.pageYOffset;
      if (!sections || !sections.length) return;

      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav__link[href*="${sectionId}"]`);
        if (!navLink) return;

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      });
    }

    function scrollHeader() {
      if (!header) return;
      if (window.scrollY >= 50) header.classList.add('scroll-header');
      else header.classList.remove('scroll-header');
    }

    
    function reveal() {
      const reveals = document.querySelectorAll('.reveal');
      if (!reveals || !reveals.length) return;
      const windowHeight = window.innerHeight;
      const elementVisible = 150;

      reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', debounce(scrollActive, 15));
    window.addEventListener('scroll', debounce(reveal, 15));
    window.addEventListener('scroll', debounce(scrollHeader, 15));

    
    reveal();
    scrollHeader();
    scrollActive();

  
    const filterButtons = document.querySelectorAll('.filter__btn');
    const workCards = document.querySelectorAll('.work__card');

    if (filterButtons && filterButtons.length && workCards) {
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          const filterValue = button.getAttribute('data-filter');

          workCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (filterValue === 'all' || cardCategory === filterValue) {
              card.classList.remove('hidden');
              // Animate in
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            } else {
              // Animate out then hide
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
              setTimeout(() => card.classList.add('hidden'), 300);
            }
          });
        });
      });
    }

    // ======== Lightbox Modal for Works ========
    const modal = document.getElementById('work-modal');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalLink = document.getElementById('modal-link');
    const modalClose = document.querySelector('.modal__close');
    const modalOverlay = document.querySelector('.modal__overlay');
    const workViewButtons = document.querySelectorAll('.work__view');

    // Example work data (keep or replace by server/json)
    const worksData = {
      '1': { image: 'https://i.postimg.cc/3wFT4BM7/Gemini-Generated-Image-nhpbh4nhpbh4nhpb.png', category: 'UI/UX Design', title: 'RideX App Design', description: 'A fresh redesign of the RideX ride-sharing app with a modern interface, smoother user flow, and intuitive interactions for a better travel experience.', link: 'https://www.figma.com/design/L5Ly2nwmR0AQ8JICP2LOCI/RidexUX?node-id=0-1&t=NBrZyl6j94TLPKKC-1' },
      '2': { image: 'https://i.postimg.cc/QxfStKY6/ULJE.png', category: 'Email Design', title: 'Order Confirmation Email', description: 'Elegant and minimal order confirmation email designed for Monarca Ulje. Focused on clear communication, visual harmony, and a premium customer experience.', link: 'https://www.figma.com/design/CwVFAxUoPRNxwMKFQsLqj9/MONARCA-ULJE---EMAIL-DESIGN?node-id=0-1&t=tD7pxV5N5uQT6OnO-1' }, 
      '3': { image: 'https://i.postimg.cc/c1Mn1q5G/Captura-de-pantalla-2025-11-08-034038.png', category: 'Web Design', title: 'Landing Page TheBunker', description: 'Modern dark-themed landing page created for a tattoo brand. Focused on visual storytelling, bold typography, and a strong user experience.', link: 'https://thebunker.vercel.app/' },
      '4': { image: 'https://i.postimg.cc/bv9hDTXP/Gemini-Generated-Image-cry7pbcry7pbcry7.png', category: 'UI/UX Design', title: 'TechDrive E-Commerce UI', description: 'Modern e-commerce interface concept for a tech accessories brand. The design focuses on usability, dark aesthetics, and an intuitive shopping experience.', link: 'https://www.figma.com/design/Coj3nzGYRWtqr9dXfMct7P/GamingUX?node-id=0-1&t=wB8ElYzp6ml7JVpq-1' },
      '5': { image: 'https://i.postimg.cc/sfw59dPM/BYTE.png', category: 'Email Design', title: 'Promotional Email Design', description: 'Vibrant and engaging promotional email created to increase brand interaction and drive conversions through bold visuals and strategic CTA placement.', link: 'https://www.figma.com/design/8mqBVgSLK0Zsxi3Sgh2zby/PROMOTIONAL-EMAIL-DESIGN?node-id=0-1&t=p1cStNGN0MX1MWFu-1' },
      '6': { image: 'https://i.postimg.cc/PfzwfGFt/Captura-de-pantalla-2025-11-08-034810.png', category: 'Web Design', title: 'Landing Page Design DevFlex', description: 'Built with HTML, CSS, and JavaScript. Fully responsive with clean code, smooth animations, and reusable components. Deployed on Vercel.', link: 'https://dev-flex-jet.vercel.app/' }
    };

    function openModalWithData(workData) {
      if (!modal) return;
      if (modalImage) {
        modalImage.src = workData.image;
        modalImage.alt = workData.title;
      }
      if (modalCategory) modalCategory.textContent = workData.category;
      if (modalTitle) modalTitle.textContent = workData.title;
      if (modalDescription) modalDescription.textContent = workData.description;
      if (modalLink) modalLink.href = workData.link;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (workViewButtons && workViewButtons.length) {
      workViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const workId = button.getAttribute('data-work');
          const workData = worksData[workId];
          if (workData) openModalWithData(workData);
        });
      });
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // ======== Contact Form (Formspree) ========
    const FORMSPREE_FORM_ID = 'xanawqwv';
    const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    function showMessage(message, type = 'info') {
      if (!formMessage) return;
      formMessage.textContent = message;
      formMessage.className = `form__message ${type}`;
      formMessage.style.display = 'block';
      formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { formMessage.style.display = 'none'; }, 5000);
    }

    function validateFormData(name, email, subject, message) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || name.length < 2) { showMessage('Nombre inválido (mínimo 2 caracteres).', 'error'); return false; }
      if (!email || !emailRegex.test(email)) { showMessage('Email inválido.', 'error'); return false; }
      if (!subject || subject.length < 3) { showMessage('Asunto inválido (mínimo 3 caracteres).', 'error'); return false; }
      if (!message || message.length < 10) { showMessage('Mensaje muy corto (mínimo 10 caracteres).', 'error'); return false; }
      return true;
    }

    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = (formData.get('name') || '').trim();
        const email = (formData.get('email') || '').trim();
        const subject = (formData.get('subject') || '').trim();
        const message = (formData.get('message') || '').trim();

        if (!validateFormData(name, email, subject, message)) return;

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const btnText = submitButton ? submitButton.querySelector('.btn__text') : null;
        const btnLoader = submitButton ? submitButton.querySelector('.btn__loader') : null;

        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-flex';
        if (submitButton) submitButton.disabled = true;

        const payload = {
          name,
          email,
          subject,
          message,
          _replyto: email,
          _subject: `Nuevo mensaje de: ${name}`
        };

        try {
          const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });

          const result = await res.json();

          if (res.ok) {
            showMessage('¡Mensaje enviado exitosamente! Te contactaré pronto.', 'success');
            contactForm.reset();
          } else {
            let errMsg = 'Error al enviar el mensaje. Intenta nuevamente.';
            if (result && result.errors) {
              errMsg = result.errors.map(er => er.message).join(', ');
            }
            showMessage(errMsg, 'error');
          }
        } catch (err) {
          console.error('Form submit error:', err);
          showMessage('Error al enviar el mensaje. Verifica tu conexión.', 'error');
        } finally {
          if (btnText) btnText.style.display = 'inline';
          if (btnLoader) btnLoader.style.display = 'none';
          if (submitButton) submitButton.disabled = false;
        }
      });
    }

    // ======== Service Cards Click (safe) ========
    const serviceCards = document.querySelectorAll('.service__card');
    if (serviceCards && serviceCards.length) {
      serviceCards.forEach(card => {
        card.addEventListener('click', () => {
          serviceCards.forEach(c => c.classList.remove('service__card--active'));
          card.classList.add('service__card--active');
        });
      });
    } else {
      // optional: console.warn('No .service__card elements found');
    }

    // ======== Smooth Scroll for Anchor Links ========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      });
    });

    // ======== Lazy loading fallback ========
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => { /* nothing to do, browser handles it */ });
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
      document.body.appendChild(script);
    }

    // Optional: console message
    console.log('%c Portfolio website loaded successfully!', 'color: #9B5CFF; font-weight: bold;');
  }); // DOMContentLoaded
})(); // IIFE
