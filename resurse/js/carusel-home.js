const slides = document.querySelectorAll('.carousel-slide');
let current = 0;

function updateCarousel() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev', 'next');
    });

    const prev = (current - 1 + slides.length) % slides.length;
    const next = (current + 1) % slides.length;

    slides[prev].classList.add('prev');
    slides[current].classList.add('active');
    slides[next].classList.add('next');
}

document.querySelector('.carousel-btn.prev').addEventListener('click', function () {
    current = (current - 1 + slides.length) % slides.length;
    updateCarousel();
});

document.querySelector('.carousel-btn.next').addEventListener('click', function () {
    current = (current + 1) % slides.length;
    updateCarousel();
});

updateCarousel();
