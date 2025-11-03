document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carouselImages");
  const totalSlides = carousel.children.length;
  let currentSlide = 0;

  function updateSlide() {
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide();
  }

  setInterval(nextSlide, 5000);

  // supaya tombol di HTML tetap bisa jalan:
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;
});

document.addEventListener('DOMContentLoaded', () => {
  const ticker = document.querySelector('.ticker');
  
  // Gandakan konten ticker biar looping-nya halus
  ticker.innerHTML += ticker.innerHTML;

  let translateX = 0;
  const speed = 1.5; // ubah sesuai selera (semakin besar = makin cepat)

  function animate() {
    translateX -= speed;
    if (Math.abs(translateX) >= ticker.scrollWidth / 2) {
      translateX = 0; // reset posisi supaya gak “teleport”
    }
    ticker.style.transform = `translateX(${translateX}px)`;
    requestAnimationFrame(animate);
  }

  animate();
});

const ticker = document.querySelector('.ticker');
let cards = document.querySelectorAll('.card');

// Gandakan isi ticker supaya bisa berjalan terus tanpa jeda
ticker.innerHTML += ticker.innerHTML;

// Variabel posisi dan kecepatan
let position = 0;
const speed = 1; // semakin besar = semakin cepat

function moveCards() {
  position -= speed;
  // reset posisi saat sudah melewati setengah panjang isi
  if (Math.abs(position) >= ticker.scrollWidth / 2) {
    position = 0;
  }
  ticker.style.transform = `translateX(${position}px)`;
  requestAnimationFrame(moveCards);
}

moveCards();

// === Efek saat kartu ditekan (pause animasi + perbesar) ===
let isHolding = false;

ticker.addEventListener("mousedown", (e) => {
  if (e.target.closest(".card")) {
    isHolding = true;
    ticker.style.transition = "transform 0.2s ease";
  }
});

document.addEventListener("mouseup", () => {
  isHolding = false;
  ticker.style.transition = "";
});

function loop() {
  if (!isHolding) {
    position -= speed;
    if (Math.abs(position) >= ticker.scrollWidth / 2) {
      position = 0;
    }
    ticker.style.transform = `translateX(${position}px)`;
  }
  requestAnimationFrame(loop);
}

loop();

const gambar = document.getElementById("logoOsis2");
const stopObj = document.getElementById("boxJudul");
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const stopY = stopObj.getBoundingClientRect().top + window.scrollY;

    const maxTop = stopY - gambar.offsetHeight - 20; // 20px jarak aman

    // Ubah posisi gambar, tapi jangan lewat dari maxTop
    gambar.style.top = `${Math.min(scrollY + 100, maxTop)}px`;
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("ukuranNormal");
        }
    });
});
const targets = [
    document.getElementById("judul"),
    document.getElementById("penjelasanOsis"),
    document.getElementById("carousel-container"),
    document.getElementById("bg3Box4"),
    document.getElementById("bg3Box5"),
    document.getElementById("bg3Box41"),
    document.getElementById("bg3Box51"),
    document.getElementById("bg3Box52"),
    document.getElementById("bg3Box53"),
    document.getElementById("blogSekretaris"),
    document.getElementById("blogBendahara"),
    document.getElementById("blogKeagamaan"),
    document.getElementById("blogPendidikan"),
    document.getElementById("blogFundraising"),
    document.getElementById("blogHumas"),
    document.getElementById("blogITPD"),
    document.getElementById("blogK3"),
    document.getElementById("blogCard")
];
targets.forEach(el => observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener("click", function(e) {
    const targetId = this.getAttribute("href").substring(1);
    const targetEl = document.getElementById(targetId);

    if (targetEl) {
    e.preventDefault(); // Hindari scroll default dan hash
    targetEl.scrollIntoView({ behavior: "smooth" });

    // Opsional: hapus hash dari URL
    history.replaceState(null, null, " ");
    }
});
});

function updateSectionHeight() {
    const box = document.querySelector('.bg3Box1');
    const section = document.querySelector('#bg3');

    if (box && section) {
      const tinggiBox = box.offsetHeight;
      const tinggiFinal = tinggiBox * 1.2;  //➕ 20%
      section.style.height = `${tinggiFinal}px`;
    }
}

window.addEventListener('load', updateSectionHeight);
window.addEventListener('resize', updateSectionHeight);

