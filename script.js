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
            const profileDrawer = document.getElementById('profile-drawer');

            if(drawerOverlay) {
                drawerOverlay.addEventListener('click', () => {
                    if (cartDrawer.classList.contains('active')) toggleCart();
                    if (profileDrawer.classList.contains('active')) toggleProfile();
                });
            }

            // --- Shopping Cart Logic ---
            const cartButton = document.getElementById('cart-button');
            const cartCloseButton = document.getElementById('cart-close-button');
            const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
            const cartItemsContainer = document.getElementById('cart-items');
            const cartTotalPriceEl = document.getElementById('cart-total-price');
            const cartBadge = document.getElementById('cart-badge');
            const cartEmptyMessage = document.getElementById('cart-empty-message');
            let cart = [];

            const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
                    const { productId, productName, productPrice, productImage } = e.currentTarget.dataset;
                    if (!productId || !productName || !productPrice || !productImage) return;

                    const existingItem = cart.find(item => item.id === productId);
                    if (existingItem) {
                        existingItem.quantity++;
                    } else {
                        cart.push({ id: productId, name: productName, price: parseFloat(productPrice), image: productImage, quantity: 1 });
                    }
                    renderCart();
                    if (!cartDrawer.classList.contains('active')) toggleCart();
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

            // --- Profile Drawer Logic ---
            const profileCloseButton = document.getElementById('profile-close-button');
            const orderHistoryList = document.getElementById('order-history-list');
            const orderEmptyMessage = document.getElementById('order-empty-message');
            const profileForm = document.getElementById('profile-form');
            const profileNameInput = document.getElementById('profile-name');
            const profileEmailInput = document.getElementById('profile-email');

            const mockOrders = [
                { id: 'TEK-84372', date: '2024-07-22', total: 4999, status: 'Entregue' },
                { id: 'TEK-82199', date: '2024-06-15', total: 12000, status: 'Entregue' },
                { id: 'TEK-79543', date: '2024-04-02', total: 3500, status: 'Enviado' },
            ];
            
            const toggleProfile = () => {
                profileDrawer.classList.toggle('active');
                drawerOverlay.classList.toggle('active');
                document.body.style.overflow = profileDrawer.classList.contains('active') ? 'hidden' : '';
            };

            const renderOrderHistory = () => {
                orderHistoryList.innerHTML = '';
                orderEmptyMessage.style.display = mockOrders.length === 0 ? 'block' : 'none';

                if(mockOrders.length > 0) {
                    mockOrders.forEach(order => {
                         const li = document.createElement('li');
                         li.classList.add('order-item');
                         const statusClass = `status-${order.status.toLowerCase()}`;
                         li.innerHTML = `
                            <div class="order-item-header">
                                <span class="order-id">#${order.id}</span>
                                <span class="order-status ${statusClass}">${order.status}</span>
                            </div>
                            <div class="order-item-body">
                                <p><strong>Data:</strong> ${new Date(order.date).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
                            </div>
                         `;
                         orderHistoryList.appendChild(li);
                    });
                }
            };
            
            profileCloseButton?.addEventListener('click', toggleProfile);
            renderOrderHistory(); // Initial render of mock data
            
            // --- Auth Modal & State Logic ---
            const authButton = document.getElementById('auth-button');
            const authModal = document.getElementById('auth-modal');
            const authOverlay = document.getElementById('auth-modal-overlay');
            const authCloseButton = document.getElementById('auth-modal-close');
            const authTabs = document.querySelectorAll('.auth-tab');
            const authForms = document.querySelectorAll('.auth-form');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const guestView = document.getElementById('guest-view');
            const userView = document.getElementById('user-view');
            const userNameEl = document.getElementById('user-name');
            const logoutButton = document.getElementById('logout-button');

            const openAuthModal = () => {
                authModal.classList.add('active');
                authOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            const closeAuthModal = () => {
                authModal.classList.remove('active');
                authOverlay.classList.remove('active');
                if (!cartDrawer.classList.contains('active') && !profileDrawer.classList.contains('active')) {
                    document.body.style.overflow = '';
                }
            };
            
            const loginUser = (name, email) => {
                guestView.style.display = 'none';
                userView.style.display = 'flex';
                userNameEl.textContent = `Olá, ${name}`;
                profileNameInput.value = name;
                profileEmailInput.value = email;
                closeAuthModal();
            };
            
            const logoutUser = () => {
                guestView.style.display = 'block';
                userView.style.display = 'none';
                userNameEl.textContent = '';
            };

            authButton?.addEventListener('click', openAuthModal);
            authCloseButton?.addEventListener('click', closeAuthModal);
            authOverlay?.addEventListener('click', closeAuthModal);
            logoutButton?.addEventListener('click', logoutUser);
            userView?.addEventListener('click', (e) => {
                // Open profile only if name is clicked, not logout button
                if(e.target.id === 'user-name') {
                    toggleProfile();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (authModal.classList.contains('active')) closeAuthModal();
                    if (cartDrawer.classList.contains('active')) toggleCart();
                    if (profileDrawer.classList.contains('active')) toggleProfile();
                }
            });

            authTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = document.querySelector(tab.dataset.tabTarget);
                    authTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    authForms.forEach(form => form.classList.remove('active'));
                    if (target) target.classList.add('active');
                });
            });
            
            loginForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('login-email');
                if (emailInput.value) {
                     const name = emailInput.value.split('@')[0];
                     loginUser(name, emailInput.value);
                }
            });
            
            registerForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('register-name');
                const emailInput = document.getElementById('register-email');
                if (nameInput.value && emailInput.value) {
                    loginUser(nameInput.value, emailInput.value);
                }
            });

            profileForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                const newName = profileNameInput.value;
                userNameEl.textContent = `Olá, ${newName}`;
                const submitButton = profileForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Salvo!';
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    toggleProfile();
                }, 1500);
            });
        });