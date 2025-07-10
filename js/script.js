document.getElementById('staticCodigo').addEventListener('keydown', function (event) {
    const nombre = document.getElementById('staticNombre').value.trim();
    const codigo = document.getElementById('staticCodigo').value.trim();

    if (event.key === 'Enter') {
        if (!nombre || !codigo) {
            alert("⚠️ Por favor llena el nombre y el código de barras antes de agregar el producto.");
            return; // Detener ejecución si están vacíos
        }
        event.preventDefault(); // Evita que el formula
        // rio se envíe
        agregarProducto();      // Llama a tu función
        this.value = '';        // Limpia el input de código
        document.getElementById('staticCodigo').focus(); // Enfoca el campo nombre
    }
});

function agregarProducto() {
    const nombre = document.getElementById('staticNombre').value.trim();
    const codigo = document.getElementById('staticCodigo').value.trim();
    const rango1 = parseInt(document.getElementById('staticRangoUno').value);
    const rango2 = parseInt(document.getElementById('staticRangoDos').value);
    const decimalesManual = parseInt(document.getElementById('staticDecimales').value || "2");
    const usarDecimalesCodigo = document.getElementById('checkDecimalesCodigo').checked;

    const cantidad = 1;
    let kilos = "0.000";

    // 🚨 Validar que nombre y código no estén vacíos
    if (!nombre || !codigo) {
        alert("⚠️ Por favor llena el nombre y el código de barras antes de agregar el producto.");
        return; // Detener ejecución si están vacíos
    }

    if (usarDecimalesCodigo) {
        kilos = extraerKilosDesdeCodigo(codigo, rango1, rango2);
    } else {
        kilos = extraerKilosPorRango(codigo, rango1, rango2, decimalesManual);
    }

    const tabla = document.getElementById('tablaProductos');
    const fila = document.createElement('tr');

    fila.innerHTML = `
        <td>${nombre}</td>
        <td>${codigo}</td>
        <td>${cantidad}</td>
        <td>${kilos}</td>
        <td class="text-center">
            <i class="bi bi-trash-fill text-danger eliminar-fila" style="cursor:pointer;"></i>
        </td>
    `;

    tabla.appendChild(fila);
    actualizarTotales();
}

function extraerKilosPorRango(codigo, inicio, fin, decimales) {
    if (inicio >= 0 && fin > inicio && fin <= codigo.length) {
        const sub = codigo.substring(inicio, fin);
        const kilos = parseInt(sub, 10) / Math.pow(10, decimales);
        return kilos <= 100 ? kilos.toFixed(decimales) : "0.000";
    } else {
        return "0.000";
    }
}

function extraerKilosDesdeCodigo(codigo, inicio, fin) {
    if (inicio >= 0 && fin > inicio && fin <= codigo.length) {
        const sub = codigo.substring(inicio, fin);   // ej: "19022"
        const valor = parseInt(sub, 10);

        const decimales = parseInt(document.getElementById('staticDecimales').value || "2");
        if (isNaN(valor) || isNaN(decimales)) return "0.000";

        const kilos = valor / Math.pow(10, decimales);
        return kilos <= 100 ? kilos.toFixed(decimales) : "0.000";
    } else {
        return "0.000";
    }
}

function actualizarTotales() {
    const filas = document.querySelectorAll('#tablaProductos tr');
    let sumaCantidad = 0;
    let sumaKilos = 0;

    filas.forEach(fila => {
        const cantidad = parseInt(fila.children[2].textContent) || 0;
        const kilos = parseFloat(fila.children[3].textContent) || 0;
        sumaCantidad += cantidad;
        sumaKilos += kilos;
    });

    document.getElementById('totalCantidad').textContent = sumaCantidad;
    document.getElementById('totalKilos').textContent = sumaKilos.toFixed(3);
}
//Eliminar fila de la tabla
document.getElementById("tablaProductos").addEventListener("click", function (event) {
    if (event.target.classList.contains("eliminar-fila")) {
        const fila = event.target.closest("tr");
        fila.remove();
        actualizarTotales();
    }
});

//Eliminar todos los datos de la tabla
document.getElementById("btnEliminarTodo").addEventListener("click", function () {
    document.getElementById("tablaProductos").innerHTML = '';
    document.getElementById("totalCantidad").textContent = '0';
    document.getElementById("totalKilos").textContent = '0.000';
});

document.getElementById("btnGuardarDatos").addEventListener("click", function () {
    const filas = document.querySelectorAll("#tablaProductos tr");
    const datos = [];

    let datosValidos = true;

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll("td");
        if (celdas.length >= 4) {
            const nombre = celdas[0].textContent.trim();
            const cantidad = parseFloat(celdas[2].textContent.trim());
            const kilos = parseFloat(celdas[3].textContent.trim());

            // Validar campos vacíos o inválidos
            if (!nombre || isNaN(cantidad) || isNaN(kilos)) {
                datosValidos = false;
            }

            datos.push({ nombre, cantidad: cantidad || 0, kilos: kilos || 0 });
        }
    });

    if (!datosValidos) {
        alert("Error: Hay campos vacíos o inválidos en la tabla.");
        return;
    }

    const totalCantidad = parseFloat(document.getElementById("totalCantidad").textContent.trim()) || 0;
    const totalKilos = parseFloat(document.getElementById("totalKilos").textContent.trim()) || 0;

    const datosTotales = {
        productos: datos,
        totalCantidad,
        totalKilos
    };

    // Generar clave
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    const fechaHora = `${dia}-${mes}-${anio}_${horas}-${minutos}-${segundos}`;
    const clave = `tabla_${fechaHora}`;

    // Confirmar antes de guardar
    if (confirm("¿Deseas guardar la tabla con el ID: " + clave + "?")) {
        localStorage.setItem(clave, JSON.stringify(datosTotales));
        alert("✅ Tabla guardada con ID: " + clave);
    } else {
        alert("❌ Operación cancelada");
    }
});