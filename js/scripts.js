// Variables globales.
let IVA;
let historialFacturas = []; // Acá guardaremos todas las facturas generadas.

// ------------------ CLASES ------------------- //

// ------------------ ELEMENTOS DEL DOM ------------------- //

const formFactura = document.getElementById("form-factura");
const mensajeFactura = document.getElementById("mensajeFactura");
const formCambioIVA = document.getElementById("form-iva");
const productosContainer = document.getElementById("productos-container");
const agregarProductoBtn = document.getElementById("agregarProductoBtn");
const historialDiv = document.getElementById('historialFacturas');

// ------------------ FUNCIONES ------------------- //

function getCliente() {
    const nombreCliente = document.getElementById("nombreCliente").value.trim();
    const numeroIdentificacion = document.getElementById("numeroIdentificacion").value;

    if (!nombreCliente || !numeroIdentificacion) {
        mostrarMensajeFactura("Por favor verifique los datos ingresados del cliente.", "error");
        return null;
    }

    return { nombre: nombreCliente, numeroIdentificacion: numeroIdentificacion }; // Devolvemos un objeto cliente.
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

        <button type="button" class="btn-eliminar-prod">🗑️</button>
        <hr>
    `;

    productosContainer.appendChild(div);

    const btnEliminar = div.querySelector(".btn-eliminar-prod");

    // Agregamos un evento para eliminar el div por colpeto
    btnEliminar.addEventListener("click", () => {
        div.remove();
    });
}

// Función para leer los productos cargados desde el DOM.
function leerProductos() {
    const productosFactura = productosContainer.querySelectorAll(".producto-item");
    let productosLeidos = [];

    for (let producto of productosFactura) {
        const nombre = producto.querySelector("input[name='nombreProducto']").value.trim(); // Buscamos un input que tenga como name nombreProducto.
        const cantidad = parseInt(producto.querySelector("input[name='cantidadProducto']").value);
        const precio = parseFloat(producto.querySelector("input[name='precioProducto']").value);

        if (!nombre || isNaN(cantidad) || isNaN(precio)) {
            mostrarMensajeFactura("Datos inválidos en uno de los productos.", "error");
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

// Función para mostrar logs de factura (Puede ser éxito o error).
function mostrarMensajeFactura(texto, tipo = "exito") {
    const mensajeFactura = document.getElementById("mensajeFactura");

    mensajeFactura.textContent = texto;
    mensajeFactura.className = `mensaje-factura ${tipo}`; // Ajustamos la clase según el tipo, esto nos permite jugar con los estilos.
    mensajeFactura.style.display = "block";

    // Ocultamos el mensaje luego de 2 segundos.
    setTimeout(() => {
        mensajeFactura.style.display = "none";
    }, 2000);
}


// Función que se encargar de mostrar el historial de facturas (Se llama a esta función desde cargarHistorial, factura a factura)
function mostrarResumen(factura, index) {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("factura-card");

    const titulo = document.createElement("h3");
    titulo.textContent = `Factura para: ${factura.cliente.nombre}`;
    tarjeta.appendChild(titulo);

    const fecha = document.createElement("p");
    fecha.textContent = `Fecha de emisión: ${new Date(factura.fechaEmision).toLocaleString()}`;
    tarjeta.appendChild(fecha);

    const lista = document.createElement("ul");
    factura.productos.forEach((prod, index) => {
        const item = document.createElement("li");

        item.textContent = `${index + 1}. ${prod.nombre} - ${prod.cantidad} x $${prod.precio.toFixed(2)}`; // Vamos armando un listado de todos los productos involucrados en la factura.
        lista.appendChild(item);
    });
    tarjeta.appendChild(lista);

    const subtotal = document.createElement("p");
    subtotal.textContent = `Subtotal: $${factura.totales.subtotal.toFixed(2)}`;
    tarjeta.appendChild(subtotal);

    const iva = document.createElement("p");
    iva.textContent = `IVA (${(factura.ivaAplicado * 100).toFixed(1)}%): $${factura.totales.ivaTotal.toFixed(2)}`;
    tarjeta.appendChild(iva);

    const total = document.createElement("p");
    total.innerHTML = `<strong>Total: $${factura.totales.total.toFixed(2)}</strong>`;
    tarjeta.appendChild(total);

    // Agregamos un botón para eliminar la factura del historial.
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("btn-eliminar-factura");

    eventoBotonEliminarFactura(btnEliminar, historialDiv, index); // Esta función se encarga de cargar el evento que dispara la eliminación.
    
    tarjeta.appendChild(btnEliminar);

    historialDiv.appendChild(tarjeta); // Colocamos una tarjeta debajo de la otra
}

function cargarHistorial() {
    historialDiv.innerHTML = "";
    const historial = localStorage.getItem("historialFacturas");

    if (historial) {
        historialFacturas = JSON.parse(historial);

        // Mostramos cada factura en pantalla
        historialFacturas.forEach((factura, index) => {
            mostrarResumen(factura, index);
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

    mensajeFactura.style.display = "none"; // Ocultamos el mensaje anterior, si es que había.

    if (typeof IVA !== "number" || isNaN(IVA)) {
        mostrarMensajeFactura("Error: El valor del IVA no está definido o es inválido.", "error");

        return null;
    }

    const cliente = getCliente();
    if (!cliente) return; // Si no hay cliente, cortamos la ejecución de la función.

    const productosFactura = leerProductos();
    if (!productosFactura || productosFactura.length === 0) {
        mostrarMensajeFactura("Debe agregar al menos un producto válido.", "error");
        return;
    }

    const totalesFactura = calcularTotales(productosFactura);
    const factura = crearFactura(cliente, productosFactura, totalesFactura);

    mostrarMensajeFactura("Factura generada correctamente.", "exito");

    cargarHistorial();

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

function eventoBotonEliminarFactura(boton, historialDiv, index) {
    boton.addEventListener("click", () => {
        historialFacturas.splice(index, 1); // Eliminamos la factura del array.

        localStorage.setItem("historialFacturas", JSON.stringify(historialFacturas)); // Sobreescribimos el item en el localStorage.
        historialDiv.innerHTML = ""; // Limpiamos el DIV.

        cargarHistorial(); // Volvemos a cargar el historial
    });
}

// ------------------ APP ------------------- //

cargarIVA();
cargarHistorial();
