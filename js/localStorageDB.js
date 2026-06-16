// Archivo adaptado para usar Firebase
const SESION_KEY = 'aulaVirtual_sesion';

async function guardarUsuarioEnFirestore(usuario) {
    try {
        await setDoc(doc(db, "usuarios", usuario.uid), {
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        });
        return usuario;
    } catch (error) {
        console.error("Error guardando usuario en Firestore:", error);
        throw error;
    }
}

async function obtenerUsuarioPorUID(uid) {
    try {
        const docRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { uid: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        return null;
    }
}

async function guardarTarea(tarea) {
    try {
        const docRef = await addDoc(collection(db, "tareas"), tarea);
        return { id: docRef.id, ...tarea };
    } catch (error) {
        console.error("Error guardando tarea:", error);
        throw error;
    }
}

async function obtenerTareasPorProfesor(profesorId) {
    try {
        const q = query(collection(db, "tareas"), where("profesorId", "==", profesorId));
        const querySnapshot = await getDocs(q);
        const tareas = [];
        querySnapshot.forEach((doc) => {
            tareas.push({ id: doc.id, ...doc.data() });
        });
        return tareas;
    } catch (error) {
        console.error("Error obteniendo tareas del profesor:", error);
        return [];
    }
}

async function obtenerTodasLasTareas() {
    try {
        const q = query(collection(db, "tareas"), orderBy("fechaCreacion", "desc"));
        const querySnapshot = await getDocs(q);
        const tareas = [];
        querySnapshot.forEach((doc) => {
            tareas.push({ id: doc.id, ...doc.data() });
        });
        return tareas;
    } catch (error) {
        console.error("Error obteniendo todas las tareas:", error);
        return [];
    }
}

function guardarSesion(usuario) {
    sessionStorage.setItem(SESION_KEY, JSON.stringify(usuario));
}

function obtenerSesion() {
    const datos = sessionStorage.getItem(SESION_KEY);
    return datos ? JSON.parse(datos) : null;
}

function limpiarSesion() {
    sessionStorage.removeItem(SESION_KEY);
}