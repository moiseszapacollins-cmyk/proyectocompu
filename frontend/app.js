const formulario = document.getElementById("formulario");
const resultado = document.getElementById("resultado");
const btnOscuro = document.getElementById("btn-oscuro");
const btnComparar = document.getElementById("btn-comparar");
const cuentaComparar = document.getElementById("cuenta-comparar");
const modal = document.getElementById("modal-comparacion");
const cerrarModal = document.querySelector(".cerrar-modal");
const tablaContenedor = document.getElementById("tabla-comparativa-contenedor");

let equiposSeleccionados = [];
let todosLosEquiposCargados = [];

btnOscuro.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if(document.body.classList.contains("dark-mode")) {
        btnOscuro.textContent = "Modo Claro";
    } else {
        btnOscuro.textContent = "Modo Oscuro";
    }
});

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    equiposSeleccionados = [];
    btnComparar.style.display = "none";

    const presupuesto = Number(document.getElementById("presupuesto").value);
    const perfil = document.getElementById("perfil").value;
    const tipo = document.getElementById("tipo").value;
    const marcaProcesador = document.getElementById("marca-procesador").value;
    const ramMinima = Number(document.getElementById("ram").value);
    const almacenamientoMinimo = Number(document.getElementById("almacenamiento").value);
    const ordenPrecio = document.getElementById("ordenar-precio").value;

    resultado.innerHTML = "<h3>Buscando las mejores opciones...</h3>";

    try {
        const respuesta = await fetch("http://localhost:8000/api/catalogo");
        if (!respuesta.ok) throw new Error("No se pudo conectar con Prolog.");

        const datos = await respuesta.json();
        todosLosEquiposCargados = datos.equipos;

        let exactos = [];
        let sugerencias = [];

        todosLosEquiposCargados.forEach(pc => {
            if (tipo !== "cualquiera" && pc.tipo !== tipo) return;
            if (pc.ram < ramMinima) return;
            if (pc.almacenamiento < almacenamientoMinimo) return;

            const procesadorTexto = pc.procesador.toLowerCase();
            if (marcaProcesador !== "cualquiera" && !procesadorTexto.includes(marcaProcesador)) return;

            if (pc.precio <= presupuesto) {
                exactos.push(pc);
            } else if (pc.precio <= presupuesto * 1.10) {
                sugerencias.push(pc);
            }
        });

        if (ordenPrecio === "menor-mayor") {
            exactos.sort((a, b) => a.precio - b.precio);
            sugerencias.sort((a, b) => a.precio - b.precio);
        } else if (ordenPrecio === "mayor-menor") {
            exactos.sort((a, b) => b.precio - a.precio);
            sugerencias.sort((a, b) => b.precio - a.precio);
        }

        resultado.replaceChildren();

        const t1 = document.createElement("h3");
        t1.textContent = exactos.length > 0 ? `Opciones recomendadas (${exactos.length})` : "No hay equipos en el presupuesto exacto.";
        resultado.append(t1);

        exactos.forEach(pc => resultado.append(crearTarjetaPC(pc, false)));

        if (sugerencias.length > 0) {
            const t2 = document.createElement("h3");
            t2.style.marginTop = "24px";
            t2.style.color = "#d97706";
            t2.textContent = "💡 Sugerencias: Por un poco más obtienes mucho más";
            resultado.append(t2);

            sugerencias.forEach(pc => resultado.append(crearTarjetaPC(pc, true)));
        }

    } catch (error) {
        resultado.innerHTML = `<p style="color:red;">Error al conectar: ${error.message}</p>`;
    }
});

function crearTarjetaPC(pc, esSugerencia) {
    const tarjeta = document.createElement("div");
    tarjeta.className = `tarjeta-pc ${esSugerencia ? 'sugerencia-card' : ''}`;
    
    tarjeta.innerHTML = `
        <div class="img-contenedor-web" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:130px;">
            <img src="${pc.imagen}" class="img-pc" alt="${pc.modelo}" style="width:120px; height:120px; object-fit:contain;">
            <a href="${pc.tienda}" target="_blank" style="font-size:11px; color:#1e40af; text-decoration:underline; font-weight:bold; text-align:center;">Ver sitio oficial ↗</a>
        </div>
        <div class="info-contenedor">
            <div class="pro_cabecera tarjeta-cabecera">
                <strong>${pc.marca} ${pc.modelo}</strong>
                <span class="precio-tag">$${pc.precio.toLocaleString('es-MX')} MXN</span>
            </div>
            <div class="tarjeta-cuerpo">
                <p><strong>Tipo:</strong> ${pc.tipo.toUpperCase()} | <strong>CPU:</strong> ${pc.procesador}</p>
                <p><strong>RAM:</strong> ${pc.ram} GB | <strong>Disco:</strong> ${pc.almacenamiento} GB (${pc.tipo_disco.toUpperCase()})</p>
                <p><strong>Gráficos:</strong> ${pc.graficos}</p>
                <label class="comparar-label">
                    <input type="checkbox" data-id="${pc.id}" class="chk-comparar"> Seleccionar para comparar
                </label>
            </div>
        </div>
    `;

    tarjeta.querySelector(".chk-comparar").addEventListener("change", function(e) {
        const id = this.getAttribute("data-id");
        if (this.checked) {
            if(equiposSeleccionados.length >= 3) {
                alert("Solo puedes comparar un máximo de 3 equipos a la vez.");
                this.checked = false;
                return;
            }
            equiposSeleccionados.push(id);
        } else {
            equiposSeleccionados = equiposSeleccionados.filter(item => item !== id);
        }

        if (equiposSeleccionados.length >= 2) {
            btnComparar.style.display = "block";
            cuentaComparar.textContent = equiposSeleccionados.length;
        } else {
            btnComparar.style.display = "none";
        }
    });

    return tarjeta;
}

btnComparar.addEventListener("click", () => {
    const listaFiltrada = todosLosEquiposCargados.filter(pc => equiposSeleccionados.includes(pc.id));
    
    let htmlTabla = `
        <table class="tabla-comparar">
            <thead>
                <tr>
                    <th>Característica</th>
                    ${listaFiltrada.map(pc => `<th>${pc.marca} ${pc.modelo}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Vista Previa</strong></td>
                    ${listaFiltrada.map(pc => `
                        <td style="text-align:center; padding:15px; vertical-align: top;">
                            <div class="contenedor-img-comparar">
                                <img src="${pc.imagen}" class="img-comparar" alt="${pc.modelo}">
                            </div>
                            <a href="${pc.tienda}" target="_blank" class="btn-comprar-tabla">Comprar ↗</a>
                        </td>
                    `).join('')}
                </tr>
                <tr><td><strong>Precio</strong></td> ${listaFiltrada.map(pc => `<td>$${pc.precio.toLocaleString()} MXN</td>`).join('')}</tr>
                <tr><td><strong>Tipo</strong></td> ${listaFiltrada.map(pc => `<td>${pc.tipo.toUpperCase()}</td>`).join('')}</tr>
                <tr><td><strong>Procesador</strong></td> ${listaFiltrada.map(pc => `<td>${pc.procesador}</td>`).join('')}</tr>
                <tr><td><strong>Memoria RAM</strong></td> ${listaFiltrada.map(pc => `<td>${pc.ram} GB</td>`).join('')}</tr>
                <tr><td><strong>Disco</strong></td> ${listaFiltrada.map(pc => `<td>${pc.almacenamiento} GB</td>`).join('')}</tr>
                <tr><td><strong>Gráficos</strong></td> ${listaFiltrada.map(pc => `<td>${pc.graficos}</td>`).join('')}</tr>
            </tbody>
        </table>
    `;
    tablaContenedor.innerHTML = htmlTabla;
    modal.style.display = "block";
});

cerrarModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

const formAgregar = document.getElementById("formulario-agregar");

formAgregar.addEventListener("submit", async function(evento) {

        const nuevoEquipo = {
            marca: document.getElementById("add-marca").value,
            modelo: document.getElementById("add-modelo").value,
            precio: Number(document.getElementById("add-precio").value),
            tipo: document.getElementById("add-tipo").value,
            perfil: document.getElementById("add-perfil").value, 
            procesador: document.getElementById("add-cpu").value,
            ram: Number(document.getElementById("add-ram").value),
            almacenamiento: Number(document.getElementById("add-disco").value),
            tipo_disco: document.getElementById("add-tipo-disco").value,
            graficos: document.getElementById("add-gpu").value,
            imagen: document.getElementById("add-imagen").value,
            tienda: document.getElementById("add-tienda").value
        };

    try {

        const respuesta = await fetch("http://localhost:8000/api/catalogo/agregar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoEquipo)
        });

        if (!respuesta.ok) throw new Error("Error en la respuesta.");

    const resultadoGuardado = await respuesta.json();

    if (respuesta.ok || resultadoGuardado.status === "success") {
        alert("¡Equipo guardado exitosamente!");
        formAgregar.reset();
        
        if (typeof buscarRecomendaciones === "function") {
            buscarRecomendaciones();
        }
    } else {
        alert("Hubo un problema: " + (resultadoGuardado.message || "No se pudo procesar."));
    }


    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo guardar el equipo.");
    }
});

const btnDesplegar = document.getElementById("btn-desplegar-registro");
const cuerpoDesplegable = document.getElementById("cuerpo-desplegable");
const iconoFlecha = document.getElementById("icono-flecha");

btnDesplegar.addEventListener("click", () => {
    if (cuerpoDesplegable.style.maxHeight === "0px" || cuerpoDesplegable.style.maxHeight === "") {
        cuerpoDesplegable.style.maxHeight = cuerpoDesplegable.scrollHeight + "px";
        iconoFlecha.style.transform = "rotate(180deg)"; 
    } else {
        cuerpoDesplegable.style.maxHeight = "0px";
        iconoFlecha.style.transform = "rotate(0deg)"; 
    }
});

async function buscarRecomendaciones(evento) {
    if (evento) evento.preventDefault();

    const contenedor = document.getElementById("resultado");
    contenedor.innerHTML = "<h3>Buscando las mejores opciones...</h3>";
    

    equiposSeleccionados = [];
    if(btnComparar) btnComparar.style.display = "none";

    try {
        const respuesta = await fetch("http://localhost:8000/api/catalogo");
        if (!respuesta.ok) throw new Error("Error en la respuesta del servidor");
        
        const datos = await respuesta.json();
        todosLosEquiposCargados = datos.equipos; 

        if (!todosLosEquiposCargados || todosLosEquiposCargados.length === 0) {
            contenedor.innerHTML = "<h3>No se encontraron equipos en el catálogo.</h3>";
            return;
        }


        const presupuestoMax = Number(document.getElementById("presupuesto").value) || Infinity;
        const perfil = document.getElementById("perfil").value; 
        const tipo = document.getElementById("tipo").value;
        const marcaProcesador = document.getElementById("marca-procesador").value;
        const ramMin = Number(document.getElementById("ram").value) || 0;
        const almacenamientoMin = Number(document.getElementById("almacenamiento").value) || 0;
        const ordenar = document.getElementById("ordenar-precio").value;
        let exactos = [];
        let sugerencias = [];

        todosLosEquiposCargados.forEach(pc => {

            if (tipo !== "cualquiera" && pc.tipo !== tipo) return;
            

            if (ramMin > 0 && pc.ram < ramMin) return;
            if (almacenamientoMin > 0 && pc.almacenamiento < almacenamientoMin) return;
            
            if (marcaProcesador !== "cualquiera") {
                const cpuMinuscula = pc.procesador.toLowerCase();
                if (marcaProcesador === "intel" && !cpuMinuscula.includes("intel")) return;
                if (marcaProcesador === "amd" && !cpuMinuscula.includes("amd")) return;
                if (marcaProcesador === "apple" && !cpuMinuscula.includes("m1") && !cpuMinuscula.includes("m2") && !cpuMinuscula.includes("m3")) return;
            }


            if (perfil !== "cualquiera") {
                const cpuMinuscula = pc.procesador.toLowerCase();
                const gpuMinuscula = pc.graficos.toLowerCase();
                
                if (perfil === "oficina") {
                }
                if (perfil === "programacion") {
                    if (pc.ram < 16) return;
                }
                if (perfil === "diseno") {

                    if (pc.ram < 16) return;
                    if (!gpuMinuscula.includes("rtx") && !gpuMinuscula.includes("gtx") && !gpuMinuscula.includes("iris") && !gpuMinuscula.includes("vega") && !cpuMinuscula.includes("apple")) return;
                }
                if (perfil === "gaming") { 

                    if (!gpuMinuscula.includes("rtx") && !gpuMinuscula.includes("gtx") && !gpuMinuscula.includes("vega")) return;
                }

            }


            if (pc.precio <= presupuestoMax) {
                exactos.push(pc);
            } else if (pc.precio <= presupuestoMax * 1.10) {
                sugerencias.push(pc); 
            }
        });

        
        if (ordenar === "menor-mayor") {
            exactos.sort((a, b) => a.precio - b.precio);
            sugerencias.sort((a, b) => a.precio - b.precio);
        } else {
            exactos.sort((a, b) => b.precio - a.precio);
            sugerencias.sort((a, b) => b.precio - a.precio);
        }

        contenedor.replaceChildren(); 

        const t1 = document.createElement("h3");
        t1.textContent = exactos.length > 0 ? `Opciones recomendadas (${exactos.length})` : "No hay equipos en el presupuesto exacto.";
        contenedor.append(t1);

        exactos.forEach(pc => contenedor.append(crearTarjetaPC(pc, false)));

        if (sugerencias.length > 0) {
            const t2 = document.createElement("h3");
            t2.style.marginTop = "24px";
            t2.style.color = "#d97706";
            t2.textContent = " Sugerencias: Por un poco más obtienes mucho más";
            resultado.append(t2);

            sugerencias.forEach(pc => contenedor.append(crearTarjetaPC(pc, true)));
        }

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `<p style="color: red;">Error al conectar: ${error.message}. Verifica que el puerto 8000 responda.</p>`;
    }
}

document.getElementById("formulario").addEventListener("submit", buscarRecomendaciones);
