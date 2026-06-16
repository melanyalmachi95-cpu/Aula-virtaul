// auth.js - Versión con Firebase *nota recuerda la verción o si no  me va a psar lo mismo de la otra vez*
// Funciones de autenticación usando Firebase

// Registro de usuario clave para mis dos cuetas es 12345678
async function registrarUsuario(email, password, nombre, rol) {
    try {
        // Crear usuario en Firebase 
        const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;
        
        // Guardar datos adicionales en Firestore o sino no se registra jajaja
        await window.setDoc(window.doc(window.db, "users", user.uid), {
            nombre: nombre,
            email: email,
            rol: rol,
            creadoEn: new Date()
        });
        
        // Guardar sesión temporal
        sessionStorage.setItem('userUID', user.uid);
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userNombre', nombre);
        sessionStorage.setItem('userRol', rol);
        
        alert("✅ Usuario registrado exitosamente");
        return true;
    } catch (error) {
        console.error("Error en registro:", error);
        if (error.code === 'auth/email-already-in-use') {
            alert("❌ Este email ya está registrado");
        } else {
            alert("❌ Error al registrar: " + error.message);
        }
        return false;
    }
}

// Login de usuario
async function loginUsuario(email, password) {
    try {
        const userCredential = await window.signInWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;
        
        // Obtener datos del usuario desde Firestore
        const userDoc = await window.getDoc(window.doc(window.db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            sessionStorage.setItem('userUID', user.uid);
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userNombre', userData.nombre);
            sessionStorage.setItem('userRol', userData.rol);
            
            alert(`✅ Bienvenido ${userData.nombre}`);
            return userData.rol;
        } else {
            alert("❌ No se encontraron datos del usuario");
            return null;
        }
    } catch (error) {
        console.error("Error en login:", error);
        if (error.code === 'auth/invalid-credential') {
            alert("❌ Email o contraseña incorrectos");
        } else {
            alert("❌ Error al iniciar sesión: " + error.message);
        }
        return null;
    }
}

// Cerrar sesión
async function cerrarSesion() {
    try {
        await window.signOut(window.auth);
        sessionStorage.clear();
        alert("✅ Sesión cerrada");
        return true;
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        return false;
    }
}

// Limpiar sesión (alias)
function limpiarSession() {
    sessionStorage.clear();
}

// Obtener usuario actual
function getUsuarioActual() {
    const uid = sessionStorage.getItem('userUID');
    const email = sessionStorage.getItem('userEmail');
    const nombre = sessionStorage.getItem('userNombre');
    const rol = sessionStorage.getItem('userRol');
    
    console.log("📦 getUsuarioActual ->", { uid, email, nombre, rol });
    
    if (!uid || !rol) return null;
    
    return { uid, email, nombre, rol };
}