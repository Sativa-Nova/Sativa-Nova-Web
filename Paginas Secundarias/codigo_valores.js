document.addEventListener("DOMContentLoaded", () => {
    const tarjetas = document.querySelectorAll(".card-valor");
    
    // Aparecen una por una en cascada al cargar la página
    tarjetas.forEach((tarjeta, index) => {
        setTimeout(() => {
            tarjeta.style.transition = "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
            tarjeta.style.opacity = "1";
            tarjeta.style.transform = "translateY(0)";
        }, 200 * index); // El multiplicador (200) hace que salgan una detrás de otra
    });
});