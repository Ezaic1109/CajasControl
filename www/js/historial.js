window.addEventListener("DOMContentLoaded", function () {
    cargarHistorial();
});

function cargarHistorial() {
    const tbody = document.getElementById("historialProductos");
    tbody.innerHTML = '';

    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);

        try {
            const datos = JSON.parse(localStorage.getItem(clave));
            if (!datos || !datos.productos || !Array.isArray(datos.productos)) continue;

            const { totalCantidad, totalKilos } = datos;

            // Separar nombre y fecha desde la clave
            const partes = clave.split("_");
            const nombreProducto = partes.slice(0, -2).join("_").replace(/_/g, " ");
            const fechaHora = partes.slice(-2).join(" ").replace(/-/g, ":");

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${nombreProducto} ${fechaHora}</td>
                <td>${totalCantidad}</td>
                <td>${totalKilos.toFixed(3)}</td>
                <td>
                    <button class="btn btn-info btn-sm mostrar" data-id="${clave}">Mostrar</button>
                    <button class="btn btn-secondary btn-sm imprimir" data-id="${clave}">Imprimir</button>
                    <button class="btn btn-danger btn-sm eliminar" data-id="${clave}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(fila);
        } catch (e) {
            continue; // Ignora claves que no son JSON válidos
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
/*
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

    // Obtener nombre del primer producto
    const nombreProducto = datos.productos[0]?.nombre?.replace(/\s+/g, "_") || "producto";

    // Obtener fecha y hora actual
    const fecha = new Date();
    const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
        .toString().padStart(2, '0')}-${fecha.getDate()
        .toString().padStart(2, '0')}_${fecha.getHours()
        .toString().padStart(2, '0')}-${fecha.getMinutes()
        .toString().padStart(2, '0')}-${fecha.getSeconds()
        .toString().padStart(2, '0')}`;

    const nombreArchivo = `${nombreProducto}_${fechaStr}.pdf`;

    let html = `
        <h2>Detalle de kilos</h2>
        <p><strong>Producto principal:</strong> ${datos.productos[0]?.nombre || "Sin nombre"}</p>
        <p><strong>Fecha:</strong> ${fechaStr.replace(/_/g, ' ')}</p>

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
        filename: nombreArchivo,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4' }
    }).save().then(() => {
        document.body.removeChild(contenedor);
    });
}
*/
function imprimirDetallePDF(clave, datos) {
    const maxPorColumna = 25;
    const kilos = datos.productos.map(p => parseFloat(p.kilos).toFixed(3));
    const columnas = [];

    // Construir columnas con 15 datos cada una
    for (let i = 0; i < kilos.length; i += maxPorColumna) {
        columnas.push(kilos.slice(i, i + maxPorColumna));
    }

    // Ajusta columnas por página según lo que consideres que cabe en vertical (ej: 2 o 3)
    const columnasPorPagina = 8;
    const paginas = Math.ceil(columnas.length / columnasPorPagina);

    const nombreProducto = datos.productos[0]?.nombre?.replace(/\s+/g, "_") || "producto";
    const fecha = new Date();
    const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}_${fecha.getHours().toString().padStart(2, '0')}-${fecha.getMinutes().toString().padStart(2, '0')}-${fecha.getSeconds().toString().padStart(2, '0')}`;
    const nombreArchivo = `${nombreProducto}_${fechaStr}.pdf`;

    let html = `
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .pagina {
                page-break-after: always;
                padding: 10px;
            }
            .ultima {
                page-break-after: auto;
                padding: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
                text-align: center;
            }
            td {
                padding: 4px;
                /* Sin bordes */
            }
            h2, p {
                margin: 5px 0;
            }
        </style>
    `;

    for (let p = 0; p < paginas; p++) {
        const inicioCol = p * columnasPorPagina;
        const finCol = inicioCol + columnasPorPagina;
        const colsPagina = columnas.slice(inicioCol, finCol);
        const esUltima = p === paginas - 1;

        html += `<div class="${esUltima ? 'ultima' : 'pagina'}">`;

        if (p === 0) {
            html += `
                <h2>Detalle de kilos</h2>
                <p><strong>Producto principal:</strong> ${datos.productos[0]?.nombre || "Sin nombre"}</p>
                <p><strong>Fecha:</strong> ${fechaStr.replace(/_/g, ' ')}</p>
            `;
        }

        html += "<table><tbody>";

        // Filas (máximo 15 por columna)
        for (let fila = 0; fila < maxPorColumna; fila++) {
            html += "<tr>";
            for (let col = 0; col < colsPagina.length; col++) {
                html += `<td>${colsPagina[col][fila] !== undefined ? colsPagina[col][fila] : ""}</td>`;
            }
            html += "</tr>";
        }

        html += "</tbody></table>";

        if (esUltima) {
            html += `
                <p><strong>Total Cantidad:</strong> ${datos.totalCantidad}</p>
                <p><strong>Total Kilos:</strong> ${datos.totalKilos.toFixed(3)}</p>
            `;
        }

        html += "</div>";
    }

    const contenedor = document.createElement("div");
    contenedor.innerHTML = html;
    document.body.appendChild(contenedor);

    html2pdf().from(contenedor).set({
        margin: 10,
        filename: nombreArchivo,
        html2canvas: { scale: 2 },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait' // Aquí explicitamos vertical
        },
        pagebreak: { mode: ['css', 'legacy'] }
    }).save().then(() => {
        document.body.removeChild(contenedor);
    });
}