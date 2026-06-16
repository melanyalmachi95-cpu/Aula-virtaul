// entregas.js - Funciones de entrega de tareas
// NO MODIFICA EL CÓDIGO EXISTENTE

// Subir archivo a Firebase Storage
async function subirArchivo(file, tareaId, alumnoUID) {
    try {
        const storageRef = window.storageRef;
        if (!storageRef) {
            alert("❌ Storage no inicializado");
            return null;
        }
        
        const archivoRef = storageRef.child(`entregas/${tareaId}/${alumnoUID}/${file.name}`);
        const snapshot = await archivoRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return {
            url: downloadURL,
            nombre: file.name
        };
    } catch (error) {
        console.error("Error al subir archivo:", error);
        alert("❌ Error al subir archivo: " + error.message);
        return null;
    }
}

// Crear entrega
async function crearEntrega(tareaId, tareaTitulo, comentario, archivo) {
    const usuario = getUsuarioActual();
    if (!usuario || usuario.rol !== 'alumno') {
        alert("❌ Solo alumnos pueden entregar tareas");
        return false;
    }
    
    try {
        let archivoURL = null;
        let archivoNombre = null;
        
        // Subir archivo si existe
        if (archivo) {
            const resultadoArchivo = await subirArchivo(archivo, tareaId, usuario.uid);
            if (resultadoArchivo) {
                archivoURL = resultadoArchivo.url;
                archivoNombre = resultadoArchivo.nombre;
            }
        }
        
        // Crear documento en Firestore
        await window.addDoc(window.collection(window.db, "entregas"), {
            tareaId: tareaId,
            tareaTitulo: tareaTitulo,
            alumnoUID: usuario.uid,
            alumnoNombre: usuario.nombre,
            alumnoEmail: usuario.email,
            comentario: comentario,
            archivoURL: archivoURL,
            archivoNombre: archivoNombre,
            fechaEntrega: new Date(),
            calificacion: null,
            revisado: false
        });
        
        alert("✅ Tarea entregada exitosamente!");
        return true;
    } catch (error) {
        console.error("Error al crear entrega:", error);
        alert("❌ Error al entregar tarea: " + error.message);
        return false;
    }
}

// Obtener entregas de un alumno
async function obtenerEntregasAlumno(alumnoUID) {
    try {
        const q = window.query(
            window.collection(window.db, "entregas"),
            window.where("alumnoUID", "==", alumnoUID)
        );
        const querySnapshot = await window.getDocs(q);
        const entregas = [];
        querySnapshot.forEach((doc) => {
            entregas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return entregas;
    } catch (error) {
        console.error("Error al obtener entregas:", error);
        return [];
    }
}

// Verificar si un alumno ya entregó una tarea
async function verificarEntrega(tareaId, alumnoUID) {
    try {
        const q = window.query(
            window.collection(window.db, "entregas"),
            window.where("tareaId", "==", tareaId),
            window.where("alumnoUID", "==", alumnoUID)
        );
        const querySnapshot = await window.getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error al verificar entrega:", error);
        return false;
    }
}

// Obtener entrega específica
async function obtenerEntrega(tareaId, alumnoUID) {
    try {
        const q = window.query(
            window.collection(window.db, "entregas"),
            window.where("tareaId", "==", tareaId),
            window.where("alumnoUID", "==", alumnoUID)
        );
        const querySnapshot = await window.getDocs(q);
        if (querySnapshot.empty) return null;
        
        let entrega = null;
        querySnapshot.forEach((doc) => {
            entrega = {
                id: doc.id,
                ...doc.data()
            };
        });
        return entrega;
    } catch (error) {
        console.error("Error al obtener entrega:", error);
        return null;
    }
}