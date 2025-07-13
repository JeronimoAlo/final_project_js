// ------------------ CLASES ------------------- //

class Factura {
    constructor(cliente, productos, ivaAplicado) {
        this.cliente = cliente;
        this.productos = productos;
        this.ivaAplicado = ivaAplicado;
        this.fechaEmision = new Date();
    }

    calcularSubtotal() {
        return this.productos.reduce((acumulador, prod) => acumulador + prod.calcularSubtotal(), 0);
    }

    calcularIVA() {
        return this.calcularSubtotal() * this.ivaAplicado;
    }

    calcularTotal() {
        return this.calcularSubtotal() + this.calcularIVA();
    }

    getTotales() {
        return {
            subtotal: this.calcularSubtotal(),
            ivaTotal: this.calcularIVA(),
            total: this.calcularTotal()
        };
    }
}

class Producto {
    constructor(nombre, cantidad, precio) {
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.precio = precio;
    }

    calcularSubtotal() {
        return this.cantidad * this.precio;
    }
}

class HistorialFacturas {
    constructor() {
        this.facturas = this.cargar();
    }

    agregarFactura(factura) {
        this.facturas.push(factura);
        this.guardar();
    }

    eliminarFactura(index) {
        this.facturas.splice(index, 1);
        this.guardar();
    }

    guardar() {
        localStorage.setItem("historialFacturas", JSON.stringify(this.facturas));
    }

    cargar() {
        const data = localStorage.getItem("historialFacturas");
        if (!data) return []; // Si no hay data lo inicializamos como un array vacío.

        const parsedData = JSON.parse(data);

        // Instanciamos nuevamente las facturas y los productos de cada una para mantener los métodos de clase.
        return parsedData.map(factura => {
            const productosInstanciados = factura.productos.map(
                producto => new Producto(producto.nombre, producto.cantidad, producto.precio)
            );
            return new Factura(factura.cliente, productosInstanciados, factura.ivaAplicado, factura.fechaEmision);
        });
    }

    obtenerTodas() {
        return this.facturas;
    }
}

// ------------------ VARIABLES GLOBALES ------------------- //

let IVA; // Variable global para manejar el cálculo de IVA.
let historialFacturas = new HistorialFacturas(); // Acá guardaremos todas las facturas generadas.

// ------------------ ELEMENTOS DEL DOM ------------------- //

const formFactura = document.getElementById("form-factura");
const mensajeFactura = document.getElementById("mensajeFactura");
const formCambioIVA = document.getElementById("form-iva");
const productosContainer = document.getElementById("productos-container");
const agregarProductoBtn = document.getElementById("agregarProductoBtn");
const historialDiv = document.getElementById('historialFacturas');

// ------------------ FUNCIONES ------------------- //

// Función para mostrar logs de factura (Puede ser éxito o error).
function mostrarMensajeFactura(texto, tipo = "exito") {
    mensajeFactura.textContent = texto;
    mensajeFactura.className = `mensaje-factura ${tipo}`; // Ajustamos la clase según el tipo, esto nos permite jugar con los estilos.
    mensajeFactura.style.display = "block";

    // Ocultamos el mensaje luego de 2 segundos.
    setTimeout(() => {
        mensajeFactura.style.display = "none";
    }, 2000);
}

function getCliente() {
    const nombreCliente = document.getElementById("nombreCliente").value.trim();
    const numeroIdentificacion = document.getElementById("numeroIdentificacion").value;

    if (!nombreCliente || !numeroIdentificacion) {
        mostrarMensajeFactura("Por favor verifique los datos ingresados del cliente.", "error");
        return null;
    }

    return { nombre: nombreCliente, numeroIdentificacion: numeroIdentificacion }; // Devolvemos un objeto con los datos del cliente.
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

    const totalesFactura = factura.getTotales();

    const subtotal = document.createElement("p");
    subtotal.textContent = `Subtotal: $${totalesFactura.subtotal.toFixed(2)}`;
    tarjeta.appendChild(subtotal);

    const iva = document.createElement("p");
    iva.textContent = `IVA (${(factura.ivaAplicado * 100).toFixed(1)}%): $${totalesFactura.ivaTotal.toFixed(2)}`;
    tarjeta.appendChild(iva);

    const total = document.createElement("p");
    total.innerHTML = `<strong>Total: $${totalesFactura.total.toFixed(2)}</strong>`;
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

    const facturas = historialFacturas.obtenerTodas();

    facturas.forEach((factura, index) => {
        mostrarResumen(factura, index);
    });
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

    const productosFactura = leerProductos(); // Leemos los productos del DIV.
    if (!productosFactura || productosFactura.length === 0) {
        mostrarMensajeFactura("Debe agregar al menos un producto válido.", "error");
        return;
    }

    // Convertimos los datos leídos en instancias de la clase Producto
    const productos = productosFactura.map(prod => new Producto(prod.nombre, prod.cantidad, prod.precio));

    const nuevaFactura = new Factura(cliente, productos, IVA);
    historialFacturas.agregarFactura(nuevaFactura);

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
        historialFacturas.eliminarFactura(index); // Eliminamos la factura del array.

        cargarHistorial(); // Volvemos a cargar el historial
    });
}

// ------------------ APP ------------------- //

cargarIVA();
cargarHistorial();
