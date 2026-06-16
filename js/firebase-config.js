// CONFIG: Pega tu configuración de Firebase aquí
const firebaseConfig = {
  // TODO: Reemplaza estos valores con tu configuración real de Firebase
    apiKey: "AIzaSyDBJFWiHUxDAHCpzMsPYoK4t4pqP4UfmYQ",
    authDomain: "aula-virtual-c580b.firebaseapp.com",
    projectId: "aula-virtual-c580b",
    storageBucket: "aula-virtual-c580b.firebasestorage.app",
    messagingSenderId: "634153384044",
    appId: "1:634153384044:web:62a2a3ad9ecfd497e94049"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar servicios
const auth = firebase.auth();
const db = firebase.firestore();