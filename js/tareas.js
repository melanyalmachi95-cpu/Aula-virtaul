// tareas.js - Funciones completas (crear, mostrar, borrar) *que tediso fue crear la funcion borrar* 

// Crear una tarea (solo profesores cuenta regustrada melanyalmachi95@gmail.com y 12345678)
async function crearTarea(titulo, descripcion, fechaLimite) {
    const usuario = getUsuarioActual();
    
    if (!usuario || usuario.rol !== 'profesor') {
        alert("❌ Solo los profesores pueden crear tareas");
        return false;
    }
    
    try {
        await window.addDoc(window.collection(window.db, "tareas"), {
            titulo: titulo,
            descripcion: descripcion,
            fechaLimite: new Date(fechaLimite),
            creadoPorUID: usuario.uid,
            creadoPorEmail: usuario.email,
            creadoPorNombre: usuario.nombre,
            fechaCreacion: new Date(),
            activa: true
        });
        
        alert("✅ Tarea creada exitosamente");
        return true;
    } catch (error) {
        console.error("Error al crear tarea:", error);
        alert("❌ Error al crear tarea: " + error.message);
        return false;
    }
}

// Obtener tareas (profesores ven las suyas, alumnos ven todas mi cuenta de alumno es anthonyleonelsimbanamora@gmail.com)
async function obtenerTareas() {
    const usuario = getUsuarioActual();
    
    if (!usuario) {
        console.error("No hay usuario logueado");
        return [];
    }
    
    try {
        let q;
        
        if (usuario.rol === 'profesor') {
            console.log("🔍 Profesor buscando sus tareas, UID:", usuario.uid);
            q = window.query(
                window.collection(window.db, "tareas"),
                window.where("creadoPorUID", "==", usuario.uid),
                window.orderBy("fechaCreacion", "desc")
            );
        } else {
            console.log("🔍 Alumno viendo todas las tareas");
            q = window.query(
                window.collection(window.db, "tareas"),
                window.orderBy("fechaCreacion", "desc")
            );
        }
        
        const querySnapshot = await window.getDocs(q);
        const tareas = [];
        
        querySnapshot.forEach((doc) => {
            tareas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`📊 Se encontraron ${tareas.length} tareas`);
        return tareas;
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        return [];
    }
}

// Mostrar tareas en el HTML el estilo con CSS no me quedo tan bien pero es lo que hay xd
async function mostrarTareas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("❌ Contenedor no encontrado:", containerId);
        return;
    }
    
    const usuario = getUsuarioActual();
    console.log("👤 Usuario actual:", usuario);
    
    if (!usuario) {
        container.innerHTML = '<div class="alert alert-warning">⚠️ No hay usuario logueado</div>';
        return;
    }
    
    const tareas = await obtenerTareas();
    
    if (tareas.length === 0) {
        if (usuario.rol === 'profesor') {
            container.innerHTML = '<div class="alert alert-info">📭 No has creado ninguna tarea aún. ¡Crea tu primera tarea!</div>';
        } else {
            container.innerHTML = '<div class="alert alert-info">📭 No hay tareas disponibles</div>';
        }
        return;
    }
    
    let html = '<div class="tareas-grid">';
    
    for (const tarea of tareas) {
        let fechaLimite = 'Sin fecha';
        if (tarea.fechaLimite) {
            if (tarea.fechaLimite.toDate) {
                fechaLimite = tarea.fechaLimite.toDate().toLocaleDateString();
            } else if (tarea.fechaLimite instanceof Date) {
                fechaLimite = tarea.fechaLimite.toLocaleDateString();
            }
        }
        
        const profesorNombre = tarea.creadoPorNombre || tarea.creadoPorEmail || 'Profesor';
        
        if (usuario.rol === 'profesor') {
            html += `
                <div class="tarea-card">
                    <h3>📚 ${escapeHtml(tarea.titulo)}</h3>
                    <p>${escapeHtml(tarea.descripcion)}</p>
                    <small>📅 Fecha límite: ${fechaLimite}</small>
                    <small>👨‍🏫 Creada por ti</small>
                    <button onclick="borrarTarea('${tarea.id}')" class="btn-eliminar">🗑️ Eliminar</button>
                </div>
            `;
        } else {
            html += `
                <div class="tarea-card">
                    <h3>📚 ${escapeHtml(tarea.titulo)}</h3>
                    <p>${escapeHtml(tarea.descripcion)}</p>
                    <small>📅 Fecha límite: ${fechaLimite}</small>
                    <small>👨‍🏫 Creado por: ${escapeHtml(profesorNombre)}</small>
                </div>
            `;
        }
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Borrar una tarea (solo profesores si porque sino la funcion se ederaba a todos los ususarios aunque no estaba avilitada)
async function borrarTarea(tareaId) {
    const usuario = getUsuarioActual();
    
    if (!usuario || usuario.rol !== 'profesor') {
        alert("❌ Solo los profesores pueden borrar tareas");
        return false;
    }
    
    if (!confirm("¿Estás seguro de que quieres borrar esta tarea? Esta acción no se puede deshacer.")) {
        return false;
    }
    
    try {
        await window.deleteDoc(window.doc(window.db, "tareas", tareaId));
        alert("✅ Tarea borrada exitosamente");
        // Recargar la lista de tareas
        await mostrarTareas('lista-tareas');
        return true;
    } catch (error) {
        console.error("Error al borrar tarea:", error);
        alert("❌ Error al borrar tarea: " + error.message);
        return false;
    }
}

// Función auxiliar para evitar inyección HTML como en el curso de unos meses atras jiji
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}