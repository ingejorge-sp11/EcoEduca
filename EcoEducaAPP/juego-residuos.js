const residuos = document.querySelectorAll('.residuo');
const contenedores = document.querySelectorAll('.contenedor');
const mensaje = document.getElementById('mensaje');

residuos.forEach(residuo => {
    residuo.addEventListener('dragstart', e => {
        e.dataTransfer.setData('tipo', residuo.dataset.tipo);
        e.dataTransfer.setData('nombre', residuo.textContent);
    });
});

contenedores.forEach(contenedor => {
    contenedor.addEventListener('dragover', e => e.preventDefault());
    contenedor.addEventListener('drop', e => {
        e.preventDefault();
        const tipo = e.dataTransfer.getData('tipo');
        const nombre = e.dataTransfer.getData('nombre');
        if (tipo === contenedor.dataset.tipo) {
            contenedor.textContent = `Correcto: ${nombre}`;
            mensaje.textContent = '¡Correcto!';
            mensaje.style.color = 'green';
        } else {
            mensaje.textContent = '¡Intenta de nuevo!';
            mensaje.style.color = 'red';
        }
    });
});
