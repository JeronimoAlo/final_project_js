// Variables globales.
let IVA;
let historialFacturas = []; // Acá guardaremos todas las facturas generadas.

// ------------------ ELEMENTOS DEL DOM ------------------- //

const formFactura = document.getElementById("form-factura");
const formCambioIVA = document.getElementById("form-iva");
const productosContainer = document.getElementById("productos-container");
const agregarProductoBtn = document.getElementById("agregarProductoBtn");


// ------------------ FUNCIONES ------------------- //

function getCliente() {
    const nombreCliente = document.getElementById("nombreCliente").value.trim();

    if (!nombreCliente) {
        alert("El nombre del cliente no puede estar vacío.");
        return null;
    }

    return { nombre: nombreCliente }; // Devolvemos un objeto cliente.
}

function agregarProducto() {
    const div = document.createElement("div");

    div.classList.add("producto-item");
    div.innerHTML = `
        <label>Nombre del producto:</label>
        <input type="text" name="nombreProducto" required>

        <label>Cantidad:</label>
        <input type="number" name="cantidadProducto" min="1" required>

        <label>Precio unitario (S/IVA):</label>
        <input type="number" name="precioProducto" min="0" step="0.01" required>

        <hr>
    `;

    productosContainer.appendChild(div);
}

// Función para leer los productos cargados desde el DOM
function leerProductos() {
    const items = productosContainer.querySelectorAll(".producto-item");
    let productosLeidos = [];

    for (let item of items) {
        const nombre = item.querySelector("input[name='nombreProducto']").value.trim();
        const cantidad = parseInt(item.querySelector("input[name='cantidadProducto']").value);
        const precio = parseFloat(item.querySelector("input[name='precioProducto']").value);

        if (!nombre || isNaN(cantidad) || isNaN(precio)) {
            alert("Datos inválidos en uno de los productos.");
            return null;
        }

        productosLeidos.push({ nombre, cantidad, precio });
    }

    return productosLeidos;
}

// Función para calcular el total con IVA para la factura en cuestión.
function calcularTotales(productos) {
    let subtotal = 0;

    for (let prod of productos) {
        subtotal += prod.precio * prod.cantidad;
    }

    let ivaTotal = subtotal * IVA;
    let total = subtotal + ivaTotal;

    return { subtotal, ivaTotal, total }; // Retornamos un objeto con los totales calculados.
}

function crearFactura(cliente, productos, totales) {
    // Creamos un objeto factura con los datos del cliente, productos y totales.
    const factura = {
        cliente: cliente,
        productos: productos,
        totales: totales,
        ivaAplicado: IVA,
        fechaEmision: new Date()
    };

    historialFacturas.push(factura); // Agregamos la factura al historial de facturas generadas.

    // Actualizamos el localStorage
    localStorage.setItem("historialFacturas", JSON.stringify(historialFacturas));

    return factura; // Retornamos el objeto factura creado.
}


function mostrarResumen(factura) {
    const historialDiv = document.getElementById('historialFacturas');

    let resumen = `Factura para: ${factura.cliente.nombre}\n\nProductos cargados:\n`; // Variable para almacenar el resumen de la factura.

    factura.productos.forEach((prod, index) => { // Iteramos sobre los productos para mostrar sus detalles.
        resumen += `${index + 1}. ${prod.nombre} - ${prod.cantidad} x $${prod.precio}\n`;
    });

    resumen += `\nSubtotal: $${factura.totales.subtotal.toFixed(2)}`; // Agregamos el subtotal al resumen.
    resumen += `\nIVA (${(IVA * 100).toFixed(1)}%): $${factura.totales.ivaTotal.toFixed(2)}`; // Agregamos el IVA al resumen.
    resumen += `\nTotal: $${factura.totales.total.toFixed(2)}`; // Agregamos el total al resumen.

    // Guardamos el resumen dentro del objeto factura
    factura.resumenTexto = resumen;

    // Mostramos el resumen en el historial (debajo del formulario)
    const resumenElem = document.createElement('pre');
    resumenElem.textContent = resumen;
    historialDiv.appendChild(resumenElem);
}

function cargarHistorial() {
    const historial = localStorage.getItem("historialFacturas");

    if (historial) {
        historialFacturas = JSON.parse(historial);

        // Mostramos cada factura en pantalla
        historialFacturas.forEach(factura => {
            mostrarResumen(factura);
        });
    }
}

function cargarIVA() {
    const ivaGuardado = localStorage.getItem("valorIVA");

    if (ivaGuardado !== null) {
        IVA = parseFloat(ivaGuardado);
    }
}

// ------------------ EVENTOS ------------------- //

agregarProductoBtn.addEventListener("click", agregarProducto);

formFactura.addEventListener("submit", function (elem) {
    elem.preventDefault();

    if (typeof IVA !== "number" || isNaN(IVA)) {
        alert("Error: El valor del IVA no está definido o es inválido.");
        
        return null;
    }

    const cliente = getCliente();
    if (!cliente) return;

    const productosFactura = leerProductos();
    if (!productosFactura || productosFactura.length === 0) {
        alert("Debe agregar al menos un producto válido.");
        return;
    }

    const totalesFactura = calcularTotales(productosFactura);
    const factura = crearFactura(cliente, productosFactura, totalesFactura);

    mostrarResumen(factura);

    formFactura.reset();
    productosContainer.innerHTML = "";
});

formCambioIVA.addEventListener("submit", function (elem) {
    elem.preventDefault();

    const nuevoIVA = parseFloat(document.getElementById("nuevoIVA").value);
    const mensajeCambioIVA = document.getElementById("mensajeIVA");

    mensajeCambioIVA.style.display = "block";

    if (!isNaN(nuevoIVA) && nuevoIVA >= 0 && nuevoIVA <= 100) {
        IVA = nuevoIVA / 100; // Lo convertimos a decimal.

        // Actualizamos el localStorage
        localStorage.setItem("valorIVA", JSON.stringify(IVA));

        mensajeCambioIVA.textContent = `El IVA ha sido actualizado a ${nuevoIVA}%.`;
        mensajeCambioIVA.className = "mensaje-iva exito";
    } else {
        mensajeCambioIVA.textContent = "Valor inválido. Ingrese un número entre 0 y 100.";
        mensajeCambioIVA.className = "mensaje-iva error";
    }

    // Ocultamos el mensaje luego de 2 segundos.
    setTimeout(() => {
        mensajeCambioIVA.style.display = "none";
    }, 2000);
})

// ------------------ APP ------------------- //

cargarIVA();
cargarHistorial();
