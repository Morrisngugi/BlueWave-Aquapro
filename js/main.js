// FreshPress Dry Cleaners - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('FreshPress website loaded successfully!');
    
    // Initialize all components
    initializeNavbar();
    initializeCarousel();
    initializeForms();
    initializeAnimations();
    initializeModals();
    initializeTooltips();
    initializeCounters();
});

// Carousel initialization for cross-browser compatibility
function initializeCarousel() {
    const carouselElement = document.getElementById('heroCarousel');
    
    if (carouselElement) {
        // Initialize Bootstrap carousel with explicit options
        const carousel = new bootstrap.Carousel(carouselElement, {
            interval: 5000,
            ride: 'carousel',
            pause: 'hover',
            wrap: true,
            touch: true,
            keyboard: true
        });
        
        // Ensure carousel starts on page load
        carousel.cycle();
        
        // Add touch support for mobile devices
        let touchStartX = 0;
        let touchEndX = 0;
        
        carouselElement.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carouselElement.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swipe left - next slide
                carousel.next();
            }
            if (touchEndX > touchStartX + 50) {
                // Swipe right - previous slide
                carousel.prev();
            }
        }
        
        console.log('Carousel initialized successfully');
    }
}

// Navbar functionality
function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });
}

// Form handling
function initializeForms() {
    const contactForm = document.getElementById('contactForm');
    const pickupForm = document.getElementById('pickupForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    if (pickupForm) {
        pickupForm.addEventListener('submit', handlePickupForm);
    }
    
    // Quick quote form on homepage
    const quickQuoteForm = document.querySelector('.hero-card form');
    if (quickQuoteForm) {
        quickQuoteForm.addEventListener('submit', handleQuickQuote);
    }
}

function handleContactForm(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showSuccessMessage('Thank you! We\'ll contact you within 24 hours.');
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function handlePickupForm(e) {
    e.preventDefault();
    const form = e.target;
    
    // Validate form
    if (validatePickupForm(form)) {
        showSuccessMessage('Pickup scheduled successfully! We\'ll contact you to confirm.');
        bootstrap.Modal.getInstance(document.getElementById('pickupModal')).hide();
        form.reset();
    }
}

function handleQuickQuote(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Get form values
    const name = formData.get('name') || form.querySelector('input[type="text"]')?.value;
    const phone = formData.get('phone') || form.querySelector('input[type="tel"]')?.value;
    const service = formData.get('service') || form.querySelector('select')?.value;
    
    if (name && phone && service) {
        showSuccessMessage('Quote request received! We\'ll call you shortly.');
        form.reset();
    } else {
        showErrorMessage('Please fill in all required fields.');
    }
}

function validatePickupForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Animation handling
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    const animateElements = document.querySelectorAll('.feature-card, .service-card, .testimonial-card, .contact-card');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Modal handling
function initializeModals() {
    // Auto-fill modal with form data if available
    const pickupModal = document.getElementById('pickupModal');
    if (pickupModal) {
        pickupModal.addEventListener('show.bs.modal', function() {
            // Pre-fill with any available form data
            const mainForm = document.getElementById('contactForm');
            if (mainForm) {
                const firstName = mainForm.querySelector('#firstName')?.value;
                const phone = mainForm.querySelector('#phone')?.value;
                
                if (firstName) {
                    document.getElementById('pickupName').value = firstName;
                }
                if (phone) {
                    document.getElementById('pickupPhone').value = phone;
                }
            }
        });
    }
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Counter animations
function initializeCounters() {
    const counters = document.querySelectorAll('.h3');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
                
                if (target && !counter.classList.contains('counted')) {
                    animateCounter(counter, target);
                    counter.classList.add('counted');
                }
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        if (counter.textContent.includes('%') || counter.textContent.includes('+')) {
            counterObserver.observe(counter);
        }
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(function() {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        const suffix = element.textContent.includes('%') ? '%' : '+';
        element.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 40);
}

// Utility functions
function showSuccessMessage(message) {
    const alert = createAlert(message, 'success');
    showAlert(alert);
}

function showErrorMessage(message) {
    const alert = createAlert(message, 'danger');
    showAlert(alert);
}

function createAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    return alertDiv;
}

function showAlert(alert) {
    document.body.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Phone number formatting
function formatPhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    input.value = formattedValue;
}

// Add phone formatting to all phone inputs
document.addEventListener('input', function(e) {
    if (e.target.type === 'tel') {
        formatPhoneNumber(e.target);
    }
});

// Date picker minimum date (today)
document.addEventListener('DOMContentLoaded', function() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
    });
});

// Service selection auto-fill
function handleServiceSelection() {
    const serviceSelects = document.querySelectorAll('select[name="service"], #service');
    
    serviceSelects.forEach(select => {
        select.addEventListener('change', function() {
            const selectedService = this.value;
            const messageField = document.querySelector('#message');
            
            if (messageField && selectedService) {
                const serviceMessages = {
                    'dry-cleaning': 'I need professional dry cleaning services.',
                    'laundry': 'I need wash and fold laundry service.',
                    'suits': 'I need suit and formal wear cleaning.',
                    'wedding': 'I need wedding dress cleaning and preservation.',
                    'leather': 'I need leather and suede cleaning.',
                    'pickup': 'I need pickup and delivery service.'
                };
                
                if (serviceMessages[selectedService] && !messageField.value) {
                    messageField.value = serviceMessages[selectedService];
                }
            }
        });
    });
}

// Initialize service selection handlers
handleServiceSelection();

// Scroll to top functionality
function addScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'btn btn-primary position-fixed';
    scrollToTopBtn.style.cssText = 'bottom: 20px; right: 20px; z-index: 999; display: none; border-radius: 50%; width: 50px; height: 50px;';
    scrollToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    
    document.body.appendChild(scrollToTopBtn);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top
addScrollToTop();

// Loading screen (optional)
function showLoadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'loading-screen';
    loader.className = 'position-fixed w-100 h-100 d-flex align-items-center justify-content-center bg-white';
    loader.style.cssText = 'top: 0; left: 0; z-index: 9999;';
    loader.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h5 class="fw-bold">Loading FreshPress...</h5>
        </div>
    `;
    
    document.body.prepend(loader);
    
    // Hide loading screen when page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.remove();
        }, 1000);
    });
}

// Initialize loading screen for demo effect
// showLoadingScreen();

// Console welcome message
console.log(`
%cFreshPress Dry Cleaners
%cPremium cleaning services since 1998
%cWebsite loaded successfully!
`, 
'color: #0d6efd; font-size: 18px; font-weight: bold;',
'color: #198754; font-size: 14px;',
'color: #6c757d; font-size: 12px;'
);

// Quick track order function for homepage
function quickTrackOrder() {
    const orderID = document.getElementById('quickTrackOrderID').value.trim();
    const phone = document.getElementById('quickTrackPhone').value.trim();
    
    if (!orderID || !phone) {
        alert('Please enter both Order ID and phone number');
        return;
    }
    
    // Redirect to full tracking page with parameters
    window.location.href = `track-order.html?orderID=${encodeURIComponent(orderID)}&phone=${encodeURIComponent(phone)}`;
}