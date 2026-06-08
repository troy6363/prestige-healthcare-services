document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. STICKY HEADER & SCROLL HANDLING
       ========================================================================== */
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       2. MOBILE HAMBURGER MENU
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu.querySelectorAll('a');

    const toggleMenu = () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll'); // Prevent page scroll when menu open
    };

    const closeMenu = () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    menuToggle.addEventListener('click', toggleMenu);
    
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target) && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    /* ==========================================================================
       3. ACTIVE SCROLL LINK HIGHLIGHTING
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');
    
    const highlightNavOnScroll = () => {
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    };
    
    window.addEventListener('scroll', highlightNavOnScroll);

    /* ==========================================================================
       4. CONSULTATION STEPPER FORM LOGIC
       ========================================================================== */
    const form = document.getElementById('consultation-form');
    if (form) {
        const formSteps = document.querySelectorAll('.form-step');
        const nextButtons = document.querySelectorAll('.next-step-btn');
        const prevButtons = document.querySelectorAll('.prev-step-btn');
        const successScreen = document.getElementById('success-screen');
        const resetFormBtn = document.getElementById('reset-form-btn');
        
        // Progress Indicators
        const indicators = {
            1: document.getElementById('step-ind-1'),
            2: document.getElementById('step-ind-2'),
            3: document.getElementById('step-ind-3')
        };
        const lines = {
            1: document.getElementById('step-line-1'),
            2: document.getElementById('step-line-2')
        };

        // Validation Regex Patterns
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/; // matches 10 digits formatted or unformatted

        // Helper: Mark field as valid/invalid
        const setFieldState = (input, isValid) => {
            const group = input.closest('.form-group');
            if (group) {
                if (isValid) {
                    group.classList.remove('invalid');
                } else {
                    group.classList.add('invalid');
                }
            }
        };

        // Validate a specific step
        const validateStep = (stepNumber) => {
            let isStepValid = true;

            if (stepNumber === 1) {
                // Step 1: Enforce at least one service checkbox is checked
                const checkedServices = form.querySelectorAll('input[name="services"]:checked');
                const step1Error = document.getElementById('step-1-error');
                
                if (checkedServices.length === 0) {
                    step1Error.classList.add('active');
                    isStepValid = false;
                } else {
                    step1Error.classList.remove('active');
                }
            } 
            else if (stepNumber === 2) {
                // Step 2: Validate contact fields
                const nameInput = document.getElementById('contact-name');
                const relationSelect = document.getElementById('contact-relation');
                const phoneInput = document.getElementById('contact-phone');
                const emailInput = document.getElementById('contact-email');
                const shelbyCheck = document.getElementById('shelby-county-check');

                // Name verification
                if (nameInput.value.trim() === '') {
                    setFieldState(nameInput, false);
                    isStepValid = false;
                } else {
                    setFieldState(nameInput, true);
                }

                // Relationship dropdown
                if (relationSelect.value === '') {
                    setFieldState(relationSelect, false);
                    isStepValid = false;
                } else {
                    setFieldState(relationSelect, true);
                }

                // Phone verification
                if (!phoneRegex.test(phoneInput.value.trim())) {
                    setFieldState(phoneInput, false);
                    isStepValid = false;
                } else {
                    setFieldState(phoneInput, true);
                }

                // Email verification
                if (!emailRegex.test(emailInput.value.trim())) {
                    setFieldState(emailInput, false);
                    isStepValid = false;
                } else {
                    setFieldState(emailInput, true);
                }

                // Shelby county checkbox
                if (!shelbyCheck.checked) {
                    setFieldState(shelbyCheck, false);
                    isStepValid = false;
                } else {
                    setFieldState(shelbyCheck, true);
                }
            } 
            else if (stepNumber === 3) {
                // Step 3: Verify medicaid check
                const medicaidCheck = document.getElementById('medicaid-verify');
                if (!medicaidCheck.checked) {
                    setFieldState(medicaidCheck, false);
                    isStepValid = false;
                } else {
                    setFieldState(medicaidCheck, true);
                }
            }

            return isStepValid;
        };

        // Transition stepper visuals
        const navigateToStep = (fromStep, toStep) => {
            // Hide fromStep, show toStep
            document.getElementById(`form-step-${fromStep}`).classList.remove('active');
            document.getElementById(`form-step-${toStep}`).classList.add('active');

            // Update progress bar
            // Set all indicators up to toStep as active, others reset
            for (let i = 1; i <= 3; i++) {
                if (i < toStep) {
                    indicators[i].classList.remove('active');
                    indicators[i].classList.add('complete');
                } else if (i === toStep) {
                    indicators[i].classList.add('active');
                    indicators[i].classList.remove('complete');
                } else {
                    indicators[i].classList.remove('active', 'complete');
                }
            }

            // Lines progress
            for (let i = 1; i <= 2; i++) {
                if (i < toStep) {
                    lines[i].classList.add('complete');
                } else {
                    lines[i].classList.remove('complete');
                }
            }
        };

        // Handle "Next" clicks
        nextButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentStep = parseInt(e.target.closest('.form-step').getAttribute('id').replace('form-step-', ''));
                const targetStep = parseInt(btn.getAttribute('data-next'));

                if (validateStep(currentStep)) {
                    navigateToStep(currentStep, targetStep);
                }
            });
        });

        // Handle "Back" clicks
        prevButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentStep = parseInt(e.target.closest('.form-step').getAttribute('id').replace('form-step-', ''));
                const prevStep = parseInt(btn.getAttribute('data-prev'));
                navigateToStep(currentStep, prevStep);
            });
        });

        // Custom text inputs live validation cleanup
        form.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('input', () => {
                const group = element.closest('.form-group');
                if (group && group.classList.contains('invalid')) {
                    group.classList.remove('invalid');
                }
            });
            
            element.addEventListener('change', () => {
                const group = element.closest('.form-group');
                if (group && group.classList.contains('invalid')) {
                    group.classList.remove('invalid');
                }
            });
        });

        // Stepper Form Submit Handler
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Final Step Validation
            if (validateStep(3)) {
                // Retrieve values for final screen summary
                const phoneVal = document.getElementById('contact-phone').value.trim();
                const emailVal = document.getElementById('contact-email').value.trim();

                document.getElementById('summary-phone').textContent = phoneVal;
                document.getElementById('summary-email').textContent = emailVal;

                // Mark last indicator complete
                indicators[3].classList.remove('active');
                indicators[3].classList.add('complete');

                // Hide form, show success screen
                form.style.display = 'none';
                successScreen.classList.add('active');

                // Smooth scroll up to consultation card header on submit
                const consultSection = document.getElementById('consultation');
                if (consultSection) {
                    consultSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Reset Form Stepper back to beginning
        const resetForm = () => {
            form.reset();
            
            // Reset steps display
            formSteps.forEach(step => step.classList.remove('active'));
            const firstStep = document.getElementById('form-step-1');
            if (firstStep) firstStep.classList.add('active');

            // Reset progress bar UI
            for (let i = 1; i <= 3; i++) {
                if (indicators[i]) indicators[i].classList.remove('active', 'complete');
            }
            if (indicators[1]) indicators[1].classList.add('active');

            for (let i = 1; i <= 2; i++) {
                if (lines[i]) lines[i].classList.remove('complete');
            }

            // Clean validation errors
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('invalid');
            });
            const step1Err = document.getElementById('step-1-error');
            if (step1Err) step1Err.classList.remove('active');

            // Toggle visibility
            successScreen.classList.remove('active');
            form.style.display = 'block';
        };

        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', resetForm);
        }
    }

    // Split letters for sunshine shine effect
    const shineText = document.querySelector('.shine-text');
    if (shineText) {
        const text = shineText.textContent;
        shineText.textContent = '';
        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
                span.style.display = 'inline-block';
            } else {
                span.textContent = char;
                span.classList.add('shine-letter');
                span.style.animationDelay = `${index * 0.08}s`;
            }
            shineText.appendChild(span);
        });
    }

    /* ==========================================================================
       6. CARD STACKING & IMAGE ZOOM SCROLL ANIMATION
       ========================================================================== */
    const stackContainer = document.getElementById('services-stack-container');
    
    if (stackContainer) {
        const cards = stackContainer.querySelectorAll('.service-stack-card');
        const innerCards = stackContainer.querySelectorAll('.service-card-inner');
        const images = stackContainer.querySelectorAll('.service-card-img');
        
        const mapRange = (value, inMin, inMax, outMin, outMax) => {
            if (value <= inMin) return outMin;
            if (value >= inMax) return outMax;
            return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
        };
        
        // Cache layout metrics to prevent layout thrashing (forced reflow via getBoundingClientRect) on scroll
        let containerOffsetTop = 0;
        let containerHeight = 0;
        const cardOffsetTops = [];
        
        const cacheMetrics = () => {
            const containerRect = stackContainer.getBoundingClientRect();
            containerOffsetTop = containerRect.top + window.scrollY;
            containerHeight = containerRect.height;
            
            cards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                cardOffsetTops[index] = cardRect.top + window.scrollY;
            });
        };
        
        // Initial metrics caching
        cacheMetrics();
        
        let ticking = false;
        
        const updateCardAnimation = () => {
            const currentScrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const isMobile = window.innerWidth <= 768;
            const stickyTop = isMobile ? 80 : 100;
            
            // Container overall scroll progress (start start to end end) calculated using cached document offsets
            const rectTop = containerOffsetTop - currentScrollY;
            const totalScrollableHeight = containerHeight - viewportHeight;
            let containerProgress = 0;
            
            if (totalScrollableHeight > 0) {
                containerProgress = -rectTop / totalScrollableHeight;
                containerProgress = Math.max(0, Math.min(1, containerProgress));
            }
            
            cards.forEach((card, index) => {
                const innerCard = innerCards[index];
                const image = images[index];
                
                if (!innerCard) return;
                
                // 1. Calculate and apply card scale based on container progress
                const rangeStart = index * 0.25;
                const targetScale = 1 - (cards.length - index) * 0.05; // 0.85, 0.90, 0.95
                
                const cardScale = mapRange(containerProgress, rangeStart, 1, 1, targetScale);
                
                // 2. Calculate and apply image zoom based on card entry progress
                // Instead of getBoundingClientRect, calculate current top coordinate relative to viewport.
                // Once it reaches its sticky top boundary, it remains clamped in place.
                const cardRectTop = Math.max(stickyTop, cardOffsetTops[index] - currentScrollY);
                
                let cardProgress = (viewportHeight - cardRectTop) / viewportHeight;
                cardProgress = Math.max(0, Math.min(1, cardProgress));
                
                // Zoom from 1.6 down to 1.0
                const imgScale = mapRange(cardProgress, 0, 1, 1.6, 1.0);
                
                // Apply transforms with GPU acceleration triggers
                innerCard.style.transform = `scale(${cardScale}) translateZ(0)`;
                if (image) {
                    image.style.transform = `scale(${imgScale}) translateZ(0)`;
                }
            });
            
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateCardAnimation);
                ticking = true;
            }
        };
        
        const onResize = () => {
            cacheMetrics();
            onScroll();
        };
        
        window.addEventListener('scroll', onScroll);
        window.addEventListener('resize', onResize);
        
        // Also re-cache metrics after resources are fully loaded to account for late layout shifts
        window.addEventListener('load', onResize);
        
        // Initial render
        updateCardAnimation();
    }

    /* ==========================================================================
       6. HERO VIDEO SMOOTH LOOP & FADE OUT
       ========================================================================== */
    const heroVideos = document.querySelectorAll('.hero-video');
    
    // Performance Optimization: Only load the video source matching the current device viewport to prevent double-downloading
    const handleVideoPlayback = () => {
        const isMobile = window.innerWidth <= 768;
        const desktopVideo = document.querySelector('.desktop-only-video');
        const mobileVideo = document.querySelector('.mobile-only-video');
        
        if (isMobile) {
            if (desktopVideo) {
                if (!desktopVideo.paused) desktopVideo.pause();
                // Clear source to release memory/network resources on mobile
                if (desktopVideo.hasAttribute('src')) {
                    desktopVideo.removeAttribute('src');
                    desktopVideo.load();
                }
            }
            if (mobileVideo) {
                if (!mobileVideo.hasAttribute('src')) {
                    mobileVideo.setAttribute('src', mobileVideo.getAttribute('data-src'));
                    mobileVideo.load();
                }
                if (mobileVideo.paused) {
                    mobileVideo.play().catch(() => {});
                }
            }
        } else {
            if (mobileVideo) {
                if (!mobileVideo.paused) mobileVideo.pause();
                // Clear source to release memory/network resources on desktop
                if (mobileVideo.hasAttribute('src')) {
                    mobileVideo.removeAttribute('src');
                    mobileVideo.load();
                }
            }
            if (desktopVideo) {
                if (!desktopVideo.hasAttribute('src')) {
                    desktopVideo.setAttribute('src', desktopVideo.getAttribute('data-src'));
                    desktopVideo.load();
                }
                if (desktopVideo.paused) {
                    desktopVideo.play().catch(() => {});
                }
            }
        }
    };
    
    // Initialize playback switching
    handleVideoPlayback();
    window.addEventListener('resize', handleVideoPlayback);
    
    heroVideos.forEach(video => {
        // Remove the native HTML loop behavior so we can manage loop transition in JS
        video.removeAttribute('loop');
        
        const fadeDuration = 0.6; // matches CSS transition duration in seconds
        
        video.addEventListener('timeupdate', () => {
            if (video.duration) {
                // When playhead gets within fadeDuration of the end, start fading out
                if (video.currentTime >= video.duration - fadeDuration) {
                    video.classList.add('fade-out');
                }
            }
        });
        
        video.addEventListener('ended', () => {
            // Wait briefly in black before restarting the loop
            setTimeout(() => {
                video.currentTime = 0;
                
                // Only trigger play if this specific video is currently visible
                const isMobile = window.innerWidth <= 768;
                const isDesktopVideo = video.classList.contains('desktop-only-video');
                const isMobileVideo = video.classList.contains('mobile-only-video');
                
                if ((isMobile && isMobileVideo) || (!isMobile && isDesktopVideo)) {
                    video.play().catch(err => {
                        console.log("Auto-loop play prevented:", err);
                    });
                }
            }, 300); // 300ms black/fade pause
        });
        
        // Remove the fade-out class once video starts playing again to fade it in
        video.addEventListener('play', () => {
            video.classList.remove('fade-out');
        });
        
        // Fallback to ensure fade-out is removed on manual seeks/resets
        video.addEventListener('seeked', () => {
            if (video.currentTime < 1) {
                video.classList.remove('fade-out');
            }
        });
    });

    /* ==========================================================================
       7. MOBILE PARALLAX SCROLL EFFECT
       ========================================================================== */
    const mobileParallaxSection = document.querySelector('.parallax-accent-section');
    const mobileParallaxImage = document.querySelector('.parallax-accent-section .parallax-bg-img');
    
    if (mobileParallaxSection && mobileParallaxImage) {
        const handleMobileParallax = () => {
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) {
                // Clear any inline styles set by mobile parallax on desktop viewports
                mobileParallaxImage.style.transform = '';
                return;
            }
            
            const rect = mobileParallaxSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Check if section is visible in viewport
            if (rect.top < viewportHeight && rect.bottom > 0) {
                // Calculate scroll progress percentage through the viewport (0 when entering bottom, 1 when exiting top)
                const totalRange = viewportHeight + rect.height;
                const currentPos = viewportHeight - rect.top;
                const scrollProgress = currentPos / totalRange;
                
                // Map progress to vertical translation (-30% to 30% of container height)
                const maxTranslate = rect.height * 0.30; // 30% of container height (e.g. 135px)
                const translateY = (scrollProgress - 0.5) * -2 * maxTranslate;
                
                // Hardware-accelerated GPU translation
                mobileParallaxImage.style.transform = `translate3d(0, ${translateY}px, 0)`;
            }
        };
        
        window.addEventListener('scroll', handleMobileParallax);
        window.addEventListener('resize', handleMobileParallax);
        handleMobileParallax(); // Run initially
    }

    /* ==========================================================================
       8. SCROLL REVEAL TESTIMONIALS (MOBILE ONLY)
       ========================================================================== */
    const revealCards = document.querySelectorAll('.testimonial-card.reveal-left, .testimonial-card.reveal-right');
    
    if (revealCards.length > 0) {
        let revealTicking = false;
        
        const updateScrollReveal = () => {
            const isMobile = window.innerWidth <= 768;
            const viewportHeight = window.innerHeight;
            
            revealCards.forEach(card => {
                if (!isMobile) {
                    card.style.transform = '';
                    card.style.opacity = '';
                    return;
                }
                
                const rect = card.getBoundingClientRect();
                const cardHeight = rect.height;
                
                // Scroll reveal range (Mobile Only)
                // Start revealing when the top of the card is at 82% of viewport height (remains invisible below this)
                const startY = viewportHeight * 0.82;
                // Fully reveal when the card's top reaches 52% of the viewport height (near the screen center)
                const endY = viewportHeight * 0.52;
                
                let progress = 0;
                if (rect.top <= endY) {
                    progress = 1;
                } else if (rect.top >= startY) {
                    progress = 0;
                } else {
                    progress = (startY - rect.top) / (startY - endY);
                }
                
                // Max offset to translate in pixels
                const maxOffset = 60;
                const isLeft = card.classList.contains('reveal-left');
                
                // Apply a smoothstep easing curve for a premium feel
                const easedProgress = progress * progress * (3 - 2 * progress);
                
                const translateX = isLeft ? -maxOffset * (1 - easedProgress) : maxOffset * (1 - easedProgress);
                
                card.style.transform = `translate3d(${translateX}px, 0, 0)`;
                card.style.opacity = easedProgress;
            });
            revealTicking = false;
        };
        
        const onRevealScroll = () => {
            if (!revealTicking) {
                window.requestAnimationFrame(updateScrollReveal);
                revealTicking = true;
            }
        };
        
        window.addEventListener('scroll', onRevealScroll, { passive: true });
        window.addEventListener('resize', () => {
            updateScrollReveal();
            onRevealScroll();
        }, { passive: true });
        
        // Initial run
        updateScrollReveal();
    }
});
