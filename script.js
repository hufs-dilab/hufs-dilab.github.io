document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Interest tag color assignment based on text content
    const interestColors = [
        // Blues
        { bg: '#e3f2fd', text: '#1565c0' }, // Light Blue
        { bg: '#bbdefb', text: '#0d47a1' }, // Blue
        { bg: '#e1f5fe', text: '#0277bd' }, // Sky Blue
        // Greens
        { bg: '#e8f5e9', text: '#2e7d32' }, // Light Green
        { bg: '#c8e6c9', text: '#1b5e20' }, // Green
        { bg: '#f1f8e9', text: '#558b2f' }, // Lime
        // Purples
        { bg: '#f3e5f5', text: '#7b1fa2' }, // Light Purple
        { bg: '#e1bee7', text: '#6a1b9a' }, // Purple
        { bg: '#ede7f6', text: '#4527a0' }, // Deep Purple
        // Warm colors
        { bg: '#fff3e0', text: '#e65100' }, // Orange
        { bg: '#ffe0b2', text: '#bf360c' }, // Deep Orange
        { bg: '#fff8e1', text: '#ff8f00' }, // Amber
        { bg: '#fffde7', text: '#f9a825' }, // Yellow
        // Reds & Pinks
        { bg: '#ffebee', text: '#c62828' }, // Red
        { bg: '#ffcdd2', text: '#b71c1c' }, // Deep Red
        { bg: '#fce4ec', text: '#880e4f' }, // Pink
        { bg: '#f8bbd9', text: '#ad1457' }, // Deep Pink
        // Teals & Cyans
        { bg: '#e0f2f1', text: '#00695c' }, // Teal
        { bg: '#b2dfdb', text: '#004d40' }, // Deep Teal
        { bg: '#e0f7fa', text: '#006064' }, // Cyan
        { bg: '#b2ebf2', text: '#00838f' }, // Deep Cyan
        // Indigos
        { bg: '#e8eaf6', text: '#283593' }, // Indigo
        { bg: '#c5cae9', text: '#1a237e' }, // Deep Indigo
        // Browns & Grays
        { bg: '#efebe9', text: '#4e342e' }, // Brown
        { bg: '#fafafa', text: '#424242' }, // Gray
        { bg: '#eceff1', text: '#37474f' }, // Blue Gray
        // Additional pastels
        { bg: '#f3e9ff', text: '#5e35b1' }, // Lavender
        { bg: '#e5f9ed', text: '#00897b' }, // Mint
        { bg: '#fff0f5', text: '#c2185b' }, // Rose
        { bg: '#f0f9ff', text: '#0288d1' }, // Ice Blue
        { bg: '#fef3e2', text: '#d84315' }, // Peach
        { bg: '#e8f8f5', text: '#00796b' }, // Seafoam
    ];

    // Simple hash function to convert text to a number
    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Apply colors to all interest tags based on their text content
    const interestTags = document.querySelectorAll('.interest-tag');
    interestTags.forEach(tag => {
        const text = tag.textContent.trim().toLowerCase();
        const colorIndex = hashString(text) % interestColors.length;
        const color = interestColors[colorIndex];
        tag.style.backgroundColor = color.bg;
        tag.style.color = color.text;
    });

    // Hero Image Slider
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 3000; // 3 seconds

        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, slideInterval);
    }

    // Modal logic
    const modalTrigger = document.getElementById('news-modal-trigger');
    const modal = document.getElementById('news-modal');
    const closeBtn = document.querySelector('.close-modal');

    if (modalTrigger && modal && closeBtn) {
        modalTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
