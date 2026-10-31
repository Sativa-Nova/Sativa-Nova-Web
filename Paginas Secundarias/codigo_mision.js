document.addEventListener("DOMContentLoaded", () => {
    const tarjetaMision = document.getElementById("tarjeta-mision");

    // Crea un efecto de linterna/resplandor verde que sigue tu ratón dentro de la tarjeta
    tarjetaMision.addEventListener("mousemove", (e) => {
        const rect = tarjetaMision.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        tarjetaMision.style.setProperty("--x", `${x}px`);
        tarjetaMision.style.setProperty("--y", `${y}px`);
    });
});