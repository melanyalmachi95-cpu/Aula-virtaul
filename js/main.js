// Archivo principal para manejar eventos
document.addEventListener('DOMContentLoaded', function() {
    // Registro form
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nombre = document.getElementById('registroNombre').value;
            const email = document.getElementById('registroEmail').value;
            const password = document.getElementById('registroPassword').value;
            const rol = document.getElementById('registroRol').value;
            
            const exito = await registrarUsuario(email, password, nombre, rol);
            if (exito) {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const rol = await loginUsuario(email, password);
            if (rol === 'profesor') {
                window.location.href = 'profesor.html';
            } else if (rol === 'alumno') {
                window.location.href = 'alumno.html';
            }
        });
    }
    
    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            const exito = await cerrarSesion();
            if (exito) {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Crear tarea form
    const crearTareaForm = document.getElementById('crearTareaForm');
    if (crearTareaForm) {
        crearTareaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const titulo = document.getElementById('tareaTitulo').value;
            const descripcion = document.getElementById('tareaDescripcion').value;
            const fechaLimite = document.getElementById('tareaFechaLimite').value;
            
            const exito = await crearTarea(titulo, descripcion, fechaLimite);
            if (exito) {
                crearTareaForm.reset();
                // Actualizar la lista de tareas
                await mostrarTareas('listaTareasProfesor');
            }
        });
    }
    
    // Mostrar bienvenida y tareas en páginas de profesor/alumno
    const bienvenidaProfesor = document.getElementById('bienvenidaProfesor');
    const bienvenidaAlumno = document.getElementById('bienvenidaAlumno');
    const usuario = getUsuarioActual();
    
    if (bienvenidaProfesor) {
        if (!usuario || usuario.rol !== 'profesor') {
            window.location.href = 'index.html';
            return;
        }
        bienvenidaProfesor.textContent = `Bienvenido Profesor ${usuario.nombre}`;
        mostrarTareas('listaTareasProfesor');
    }
    
    if (bienvenidaAlumno) {
        if (!usuario || usuario.rol !== 'alumno') {
            window.location.href = 'index.html';
            return;
        }
        bienvenidaAlumno.textContent = `Bienvenido Alumno ${usuario.nombre}`;
        mostrarTareas('listaTareasAlumno');
    }
    
    // Redirigir si ya está logueado en login/registro
    if (loginForm || registroForm) {
        if (usuario && usuario.rol) {
            if (usuario.rol === 'profesor') {
                window.location.href = 'profesor.html';
            } else if (usuario.rol === 'alumno') {
                window.location.href = 'alumno.html';
            }
        }
    }
});