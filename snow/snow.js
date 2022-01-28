document.addEventListener("DOMContentLoaded", function(){
    function createSnow() {
        const el = document.createElement("div");
        el.classList.add('snow');
        el.style.marginLeft = Math.floor(Math.random() * window.innerWidth) + 'px';
        document.body.appendChild(el);
    }
    
    for (let i=0; i<300; i++) {
        createSnow();
    }
});