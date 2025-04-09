// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const terminalBody = document.querySelector('.terminal-body');

    // Initialize EmailJS
    emailjs.init("kyUeVmLZCmYUa4ZZ-"); // EmailJS public key

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Basic validation
            if (!formObject.name || !formObject.email || !formObject.message) {
                showTerminalMessage('Error: All fields are required!', 'error');
                return;
            }

            if (!isValidEmail(formObject.email)) {
                showTerminalMessage('Error: Please enter a valid email address!', 'error');
                return;
            }

            try {
                showTerminalMessage('Sending message...', 'info');
                
                // Send email using EmailJS
                const response = await emailjs.send(
                    "service_08d6xkp", // EmailJS service ID
                    "template_63b91ks", // EmailJS template ID
                    {
                        from_name: formObject.name,
                        from_email: formObject.email,
                        message: formObject.message,
                        to_name: "SEJOYNER", // Your name
                        reply_to: formObject.email,
                    }
                );

                if (response.status === 200) {
                    showTerminalMessage('Message sent successfully! I will get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                console.error('EmailJS Error:', error);
                showTerminalMessage('Error: Could not send message. Please try again later.', 'error');
            }
        });
    }

    function showTerminalMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `terminal-message ${type}`;
        messageDiv.innerHTML = `<span class="prompt">$</span> <span class="message">${message}</span>`;
        
        // Insert message before the form
        terminalBody.insertBefore(messageDiv, contactForm);

        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});

// Add scroll-based animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Add active class to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Slider functionality
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.skills-track');
  const cards = document.querySelectorAll('.skill-card');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const dotsContainer = document.querySelector('.slider-dots');
  const sliderContainer = document.querySelector('.skills-slider-container');
  const slider = document.querySelector('.skills-slider');

  let currentIndex = 0;
  let maxIndex = 0;
  let cardsPerView = 0;
  
  // Function to check if in mobile view
  function isMobileView() {
    return window.innerWidth <= 480;
  }
  
  // Function to calculate dimensions based on current viewport
  function calculateDimensions() {
    const containerWidth = slider.clientWidth;
    const cardStyle = window.getComputedStyle(cards[0]);
    const cardWidth = parseInt(cardStyle.getPropertyValue('min-width'), 10);
    const cardMargin = parseInt(cardStyle.getPropertyValue('margin-right'), 10) || 0;
    const gap = parseInt(window.getComputedStyle(track).getPropertyValue('gap'), 10) || 32;
    
    // Calculate how many cards can fit in view (full cards only)
    cardsPerView = Math.max(1, Math.floor(containerWidth / (cardWidth + gap)));
    
    // Calculate max index
    maxIndex = Math.max(0, cards.length - cardsPerView);
    
    return { cardWidth, gap };
  }

  // Initialize dimensions
  const { cardWidth, gap } = calculateDimensions();

  // Create dots only for valid scroll positions
  function createDots() {
    dotsContainer.innerHTML = ''; // Clear existing dots
    
    // For mobile view with a single card showing, create one dot per card
    const showMobileDots = isMobileView();
    const dotsCount = showMobileDots ? cards.length : (maxIndex + 1);
    
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(i);
      });
      
      dotsContainer.appendChild(dot);
    }
  }

  // Initialize dots
  createDots();

  // Update dots
  function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // Slide to position
  function goToSlide(index) {
    // Recalculate dimensions to ensure accuracy
    const dimensions = calculateDimensions();
    const cardWidth = dimensions.cardWidth;
    const gap = dimensions.gap;
    
    // Limit index to valid range based on view mode
    const maxLimit = isMobileView() ? cards.length - 1 : maxIndex;
    currentIndex = Math.max(0, Math.min(index, maxLimit));
    
    // For mobile view, ensure each card is perfectly centered
    if (isMobileView()) {
      // Get exact container width including padding
      const sliderWidth = slider.clientWidth;
      const containerPadding = (sliderContainer.clientWidth - sliderWidth) / 2;
      
      // Calculate the exact center position
      // This accounts for the card width, gap between cards, and container padding
      const cardTotalWidth = cardWidth;
      
      // Calculate offset to perfectly center the card
      // We need to account for: card width, gap, current index, and center position
      const offset = -(currentIndex * (cardWidth + gap)) + (sliderWidth - cardWidth) / 2;
      
      track.style.transform = `translateX(${offset}px)`;
    } else {
      // Normal scrolling behavior for desktop
      const offset = -(cardWidth + gap) * currentIndex;
      track.style.transform = `translateX(${offset}px)`;
    }
    
    updateDots();
    updateButtons();
  }

  // Update button states
  function updateButtons() {
    const maxLimit = isMobileView() ? cards.length - 1 : maxIndex;
    prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
    nextBtn.style.opacity = currentIndex >= maxLimit ? '0.5' : '1';
    prevBtn.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
    nextBtn.style.cursor = currentIndex >= maxLimit ? 'not-allowed' : 'pointer';
  }

  // Previous slide
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  });

  // Next slide
  nextBtn.addEventListener('click', () => {
    const maxLimit = isMobileView() ? cards.length - 1 : maxIndex;
    if (currentIndex < maxLimit) {
      goToSlide(currentIndex + 1);
    }
  });

  // Auto slide every 5 seconds
  let autoSlideInterval = setInterval(() => {
    const maxLimit = isMobileView() ? cards.length - 1 : maxIndex;
    if (currentIndex < maxLimit) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(0);
    }
  }, 5000);

  // Pause auto slide on hover
  sliderContainer.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
  });

  sliderContainer.addEventListener('mouseleave', () => {
    autoSlideInterval = setInterval(() => {
      const maxLimit = isMobileView() ? cards.length - 1 : maxIndex;
      if (currentIndex < maxLimit) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
    }, 5000);
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    
    // Debounce resize events
    resizeTimer = setTimeout(() => {
      // Recalculate dimensions
      calculateDimensions();
      
      // Recreate dots if mobile state changed
      const wasMobile = dotsContainer.children.length === cards.length;
      const isMobile = isMobileView();
      
      if (wasMobile !== isMobile) {
        createDots();
      }
      
      // Reposition slides based on new dimensions
      goToSlide(currentIndex);
    }, 200);
  });

  // Initialize button states
  updateButtons();

  // Add touch support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    clearInterval(autoSlideInterval); // Pause auto-slide on touch
  });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    
    // Restart auto-slide after touch
    autoSlideInterval = setInterval(() => {
      const maxLimit = isMobileView() ? cards.length - 1 : maxIndex;
      if (currentIndex < maxLimit) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
    }, 5000);
  });

  function handleSwipe() {
    const swipeThreshold = 50; // minimum distance for swipe
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      const maxLimit = isMobileView() ? cards.length - 1 : maxIndex;
      if (diff > 0 && currentIndex < maxLimit) {
        // Swipe left
        goToSlide(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right
        goToSlide(currentIndex - 1);
      }
    }
  }
  
  // Call initial slide setup after a small delay to ensure all styles are applied
  setTimeout(() => {
    goToSlide(0);
  }, 50);
});

// Hamburger Menu
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}); 