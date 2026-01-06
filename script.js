document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
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
