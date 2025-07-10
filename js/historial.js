window.addEventListener("DOMContentLoaded", function () {
    cargarHistorial();
});
function cargarHistorial() {
    const tbody = document.getElementById("historialProductos");
    tbody.innerHTML = '';

    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave.startsWith("tabla_")) {
            const { totalCantidad, totalKilos } = JSON.parse(localStorage.getItem(clave));

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${clave}</td>
                <td>${totalCantidad}</td>
                <td>${totalKilos.toFixed(3)}</td>
                <td>
                    <button class="btn btn-info btn-sm mostrar" data-id="${clave}">Mostrar</button>
                    <button class="btn btn-secondary btn-sm imprimir" data-id="${clave}">Imprimir</button>
                    <button class="btn btn-danger btn-sm eliminar" data-id="${clave}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(fila);
        }
    }
}
document.getElementById("historialProductos").addEventListener("click", function (event) {
    const id = event.target.getAttribute("data-id");
    if (!id) return;

    const datos = JSON.parse(localStorage.getItem(id));
    if (!datos) return;

    if (event.target.classList.contains("mostrar")) {
        const contenedor = document.getElementById("detalleGuardado");

        if (contenedor.style.display === "block" && contenedor.getAttribute("data-id") === id) {
            contenedor.style.display = "none";
            contenedor.removeAttribute("data-id");
        } else {
            mostrarDetalle(id, datos);
        }

    } else if (event.target.classList.contains("imprimir")) {
        imprimirDetallePDF(id, datos);

    } else if (event.target.classList.contains("eliminar")) {
        if (confirm("¿Estás seguro de eliminar este historial?")) {
            localStorage.removeItem(id);
            cargarHistorial();
        }
    }
});
function mostrarDetalle(id, datos) {
    const detalle = document.getElementById("detalleTabla");
    const contenedor = document.getElementById("detalleGuardado");
    detalle.innerHTML = '';
    contenedor.style.display = 'block';
    contenedor.setAttribute("data-id", id);

    datos.productos.forEach((prod, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><input type="text" class="form-control" value="${prod.nombre}"></td>
            <td><input type="number" class="form-control" value="${prod.cantidad}"></td>
            <td><input type="number" class="form-control" step="0.001" value="${prod.kilos}"></td>
            <td><button class="btn btn-danger btn-sm eliminar-producto">🗑️</button></td>
        `;
        fila.setAttribute("data-index", index);
        detalle.appendChild(fila);
    });
}
document.getElementById("guardarCambios").addEventListener("click", function () {
    const contenedor = document.getElementById("detalleGuardado");
    const id = contenedor.getAttribute("data-id");
    const filas = document.querySelectorAll("#detalleTabla tr");

    const productos = [];
    let totalCantidad = 0;
    let totalKilos = 0;

    filas.forEach(fila => {
        const nombre = fila.children[0].querySelector("input").value.trim();
        const cantidad = parseFloat(fila.children[1].querySelector("input").value.trim()) || 0;
        const kilos = parseFloat(fila.children[2].querySelector("input").value.trim()) || 0;

        productos.push({ nombre, cantidad, kilos });
        totalCantidad += cantidad;
        totalKilos += kilos;
    });

    const nuevo = {
        productos,
        totalCantidad,
        totalKilos
    };

    localStorage.setItem(id, JSON.stringify(nuevo));
    alert("Cambios guardados");
    cargarHistorial();
});
document.getElementById("detalleTabla").addEventListener("click", function (event) {
    if (event.target.classList.contains("eliminar-producto")) {
        event.target.closest("tr").remove();
    }
});

function imprimirDetallePDF(clave, datos) {
    const maxPorColumna = 15;
    const kilos = datos.productos.map(p => p.kilos);
    const filasKilos = [];

    const numColumnas = Math.ceil(kilos.length / maxPorColumna);

    for (let i = 0; i < maxPorColumna; i++) {
        let fila = [];
        for (let j = 0; j < numColumnas; j++) {
            const index = j * maxPorColumna + i;
            fila.push(kilos[index] !== undefined ? kilos[index].toFixed(3) : "");
        }
        filasKilos.push(fila);
    }

    let html = `
        <h2>Detalle de kilos: ${clave}</h2>
       
        <table border="1" style="border-collapse: collapse; width: 100%; margin-bottom: 10px; text-align: center;">
            <tbody>
    `;

    filasKilos.forEach(fila => {
        html += "<tr>";
        fila.forEach(kilo => {
            html += `<td style="padding: 4px;">${kilo}</td>`;
        });
        html += "</tr>";
    });

    html += `
            </tbody>
        </table>
        <p><strong>Total Cantidad:</strong> ${datos.totalCantidad}</p>
        <p><strong>Total Kilos:</strong> ${datos.totalKilos.toFixed(3)}</p>
    `;

    const contenedor = document.createElement("div");
    contenedor.style.padding = "10px";
    contenedor.innerHTML = html;
    document.body.appendChild(contenedor);

    html2pdf().from(contenedor).set({
        margin: 10,
        filename: `${clave}_solo_kilos.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4' }
    }).save().then(() => {
        document.body.removeChild(contenedor);
    });
}
