document.addEventListener("DOMContentLoaded", () => {
    const tarjeta = document.getElementById("tarjeta-3d");

    // Efecto 3D profesional al mover el ratón
    document.addEventListener("mousemove", (e) => {
        let xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        let yAxis = (window.innerHeight / 2 - e.pageY) / 30;
        tarjeta.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    document.addEventListener("mouseleave", () => {
        tarjeta.style.transition = "all 0.6s ease";
        tarjeta.style.transform = `rotateY(0deg) rotateX(0deg)`;
    });

    tarjeta.addEventListener("mouseenter", () => {
        tarjeta.style.transition = "none";
    });
});