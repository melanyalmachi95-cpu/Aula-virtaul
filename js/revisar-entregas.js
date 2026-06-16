// revisar-entregas.js - Funciones para revisar entregas de tareas
// NO MODIFICA EL CÓDIGO EXISTENTE

// Obtener todas las entregas de todos los alumnos
async function obtenerTodasEntregas() {
    try {
        const q = window.query(
            window.collection(window.db, "entregas"),
            window.orderBy("fechaEntrega", "desc")
        );
        const querySnapshot = await window.getDocs(q);
        const entregas = [];
        querySnapshot.forEach((doc) => {
            entregas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(`📦 Se encontraron ${entregas.length} entregas`);
        return entregas;
    } catch (error) {
        console.error("Error al obtener todas las entregas:", error);
        return [];
    }
}

// Calificar una entrega
async function calificarEntrega(entregaId, calificacion) {
    try {
        const entregaRef = window.doc(window.db, "entregas", entregaId);
        await window.updateDoc(entregaRef, {
            calificacion: calificacion,
            revisado: true
        });
        alert("✅ Calificación guardada exitosamente!");
        return true;
    } catch (error) {
        console.error("Error al calificar entrega:", error);
        alert("❌ Error al calificar: " + error.message);
        return false;
    }
}

// Mostrar todas las entregas en la página del profesor
async function mostrarEntregasProfesor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const entregas = await obtenerTodasEntregas();

    if (entregas.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                No hay entregas disponibles 📭
            </div>
        `;
        return;
    }

    let html = '<div class="entregas-grid">';
    entregas.forEach((entrega) => {
        let fechaEntrega = 'Sin fecha';
        if (entrega.fechaEntrega) {
            if (entrega.fechaEntrega.toDate) {
                fechaEntrega = entrega.fechaEntrega.toDate().toLocaleString();
            } else if (entrega.fechaEntrega instanceof Date) {
                fechaEntrega = entrega.fechaEntrega.toLocaleString();
            }
        }
        
        let estado = '';
        if (entrega.revisado) {
            estado = `<span class="estado estado-revisado">Revisado ✅ (${entrega.calificacion}/10)</span>`;
        } else {
            estado = `<span class="estado estado-pendiente">Pendiente ⏳</span>`;
        }

        html += `
            <div class="entrega-card">
                <h4>📚 ${escapeHtml(entrega.tareaTitulo)}</h4>
                <p><strong>Alumno:</strong> ${escapeHtml(entrega.alumnoNombre)} (${escapeHtml(entrega.alumnoEmail)})</p>
                <p><strong>Comentario:</strong> ${escapeHtml(entrega.comentario)}</p>
                <p><strong>Fecha entrega:</strong> ${fechaEntrega}</p>
                <p>${estado}</p>
                <button class="btn btn-primary btn-ver-detalle" onclick="abrirModalEntrega('${entrega.id}')">Ver Detalle</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Abrir modal de detalle de entrega
window.abrirModalEntrega = async function(entregaId) {
    const modal = document.getElementById('modal-entrega-detalle');
    const overlay = document.getElementById('modal-overlay');
    if (!modal || !overlay) return;

    // Obtener la entrega
    const entregaDoc = await window.getDoc(window.doc(window.db, "entregas", entregaId));
    if (!entregaDoc.exists()) {
        alert("❌ No se encontró la entrega");
        return;
    }

    const entrega = {
        id: entregaDoc.id,
        ...entregaDoc.data()
    };

    // Llenar el modal
    document.getElementById('detalle-entrega-id').value = entregaId;
    document.getElementById('detalle-tarea').textContent = entrega.tareaTitulo;
    document.getElementById('detalle-alumno').textContent = `${entrega.alumnoNombre} (${entrega.alumnoEmail})`;
    document.getElementById('detalle-comentario').textContent = entrega.comentario;
    
    let fechaEntrega = 'Sin fecha';
    if (entrega.fechaEntrega) {
        if (entrega.fechaEntrega.toDate) {
            fechaEntrega = entrega.fechaEntrega.toDate().toLocaleString();
        } else if (entrega.fechaEntrega instanceof Date) {
            fechaEntrega = entrega.fechaEntrega.toLocaleString();
        }
    }
    document.getElementById('detalle-fecha').textContent = fechaEntrega;
    
    document.getElementById('detalle-calificacion').value = entrega.calificacion || '';

    // Mostrar modal
    modal.style.display = 'block';
    overlay.style.display = 'block';
};

// Cerrar modal de detalle
window.cerrarModalEntrega = function() {
    const modal = document.getElementById('modal-entrega-detalle');
    const overlay = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
};

// Función auxiliar para evitar inyección HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}