    document.addEventListener('DOMContentLoaded', () => {
            
            // --- Mobile Menu Logic ---
            const menuButton = document.getElementById('menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            const openIcon = document.getElementById('menu-open-icon');
            const closeIcon = document.getElementById('menu-close-icon');

            if (menuButton && mobileMenu && openIcon && closeIcon) {
                menuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('active');
                    const isActive = mobileMenu.classList.contains('active');
                    openIcon.style.display = isActive ? 'none' : 'block';
                    closeIcon.style.display = isActive ? 'block' : 'none';
                    menuButton.setAttribute('aria-expanded', String(isActive));
                });

                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        mobileMenu.classList.remove('active');
                        openIcon.style.display = 'block';
                        closeIcon.style.display = 'none';
                        menuButton.setAttribute('aria-expanded', 'false');
                    });
                });
            }

            // --- Carousel Logic ---
            const carousel = document.querySelector('.carousel-container');
            if (carousel) {
                const slidesContainer = carousel.querySelector('.carousel-slides');
                const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
                const prevButton = carousel.querySelector('.carousel-button.prev');
                const nextButton = carousel.querySelector('.carousel-button.next');
                const dotsContainer = carousel.querySelector('.carousel-dots');
                let currentIndex = 0;
                const slideCount = slides.length;
                let autoplayInterval = null;

                if (dotsContainer && slideCount > 0) {
                    slides.forEach((_, i) => {
                        const dot = document.createElement('button');
                        dot.classList.add('carousel-dot');
                        dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
                        if (i === 0) dot.classList.add('active');
                        dotsContainer.appendChild(dot);
                        dot.addEventListener('click', () => {
                            goToSlide(i);
                            resetAutoplay();
                        });
                    });
                }
                
                const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.carousel-dot')) : [];

                const goToSlide = (index) => {
                    currentIndex = (index + slideCount) % slideCount;
                    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
                };

                const nextSlide = () => goToSlide(currentIndex + 1);
                const startAutoplay = () => {
                    if (autoplayInterval) clearInterval(autoplayInterval);
                    autoplayInterval = setInterval(nextSlide, 5000);
                };
                const stopAutoplay = () => clearInterval(autoplayInterval);
                const resetAutoplay = () => {
                    stopAutoplay();
                    startAutoplay();
                };

                nextButton?.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
                prevButton?.addEventListener('click', () => { goToSlide(currentIndex - 1); resetAutoplay(); });
                carousel.addEventListener('mouseenter', stopAutoplay);
                carousel.addEventListener('mouseleave', startAutoplay);
                startAutoplay();
            }

            // --- Shared Drawer Logic ---
            const drawerOverlay = document.getElementById('drawer-overlay');
            const cartDrawer = document.getElementById('cart-drawer');

            if(drawerOverlay) {
                drawerOverlay.addEventListener('click', () => {
                    if (cartDrawer.classList.contains('active')) toggleCart();
                });
            }

            // --- Budget (Shopping Cart) Logic ---
            const cartButton = document.getElementById('cart-button');
            const cartCloseButton = document.getElementById('cart-close-button');
            const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
            const cartItemsContainer = document.getElementById('cart-items');
            const cartTotalPriceEl = document.getElementById('cart-total-price');
            const cartBadge = document.getElementById('cart-badge');
            const cartEmptyMessage = document.getElementById('cart-empty-message');
            const checkoutButton = document.querySelector('.cart-checkout-button');
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
            
            const saveCart = () => {
                localStorage.setItem('cart', JSON.stringify(cart));
            };

            const toggleCart = () => {
                cartDrawer.classList.toggle('active');
                drawerOverlay.classList.toggle('active');
                document.body.style.overflow = cartDrawer.classList.contains('active') ? 'hidden' : '';
            };

            const renderCart = () => {
                cartItemsContainer.innerHTML = '';
                cartEmptyMessage.style.display = cart.length === 0 ? 'block' : 'none';
                
                if (cart.length > 0) {
                    cart.forEach(item => {
                        const li = document.createElement('li');
                        li.classList.add('cart-item');
                        li.dataset.productId = item.id;
                        li.innerHTML = `
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                            <div class="cart-item-details">
                                <h4>${item.name}</h4>
                                <p class="price">${formatCurrency(item.price)}</p>
                                <div class="cart-item-quantity">
                                    <button class="quantity-btn decrease-quantity-btn" aria-label="Diminuir quantidade">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="quantity-btn increase-quantity-btn" aria-label="Aumentar quantidade">+</button>
                                </div>
                            </div>
                            <div class="cart-item-subtotal">${formatCurrency(item.price * item.quantity)}</div>`;
                        cartItemsContainer.appendChild(li);
                    });
                }
                updateCartTotal();
                updateCartBadge();
                saveCart();
            };
            
            const updateCartTotal = () => {
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                cartTotalPriceEl.textContent = formatCurrency(total);
            };
            
            const updateCartBadge = () => {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartBadge.textContent = String(totalItems);
                cartBadge.classList.toggle('visible', totalItems > 0);
            };

            addToCartButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const clickedButton = e.currentTarget;
                    const { productId, productName, productPrice, productImage } = clickedButton.dataset;
                    
                    if (!productId || !productName || !productPrice || !productImage) return;

                    // Prevent multiple clicks while animation is running
                    if (clickedButton.disabled) return;

                    const originalContent = clickedButton.innerHTML;
                    clickedButton.disabled = true;
                    
                    // Visual feedback
                    clickedButton.innerHTML = `
                        <span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; line-height: 1;">
                            Adicionado
                            <svg style="width: 1.1rem; height: 1.1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </span>`;

                    // Add to cart logic
                    const existingItem = cart.find(item => item.id === productId);
                    if (existingItem) {
                        existingItem.quantity++;
                    } else {
                        cart.push({ id: productId, name: productName, price: parseFloat(productPrice), image: productImage, quantity: 1 });
                    }
                    
                    // Render cart and open drawer
                    renderCart();
                    if (!cartDrawer.classList.contains('active')) {
                        toggleCart();
                    }

                    // Revert button state after a delay
                    setTimeout(() => {
                        clickedButton.innerHTML = originalContent;
                        clickedButton.disabled = false;
                    }, 1500);
                });
            });
            
            cartItemsContainer?.addEventListener('click', (e) => {
                const cartItemElement = e.target.closest('.cart-item');
                if (!cartItemElement) return;

                const productId = cartItemElement.dataset.productId;
                const itemInCart = cart.find(item => item.id === productId);
                if (!itemInCart) return;

                if (e.target.classList.contains('increase-quantity-btn')) {
                    itemInCart.quantity++;
                } else if (e.target.classList.contains('decrease-quantity-btn')) {
                    itemInCart.quantity--;
                }
                
                if (itemInCart.quantity <= 0) cart = cart.filter(item => item.id !== productId);
                
                renderCart();
            });

            cartButton?.addEventListener('click', toggleCart);
            cartCloseButton?.addEventListener('click', toggleCart);
            renderCart(); // Initial render

            // --- Form Validation Logic ---
            const setError = (inputElement, message) => {
                const formGroup = inputElement.parentElement;
                const errorDisplay = formGroup.querySelector('.form-error-message');
                inputElement.classList.add('invalid');
                if (errorDisplay) errorDisplay.innerText = message;
            };

            const clearError = (inputElement) => {
                const formGroup = inputElement.parentElement;
                const errorDisplay = formGroup.querySelector('.form-error-message');
                inputElement.classList.remove('invalid');
                if (errorDisplay) errorDisplay.innerText = '';
            };
            
            const clearGuestErrors = () => {
                clearError(document.getElementById('guest-name'));
                clearError(document.getElementById('guest-email'));
                clearError(document.getElementById('guest-phone'));
            }
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (cartDrawer.classList.contains('active')) toggleCart();
                }
            });

            checkoutButton?.addEventListener('click', async () => {
                if (cart.length === 0) {
                    alert('Seu orçamento está vazio!');
                    return;
                }
                clearGuestErrors();

                const whatsappNumber = "5514997201523";
                
                const guestNameInput = document.getElementById('guest-name');
                const guestEmailInput = document.getElementById('guest-email');
                const guestPhoneInput = document.getElementById('guest-phone');
                
                const userName = guestNameInput.value.trim();
                const userEmail = guestEmailInput.value.trim();
                const userPhone = guestPhoneInput.value.trim();
                
                let isGuestValid = true;
                if(!userName) {
                    setError(guestNameInput, 'O nome é obrigatório.');
                    isGuestValid = false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!userEmail || !emailRegex.test(userEmail)) {
                    setError(guestEmailInput, 'Por favor, insira um e-mail válido.');
                    isGuestValid = false;
                }
                if(!userPhone || userPhone.length < 10) {
                    setError(guestPhoneInput, 'Telefone inválido (inclua o DDD).');
                    isGuestValid = false;
                }

                if (!isGuestValid) return;
                
                const productsList = cart.map(item => `- ${item.name} (Qtd: ${item.quantity})`).join('\n');
                const observations = document.getElementById('budget-observations-textarea').value.trim();
                const totalValue = cartTotalPriceEl.textContent;

                let message = `Olá! Gostaria de um orçamento para os seguintes itens:\n\n*Produtos:*\n${productsList}\n\n*Total estimado:* ${totalValue}\n\n`;

                if(observations) {
                    message += `*Observações:*\n${observations}\n\n`;
                }

                message += `*Meus Dados:*\n- Nome: ${userName}\n- Email: ${userEmail}\n- Telefone: ${userPhone}\n\nAguardando o contato. Obrigado!`;
                
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
                
                // Limpa o orçamento após o envio
                cart = [];
                renderCart();
                toggleCart();
            });

            // --- Lógica da Animação de Rolagem ---
            const animatedElements = document.querySelectorAll('.scroll-animate');
            if (animatedElements.length > 0) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '0px 0px -50px 0px' // Aciona um pouco antes de estar totalmente visível
                });

                animatedElements.forEach(el => {
                    observer.observe(el);
                });
            }
        });