// main-entregas.js - Manejo de eventos para entregas
// NO MODIFICA EL CÓDIGO EXISTENTE

// Variable para almacenar las entregas del alumno
let entregasAlumno = [];

// Función para mostrar tareas con estado de entrega
async function mostrarTareasConEntregas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const tareas = await obtenerTareas();
    const usuario = getUsuarioActual();
    
    entregasAlumno = await obtenerEntregasAlumno(usuario.uid);
    
    if (tareas.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay tareas disponibles 📭</div>';
        return;
    }
    
    let html = '<div class="tareas-grid">';
    
    for (const tarea of tareas) {
        const fecha = tarea.fechaLimite ? new Date(tarea.fechaLimite.toDate()).toLocaleDateString() : 'Sin fecha';
        const profesorNombre = tarea.creadoPorNombre || tarea.creadoPorEmail || 'Profesor';
        
        // Verificar si ya entregó esta tarea
        const entregaExistente = entregasAlumno.find(e => e.tareaId === tarea.id);
        const yaEntregado = !!entregaExistente;
        
        let estadoHTML = '';
        let botonHTML = '';
        
        if (yaEntregado) {
            if (entregaExistente.revisado) {
                estadoHTML = `<span class="estado estado-revisado">Entregada ✅ Calificación: ${entregaExistente.calificacion}/10</span>`;
            } else {
                estadoHTML = `<span class="estado estado-entregado">Entregada ✅ Pendiente de revisión</span>`;
            }
        } else {
            estadoHTML = `<span class="estado estado-pendiente">Pendiente ⏳</span>`;
            botonHTML = `<button class="btn btn-success btn-entregar" onclick="abrirModalEntregar('${tarea.id}', '${tarea.titulo.replace(/'/g, "\\'")}')">Entregar Tarea</button>`;
        }
        
        html += `
            <div class="tarea-card">
                <h3>📚 ${tarea.titulo}</h3>
                <p>${tarea.descripcion}</p>
                <small>📅 Fecha límite: ${fecha}</small>
                ${usuario.rol === 'alumno' ? `<small>👨‍🏫 Creado por: ${profesorNombre}</small>` : ''}
                <div class="tarea-footer">
                    ${estadoHTML}
                    ${botonHTML}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Abrir modal de entrega
function abrirModalEntregar(tareaId, tareaTitulo) {
    const modal = document.getElementById('modal-entrega');
    const overlay = document.getElementById('modal-overlay');
    if (!modal || !overlay) return;
    
    document.getElementById('entrega-tarea-id').value = tareaId;
    document.getElementById('entrega-tarea-titulo').value = tareaTitulo;
    document.getElementById('entrega-comentario').value = '';
    document.getElementById('entrega-archivo').value = '';
    document.getElementById('file-error').style.display = 'none';
    
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

// Cerrar modal
function cerrarModalEntregar() {
    const modal = document.getElementById('modal-entrega');
    const overlay = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

// Inicializar listeners para alumno.html
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es la página de alumno y reemplazar la función de mostrar tareas
    if (document.getElementById('bienvenidaAlumno')) {
        window.mostrarTareas = mostrarTareasConEntregas;
    }
    
    // Modal de entrega
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', cerrarModalEntregar);
    }
    
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModalEntregar);
    }
    
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', cerrarModalEntregar);
    }
    
    const formEntrega = document.getElementById('form-entrega');
    if (formEntrega) {
        formEntrega.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const tareaId = document.getElementById('entrega-tarea-id').value;
            const tareaTitulo = document.getElementById('entrega-tarea-titulo').value;
            const comentario = document.getElementById('entrega-comentario').value;
            const fileInput = document.getElementById('entrega-archivo');
            const file = fileInput.files[0];
            
            // Validar tamaño del archivo (máx 10MB
            if (file && file.size > 10 * 1024 * 1024) {
                document.getElementById('file-error').style.display = 'block';
                return;
            }
            
            const exito = await crearEntrega(tareaId, tareaTitulo, comentario, file);
            if (exito) {
                cerrarModalEntregar();
                mostrarTareasConEntregas('listaTareasAlumno');
            }
        });
        
        // Validación de tamaño de archivo en tiempo real
        const fileInput = document.getElementById('entrega-archivo');
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                if (this.files[0] && this.files[0].size > 10 * 1024 * 1024) {
                    document.getElementById('file-error').style.display = 'block';
                } else {
                    document.getElementById('file-error').style.display = 'none';
                }
            });
        }
    }
});