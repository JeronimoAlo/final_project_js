let IVA = 0.21; // 21% de IVA para todos los productos.
let historialFacturas = []; // Acá guardaremos todas las facturas generadas.

function getCliente() {
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

    return cliente; // Retornamos el objeto cliente con el nombre ingresado.
}

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

    return factura; // Retornamos el objeto factura creado.
}

// Función para mostrar el resumen final de la factura.
function mostrarResumen(factura) {
    let resumen = `Factura para: ${factura.cliente.nombre}\n\n Productos cargados:\n`; // Variable para almacenar el resumen de la factura.

    factura.productos.forEach((prod, index) => { // Iteramos sobre los productos para mostrar sus detalles.
        resumen += `${index + 1}. ${prod.nombre} - ${prod.cantidad} x $${prod.precio}\n`;
    });

    resumen += `\nSubtotal: $${factura.totales.subtotal.toFixed(2)}`; // Agregamos el subtotal al resumen.
    resumen += `\nIVA (${(IVA * 100).toFixed(1)}%): $${factura.totales.ivaTotal.toFixed(2)}`; // Agregamos el IVA al resumen.
    // resumen += `\nIVA (21%): $${totales.ivaTotal.toFixed(2)}`; // Agregamos el IVA al resumen.
    resumen += `\nTotal: $${factura.totales.total.toFixed(2)}`; // Agregamos el total al resumen.

    // Agregamos el resumen a la factura.
    factura.resumenTexto = resumen;
    
    alert(resumen);
}

function mostrarHistorialFacturas() {
    if (historialFacturas.length === 0) {
        alert("No hay facturas registradas en esta sesión.");
    } else {
        let historialCompleto = "📋 HISTORIAL DE FACTURAS\n\n";
        console.log("Facturas registradas:", historialFacturas);
        historialFacturas.forEach((factura, index) => {
            historialCompleto += `🧾 Factura #${index + 1} - Fecha: ${factura.fechaEmision.toLocaleString()}\n`;
            historialCompleto += `${factura.resumenTexto}\n\n-----------------------\n\n`;
        });

        alert(historialCompleto); // TODO: Implementar una mejor visualización del historial de facturas dentro del HTML (El alert lo corta si es muy largo).
    }
}

function cambiarIVA() {
    let nuevoIVA = parseFloat(prompt("Ingrese el nuevo porcentaje de IVA (ej: 10.5 para 10.5%):"));

    if (!isNaN(nuevoIVA) && nuevoIVA >= 0 && nuevoIVA <= 100) {
        IVA = nuevoIVA / 100; // Lo convertimos a decimal
        alert(`El IVA ha sido actualizado a ${nuevoIVA}%.`);
    } else {
        alert("Valor inválido. Ingrese un número entre 0 y 100.");
    }
}

// Menú de opciones para el usuario.
function menu() {
    let continuar = true; // Variable para controlar el ciclo del menú.

    while (continuar) {
        let opcion = prompt("Seleccione una opción:\n1. Cargar factura\n2. Ver historial de facturas\n3. Cambiar % de IVA\n4. Salir"); // Mostramos el menú de opciones al usuario.

        switch (opcion) {
            case '1':
                let cliente = getCliente(); // Llamamos a la función que se encarga de obtener los datos del cliente.
                let productosFactura = cargarProductos(); // Llamamos a la función que se encarga de cargar los productos de la factura dentro de un array.
                let totalesFactura = calcularTotales(productosFactura); // Llamamos a la función que calcula los totales de la factura (Subtotal, IVA y Total).
                let factura = crearFactura(cliente, productosFactura, totalesFactura); // Llamamos a la función que crea la factura con los datos ingresados.

                mostrarResumen(factura); // Llamamos a la función que muestra el resumen de la factura al cliente.
                break;
            case '2':
                mostrarHistorialFacturas(); // Llamamos a la función que muestra el historial de facturas generadas.
                break;
            case '3':
                cambiarIVA(); // Llamamos a la función que permite cambiar el porcentaje de IVA.
                break;
            case '4':
                continuar = false; // Salimos del ciclo si el usuario selecciona salir.
                break;
            default:
                alert("Opción no válida. Intente nuevamente."); // Validamos que la opción ingresada sea correcta.
        }
    }
}

// EJECUCIÓN DEL SIMULADOR
function iniciarSimulador() {
    alert("Bienvenido al simulador de facturación. Vamos a generar una factura para un cliente.");
    menu(); // Llamamos a la función que muestra el menú de opciones.
}

iniciarSimulador();