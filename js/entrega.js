// js/entregas.js - Funciones para entregas de alumnos (solo texto)
// NO modifica el código existente

/**
 * Entregar una tarea solo con comentario de texto
 * @param {string} tareaId - ID de la tarea
 * @param {string} tareaTitulo - Título de la tarea
 * @param {string} comentario - Comentario de la entrega
 * @returns {Promise<boolean>} - True si se entregó correctamente
 */
async function entregarTarea(tareaId, tareaTitulo, comentario) {
    try {
        const usuario = getUsuarioActual();
        if (!usuario || usuario.rol !== 'alumno') {
            alert('❌ Solo los alumnos pueden entregar tareas');
            return false;
        }

        // Verificar si ya entregó la tarea
        const entregaExistente = await verificarEntrega(tareaId, usuario.uid);
        if (entregaExistente) {
            alert('❌ Ya has entregado esta tarea');
            return false;
        }

        // Crear documento en Firestore
        await addDoc(collection(db, 'entregas'), {
            tareaId: tareaId,
            tareaTitulo: tareaTitulo,
            alumnoUID: usuario.uid,
            alumnoNombre: usuario.nombre,
            alumnoEmail: usuario.email,
            comentario: comentario,
            fechaEntrega: new Date(),
            calificacion: null,
            revisado: false
        });

        alert('✅ Tarea entregada correctamente!');
        return true;
    } catch (error) {
        console.error('Error al entregar tarea:', error);
        alert('❌ Error al entregar tarea: ' + error.message);
        return false;
    }
}

/**
 * Verificar si un alumno ya entregó una tarea
 * @param {string} tareaId - ID de la tarea
 * @param {string} alumnoUID - UID del alumno
 * @returns {Promise<boolean>} - True si ya entregó
 */
async function verificarEntrega(tareaId, alumnoUID) {
    try {
        const q = query(
            collection(db, 'entregas'),
            where('tareaId', '==', tareaId),
            where('alumnoUID', '==', alumnoUID)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error al verificar entrega:', error);
        return false;
    }
}

/**
 * Obtener todas las entregas del alumno actual
 * @returns {Promise<Array>} - Lista de entregas
 */
async function obtenerMisEntregas() {
    try {
        const usuario = getUsuarioActual();
        if (!usuario) return [];

        const q = query(
            collection(db, 'entregas'),
            where('alumnoUID', '==', usuario.uid)
        );
        const querySnapshot = await getDocs(q);
        const entregas = [];
        querySnapshot.forEach((doc) => {
            entregas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return entregas;
    } catch (error) {
        console.error('Error al obtener mis entregas:', error);
        return [];
    }
}

/**
 * Obtener entrega de una tarea específica para el alumno actual
 * @param {string} tareaId - ID de la tarea
 * @returns {Promise<Object|null>} - Entrega o null
 */
async function obtenerMiEntrega(tareaId) {
    try {
        const usuario = getUsuarioActual();
        if (!usuario) return null;

        const q = query(
            collection(db, 'entregas'),
            where('tareaId', '==', tareaId),
            where('alumnoUID', '==', usuario.uid)
        );
        const querySnapshot = await getDocs(q);
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
        console.error('Error al obtener entrega:', error);
        return null;
    }
}