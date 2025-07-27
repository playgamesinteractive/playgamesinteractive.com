// Supabase configuration
const SUPABASE_URL = 'https://wesamwjbgmneeowiytlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc2Ftd2piZ21uZWVvd2l5dGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzY0MDMsImV4cCI6MjA2OTIxMjQwM30.czZs4pjSuFaQeKlIFJoguu4t3f3GyS-ja6OOKhjq_oo';

// Supabase client initialization
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        };
    }

    async insert(table, data) {
        const response = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to insert data');
        }
        
        return response;
    }

    async count(table) {
        const response = await fetch(`${this.url}/rest/v1/${table}?select=count`, {
            method: 'GET',
            headers: {
                ...this.headers,
                'Prefer': 'count=exact'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get count');
        }
        
        const count = response.headers.get('content-range');
        return count ? parseInt(count.split('/')[1]) : 0;
    }
}

// Initialize Supabase client
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const message = document.getElementById('message');
const waitlistCount = document.getElementById('waitlistCount');

// Utility functions
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);
    }
}

function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoading.style.display = loading ? 'inline' : 'none';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function animateCount(target, duration = 1000) {
    const start = parseInt(waitlistCount.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            current = target;
            clearInterval(timer);
        }
        waitlistCount.textContent = Math.floor(current);
    }, 16);
}

// Load waitlist count on page load
async function loadWaitlistCount() {
    try {
        const count = await supabase.count('waitlist');
        animateCount(count);
    } catch (error) {
        console.error('Error loading waitlist count:', error);
        waitlistCount.textContent = '---';
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Validation
    if (!email) {
        showMessage('Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
    }
    
    setLoading(true);
    message.style.display = 'none';
    
    try {
        // Insert email into waitlist
        await supabase.insert('waitlist', {
            email: email,
            created_at: new Date().toISOString()
        });
        
        // Success
        showMessage('🎉 You\'re on the waitlist! We\'ll notify you when we launch.', 'success');
        emailInput.value = '';
        
        // Update count
        const newCount = await supabase.count('waitlist');
        animateCount(newCount);
        
    } catch (error) {
        console.error('Error adding to waitlist:', error);
        
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
            showMessage('This email is already on our waitlist!', 'error');
        } else {
            showMessage('Something went wrong. Please try again.', 'error');
        }
    } finally {
        setLoading(false);
    }
}



// Event listeners
form.addEventListener('submit', handleSubmit);

// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    loadWaitlistCount();
    emailInput.focus();
    initCustomCursor();
    initButtonRipple();
    
    // Update count every 30 seconds
    setInterval(loadWaitlistCount, 1000);
});

// Custom Cursor Implementation
function initCustomCursor() {
    const cursorDotOutline = document.querySelector('.cursor-dot-outline');
    const cursorDotPoint = document.querySelector('.cursor-dot-point');
    
    if (!cursorDotOutline || !cursorDotPoint) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let pointX = 0;
    let pointY = 0;
    
    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Animate cursor
    function animateCursor() {
        // Smooth follow for outline
        outlineX += (mouseX - outlineX) * 0.1;
        outlineY += (mouseY - outlineY) * 0.1;
        
        // Direct follow for point
        pointX += (mouseX - pointX) * 0.8;
        pointY += (mouseY - pointY) * 0.8;
        
        cursorDotOutline.style.left = outlineX - 15 + 'px';
        cursorDotOutline.style.top = outlineY - 15 + 'px';
        
        cursorDotPoint.style.left = pointX - 2.5 + 'px';
        cursorDotPoint.style.top = pointY - 2.5 + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Hover effects
    const hoverElements = document.querySelectorAll('button, a, input, .brand-logo');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDotOutline.style.transform = 'scale(1.5)';
            cursorDotPoint.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorDotOutline.style.transform = 'scale(1)';
            cursorDotPoint.style.transform = 'scale(1)';
        });
    });
}

// Button Ripple Effect
function initButtonRipple() {
    const buttons = document.querySelectorAll('.submit-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = button.querySelector('.button-ripple');
            if (!ripple) return;
            
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            ripple.classList.remove('animate');
            ripple.offsetHeight; // Trigger reflow
            ripple.classList.add('animate');
        });
    });
}

// Add some visual feedback for email input
emailInput.addEventListener('input', () => {
    if (message.style.display === 'block' && message.classList.contains('error')) {
        message.style.display = 'none';
    }
});

// Add enter key support
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSubmit(e);
    }
});