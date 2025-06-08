// Función para cargar productos.
function cargarProductos() {
    let productos = []; // Array para guardar los productos (Cada producto será un objeto).
    let continuar = true; // Aseguramos que el ciclo se ejecute al menos una vez (Se podría usar un do-while)

    while (continuar) {
        let nombre = prompt("Nombre del producto:");
        let cantidad = parseInt(prompt("Cantidad:")); // Precisamos que sea un entero.
        let precio = parseFloat(prompt("Precio unitario (S/IVA):")); // Precisamos que sea un float.

        if (!isNaN(cantidad) && !isNaN(precio)) {
            productos.push({ nombre, cantidad, precio }); // Agregamos el producto al array de productos.
        } else {
            alert("Cantidad o precio inválido. Intente de nuevo."); // Validamos que los datos sean correctos para no obtener productos con datos erróneos.
        }

        continuar = confirm("¿Deseás cargar otro producto?");
    }

    return productos; // Retornamos el array de productos cargados.
}

// Función para calcular el total con IVA para la factura en cuestión.
function calcularTotales(productos) {
    const IVA = 0.21; // 21% de IVA para todos los productos.
    let subtotal = 0;

    for (let prod of productos) {
        subtotal += prod.precio * prod.cantidad;
    }

    let ivaTotal = subtotal * IVA;
    let total = subtotal + ivaTotal;

    return { subtotal, ivaTotal, total }; // Retornamos un objeto con los totales calculados.
}

// Función para mostrar el resumen final de la factura.
function mostrarResumen(cliente, productos, totales) {
    let resumen = `Factura para: ${cliente.nombre}\n\n Productos cargados:\n`; // Variable para almacenar el resumen de la factura.

    productos.forEach((prod, index) => { // Iteramos sobre los productos para mostrar sus detalles.
        resumen += `${index + 1}. ${prod.nombre} - ${prod.cantidad} x $${prod.precio}\n`;
    });

    resumen += `\nSubtotal: $${totales.subtotal.toFixed(2)}`; // Agregamos el subtotal al resumen.
    resumen += `\nIVA (21%): $${totales.ivaTotal.toFixed(2)}`; // Agregamos el IVA al resumen.
    resumen += `\nTotal: $${totales.total.toFixed(2)}`; // Agregamos el total al resumen.
    
    alert(resumen);
}

// EJECUCIÓN DEL SIMULADOR

// Solicitamos nombre del cliente para realizar la factura.
let nombreCliente = "";

while (!nombreCliente || nombreCliente.trim() === "") {
    nombreCliente = prompt("Ingrese el nombre del cliente:");

    // Validamos que el nombre no esté vacío o contenga solo espacios.
    if (!nombreCliente || nombreCliente.trim() === "") {
        alert("El nombre del cliente no puede estar vacío. Intente nuevamente.");
    }
}

// Creamos un objeto cliente con el nombre ingresado (Por el momento solo guardamos el nombre).
const cliente = { 
    nombre: nombreCliente.trim() 
};  
alert(`La factura será emitida al cliente ${cliente.nombre}, comencemos a cargar los productos para generar su factura.`);

productosFactura = cargarProductos(); // Llamamos a la función que se encarga de cargar los productos de la factura dentro de un array.
let totalesFactura = calcularTotales(productosFactura); // Llamamos a la función que calcula los totales de la factura (Subtotal, IVA y Total).
mostrarResumen(cliente, productosFactura, totalesFactura); // Llamamos a la función que muestra el resumen de la factura al cliente.
