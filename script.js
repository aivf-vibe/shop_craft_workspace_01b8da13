

// Sample product data
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 99.99,
        description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        category: "Electronics"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 249.99,
        description: "Advanced fitness tracking and health monitoring smartwatch",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        category: "Electronics"
    },
    {
        id: 3,
        name: "Leather Backpack",
        price: 79.99,
        description: "Stylish genuine leather backpack with laptop compartment",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
        category: "Fashion"
    },
    {
        id: 4,
        name: "Running Shoes",
        price: 129.99,
        description: "Lightweight running shoes with advanced cushioning technology",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        category: "Fashion"
    },
    {
        id: 5,
        name: "Coffee Maker",
        price: 149.99,
        description: "Programmable coffee maker with thermal carafe",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
        category: "Home"
    },
    {
        id: 6,
        name: "Yoga Mat",
        price: 39.99,
        description: "Premium non-slip yoga mat with alignment guides",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
        category: "Sports"
    }
];

// Shopping cart
let cart = [];
let isLoggedIn = false;
let currentUser = null;

// DOM Elements
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const userBtn = document.getElementById('userBtn');
const userModal = document.getElementById('userModal');
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCartFromStorage();
    checkAuthStatus();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCart();
        }
        if (e.target === userModal) {
            closeUserModal();
        }
    });

    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal === cartModal) closeCart();
            if (modal === userModal) closeUserModal();
        });
    });

    // Cart button
    cartBtn.addEventListener('click', openCart);
    
    // User button
    userBtn.addEventListener('click', openUserModal);

    // FAQ toggle
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            answer.classList.toggle('active');
            question.querySelector('i').classList.toggle('fa-chevron-up');
            question.querySelector('i').classList.toggle('fa-chevron-down');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Product Functions
function loadProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-description">${product.description}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Cart Functions
function addToCart(productId) {
    if (!isLoggedIn) {
        openUserModal();
        return;
    }

    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    saveCartToStorage();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

function updateCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
    } else {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button onclick="removeFromCart(${item.id})" style="margin-left: 1rem; color: #ef4444; background: none; border: none; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function openCart() {
    cartModal.style.display = 'block';
    updateCart();
}

function closeCart() {
    cartModal.style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    if (!isLoggedIn) {
        closeCart();
        openUserModal();
        return;
    }
    
    // Simulate checkout process
    showNotification('Processing your order...', 'info');
    
    setTimeout(() => {
        cart = [];
        updateCart();
        saveCartToStorage();
        closeCart();
        showNotification('Order placed successfully! Thank you for shopping with us.', 'success');
    }, 2000);
}

// Authentication Functions
function openUserModal() {
    userModal.style.display = 'block';
}

function closeUserModal() {
    userModal.style.display = 'none';
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

function login(event) {
    event.preventDefault();
    const email = event.target.elements[0].value;
    const password = event.target.elements[1].value;
    
    // Simulate login
    if (email && password) {
        isLoggedIn = true;
        currentUser = { email, name: email.split('@')[0] };
        saveAuthToStorage();
        closeUserModal();
        updateAuthUI();
        showNotification('Welcome back!', 'success');
    }
}

function register(event) {
    event.preventDefault();
    const name = event.target.elements[0].value;
    const email = event.target.elements[1].value;
    const password = event.target.elements[2].value;
    const confirmPassword = event.target.elements[3].value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    // Simulate registration
    if (name && email && password) {
        isLoggedIn = true;
        currentUser = { email, name };
        saveAuthToStorage();
        closeUserModal();
        updateAuthUI();
        showNotification('Account created successfully!', 'success');
    }
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    saveAuthToStorage();
    updateAuthUI();
    showNotification('Logged out successfully');
}

function updateAuthUI() {
    const userBtn = document.getElementById('userBtn');
    if (isLoggedIn) {
        userBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        userBtn.title = `Welcome, ${currentUser.name}`;
        userBtn.onclick = () => {
            if (confirm('Do you want to log out?')) {
                logout();
            }
        };
    } else {
        userBtn.innerHTML = `<i class="fas fa-user"></i>`;
        userBtn.title = 'Login/Register';
        userBtn.onclick = openUserModal;
    }
}

// Utility Functions
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function scrollToCategories() {
    document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        case 'info':
            notification.style.background = '#3b82f6';
            break;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Local Storage Functions
function saveCartToStorage() {
    localStorage.setItem('shopcraft_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('shopcraft_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

function saveAuthToStorage() {
    localStorage.setItem('shopcraft_auth', JSON.stringify({ isLoggedIn, currentUser }));
}

function loadAuthFromStorage() {
    const savedAuth = localStorage.getItem('shopcraft_auth');
    if (savedAuth) {
        const auth = JSON.parse(savedAuth);
        isLoggedIn = auth.isLoggedIn;
        currentUser = auth.currentUser;
        updateAuthUI();
    }
}

function checkAuthStatus() {
    loadAuthFromStorage();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Search functionality (placeholder)
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = prompt('What are you looking for?');
    if (searchTerm) {
        showNotification(`Searching for: ${searchTerm}`, 'info');
        // Implement search functionality here
    }
});

