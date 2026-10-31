document.addEventListener("DOMContentLoaded", () => {

    /* =======================================================
       1. EFECTO TRANSICIÓN TÍTULOS (BARRA SUPERIOR)
       ======================================================= */
    const frases = ["Frescura duradera", "Hidroponía avanzada", "Sostenibilidad pura"];
    let indiceFrase = 0;
    const textoTopBar = document.getElementById("top-bar-text");

    setInterval(() => {
        if (document.hidden) return;
        textoTopBar.classList.add("oculto");
        setTimeout(() => {
            indiceFrase = (indiceFrase + 1) % frases.length;
            textoTopBar.textContent = frases[indiceFrase];
            textoTopBar.classList.remove("oculto");
        }, 500); 
    }, 4500); 


    /* =======================================================
       2. MENÚ FIJO (STICKY NAV) Y PROGRESO DE LECTURA
       ======================================================= */
    const header = document.getElementById("main-header");
    const topBar = document.getElementById("top-bar");
    
    // Espaciador para evitar saltos bruscos
    const espaciador = document.createElement("div");
    espaciador.className = "header-spacer";
    header.after(espaciador);

    let esperandoFrame = false;

    function actualizarScroll() {
        const scrollPosition = window.scrollY;
        const debeFijarse = scrollPosition > topBar.offsetHeight;

        if (debeFijarse !== header.classList.contains("sticky")) {
            espaciador.style.height = debeFijarse ? header.offsetHeight + "px" : "0px";
            header.classList.toggle("sticky", debeFijarse);
        }

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progreso = maxScroll > 0 ? Math.min(scrollPosition / maxScroll, 1) : 0;
        header.style.setProperty("--progreso", progreso.toFixed(4));
        esperandoFrame = false;
    }

    window.addEventListener("scroll", () => {
        if (!esperandoFrame) {
            esperandoFrame = true;
            requestAnimationFrame(actualizarScroll);
        }
    }, { passive: true });
    
    actualizarScroll();

    /* =======================================================
       3. EFECTO BOTÓN DE CONTACTO (MAGNÉTICO)
       ======================================================= */
    const btnContacto = document.getElementById("btn-contacto");
    
    // Detectamos si es PC para aplicar el imán
    if (window.matchMedia("(hover: hover)").matches) {
        btnContacto.addEventListener("mousemove", (e) => {
            const botonPos = btnContacto.getBoundingClientRect();
            const x = e.clientX - botonPos.left - botonPos.width / 2;
            const y = e.clientY - botonPos.top - botonPos.height / 2;
            
            // Movimiento muy suave
            btnContacto.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px) scale(1.05)`;
        });

        btnContacto.addEventListener("mouseleave", () => {
            btnContacto.style.transform = "translate(0px, 0px) scale(1)";
        });
    }

    /* =======================================================
       4. MENÚ HAMBURGUESA PARA VERSIÓN MÓVIL
       ======================================================= */
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navMenu = document.getElementById("nav-menu");
    const navOverlay = document.getElementById("nav-overlay");
    const navLinks = document.querySelectorAll('.nav-link');

    function alternarMenu(abrir = !navMenu.classList.contains("activo")) {
        hamburgerBtn.classList.toggle("activo", abrir);
        navMenu.classList.toggle("activo", abrir);
        navOverlay.classList.toggle("activo", abrir);
        document.body.classList.toggle("menu-abierto", abrir);
    }

    hamburgerBtn.addEventListener("click", () => alternarMenu());
    navOverlay.addEventListener("click", () => alternarMenu(false));
    
    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => alternarMenu(false));
    });

    /* =======================================================
       5. CARRUSEL DE IMÁGENES PREMIUM (CON TOUCH SWIPE)
       ======================================================= */
    const track = document.getElementById('slider-track');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const dotsNav = document.querySelector('.slider-dots');
    const dots = Array.from(dotsNav.children);
    
    let currentIndex = 0;
    let intervaloAuto;

    const moverCarrusel = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        slides.forEach(slide => slide.classList.remove('activo'));
        slides[index].classList.add('activo');
        dots.forEach(dot => dot.classList.remove('activo'));
        dots[index].classList.add('activo');
    };

    const siguienteSlide = () => {
        currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
        moverCarrusel(currentIndex);
    };

    const anteriorSlide = () => {
        currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
        moverCarrusel(currentIndex);
    };

    nextBtn.addEventListener('click', () => { siguienteSlide(); reiniciarAutoplay(); });
    prevBtn.addEventListener('click', () => { anteriorSlide(); reiniciarAutoplay(); });

    dotsNav.addEventListener('click', (e) => {
        const targetDot = e.target.closest('.dot');
        if (!targetDot) return;
        currentIndex = dots.findIndex(dot => dot === targetDot);
        moverCarrusel(currentIndex);
        reiniciarAutoplay();
    });

    const arrancarAutoplay = () => { intervaloAuto = setInterval(siguienteSlide, 6500); };
    const reiniciarAutoplay = () => { clearInterval(intervaloAuto); arrancarAutoplay(); };
    arrancarAutoplay();

    /* Gestos Táctiles (Swipe) para Celulares */
    let inicioX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
        inicioX = e.touches[0].clientX;
        isDragging = true;
        clearInterval(intervaloAuto); 
    }, {passive: true});

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const actualX = e.touches[0].clientX;
        const diferencia = inicioX - actualX;
        
        if (diferencia > 40) { 
            siguienteSlide();
            isDragging = false; 
        } else if (diferencia < -40) { 
            anteriorSlide();
            isDragging = false; 
        }
    }, {passive: true});

    track.addEventListener('touchend', () => {
        isDragging = false;
        reiniciarAutoplay();
    });
});