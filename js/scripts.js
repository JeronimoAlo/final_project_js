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

    // Método utilizado para recopilar los totales de la factura (Por el momento se utiliza para mostrar el resumen).
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

    // El subtotal se calcula dentro de la clase de productos para mantener cierta cohesión.
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

    obtenerFacturas() {
        return this.facturas;
    }
}

// ------------------ VARIABLES GLOBALES ------------------- //

let IVA; // Variable global para manejar el cálculo de IVA.
let historialFacturas = new HistorialFacturas(); // Acá guardaremos todas las facturas generadas.
let productosDisponibles = []; // Manejo de productos leidos de productos.json.

// ------------------ ELEMENTOS DEL DOM ------------------- //

const formFactura = document.getElementById("form-factura");
const formCambioIVA = document.getElementById("form-iva");
const productosContainer = document.getElementById("productos-container");
const agregarProductoBtn = document.getElementById("agregarProductoBtn");
const historialDiv = document.getElementById('historialFacturas');

// ------------------ FUNCIONES ------------------- //

// Función para mostrar logs de factura (Puede ser éxito o error).
function mostrarMensaje(texto, tipo = "exito") {
    Toastify({
        text: texto,
        duration: 3000,
        gravity: "top",
        position: "right",
        close: true,
        style: {
            background: tipo === "error" ? "#e74c3c" : "#27ae60",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px 15px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }
    }).showToast();
}

function getCliente() {
    const nombreCliente = document.getElementById("nombreCliente").value.trim();
    const numeroIdentificacion = document.getElementById("numeroIdentificacion").value;

    if (!nombreCliente || !numeroIdentificacion) {
        mostrarMensaje("Por favor verifique los datos ingresados del cliente.", "error");
        return null;
    }

    return { nombre: nombreCliente, numeroIdentificacion: numeroIdentificacion }; // Devolvemos un objeto con los datos del cliente.
}

async function cargarProductosJSON() {
    try {
        const response = await fetch("productos.json"); // Leemos los productos.

        if (!response.ok) {
            throw new Error(`Error al cargar productos: ${response.status}`);
        }

        productosDisponibles = await response.json();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar productos',
            text: 'No se pudieron cargar los productos disponibles. Verificá el archivo productos.json o la conexión.',
            footer: `<code>${error.message}</code>`,
            confirmButtonText: 'Entendido'
        });
    }
}

function agregarProducto() {
    const div = document.createElement("div");
    div.classList.add("producto-item");

    const select = document.createElement("select");
    select.name = "nombreProducto";
    select.required = true;

    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = "-- Seleccione un producto --";
    select.appendChild(optionDefault);

    productosDisponibles.forEach(prod => {
        const option = document.createElement("option");

        option.value = prod.nombre;
        option.textContent = prod.nombre;
        option.dataset.precio = prod.precio;

        select.appendChild(option);
    });

    const cantidadInput = document.createElement("input");
    cantidadInput.type = "number";
    cantidadInput.name = "cantidadProducto";
    cantidadInput.min = "1";
    cantidadInput.required = true;
    cantidadInput.placeholder = "Cantidad";

    const precioInput = document.createElement("input");
    precioInput.type = "number";
    precioInput.name = "precioProducto";
    precioInput.required = true;
    precioInput.placeholder = "Precio unitario (S/IVA)";

    // Completamos automáticamente el precio
    select.addEventListener("change", () => {
        const selected = select.options[select.selectedIndex];
        precioInput.value = selected.dataset.precio || "";
    });

    const eliminarBtn = document.createElement("button"); // Agregamos el botón para eliminar productos de la factura que se está generando.
    eliminarBtn.type = "button";
    eliminarBtn.textContent = "🗑️";
    eliminarBtn.classList.add("btn-eliminar-prod");
    eliminarBtn.addEventListener("click", () => div.remove());

    const labelProducto = document.createElement("label");
    labelProducto.textContent = "Producto:";

    const labelCantidad = document.createElement("label");
    labelCantidad.textContent = "Cantidad:";

    const labelPrecio = document.createElement("label");
    labelPrecio.textContent = "Precio unitario:";

    // Agregamos todos los elementos en el orden correspondiente.
    div.appendChild(labelProducto);
    div.appendChild(select);
    div.appendChild(labelCantidad);
    div.appendChild(cantidadInput);
    div.appendChild(labelPrecio);
    div.appendChild(precioInput);
    div.appendChild(eliminarBtn);
    div.appendChild(document.createElement("hr"));

    productosContainer.appendChild(div);
}

// Función para leer los productos seleccionados desde el DOM.
function leerProductos() {
    const productosFactura = productosContainer.querySelectorAll(".producto-item");
    let productosLeidos = [];

    for (let producto of productosFactura) {
        const nombre = producto.querySelector("select[name='nombreProducto']").value.trim(); // Buscamos un select que tenga como name nombreProducto.
        const cantidad = parseInt(producto.querySelector("input[name='cantidadProducto']").value);
        const precio = parseFloat(producto.querySelector("input[name='precioProducto']").value);

        if (!nombre || isNaN(cantidad) || isNaN(precio)) {
            mostrarMensaje("Datos inválidos en uno de los productos.", "error");
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
    historialDiv.innerHTML = ""; // Limpiamos el div.

    const facturas = historialFacturas.obtenerFacturas();

    facturas.forEach((factura, index) => {
        mostrarResumen(factura, index); // Mostramos el resumen factura a factura hasta finalizar con el historial.
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

    if (typeof IVA !== "number" || isNaN(IVA) || IVA === 0) {
        mostrarMensaje("El valor del IVA no está definido o es inválido.", "error");

        return null;
    }

    const cliente = getCliente();
    if (!cliente) return; // Si no hay cliente, cortamos la ejecución de la función.

    const productosFactura = leerProductos(); // Leemos los productos del DIV.
    if (!productosFactura || productosFactura.length === 0) {
        mostrarMensaje("Debe agregar al menos un producto válido.", "error");
        return;
    }

    // Convertimos los datos leídos en instancias de la clase Producto
    const productos = productosFactura.map(prod => new Producto(prod.nombre, prod.cantidad, prod.precio));

    const nuevaFactura = new Factura(cliente, productos, IVA);
    historialFacturas.agregarFactura(nuevaFactura);

    mostrarMensaje("Factura generada correctamente.", "exito");

    cargarHistorial();

    formFactura.reset();
    productosContainer.innerHTML = "";
});

formCambioIVA.addEventListener("submit", function (elem) {
    elem.preventDefault();

    const nuevoIVA = parseFloat(document.getElementById("nuevoIVA").value);

    if (!isNaN(nuevoIVA) && nuevoIVA > 0 && nuevoIVA <= 100) {
        IVA = nuevoIVA / 100; // Lo convertimos a decimal.

        // Actualizamos el localStorage
        localStorage.setItem("valorIVA", JSON.stringify(IVA));

        Swal.fire({
            icon: 'success',
            title: 'IVA actualizado',
            text: `El nuevo porcentaje de IVA es ${nuevoIVA}%.`,
            confirmButtonText: 'Aceptar'
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Valor inválido',
            text: 'Por favor ingresá un número válido entre 0 y 100.',
            confirmButtonText: 'Reintentar'
        });
    }
})

function eventoBotonEliminarFactura(boton, historialDiv, index) {
    boton.addEventListener("click", () => {
        historialFacturas.eliminarFactura(index); // Eliminamos la factura del array.

        cargarHistorial(); // Volvemos a cargar el historial
    });
}

// ------------------ APP ------------------- //

async function app() {
    await cargarProductosJSON(); // Esperamos a que se cargue el JSON antes de inicializar las demás variables
    cargarIVA();
    cargarHistorial();
}

app();
