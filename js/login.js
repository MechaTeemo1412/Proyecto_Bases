document.addEventListener('DOMContentLoaded', () => {
    // --- SIMULACIÓN DE BASE DE DATOS DE USUARIOS ---
    // En una aplicación real, esto estaría en un servidor.
    // La clave es el email del usuario.
    const DATABASE = {
        "r.lehuey@instituto.com": {
            password: "123",
            name: "Robinson Lehuey",
            seccion: "002D",
            asignaturas: [
                { id: "prog", nombre: "Fundamentos de Programación", notas: [{ evaluacion: "Parcial 1", nota: 5.5 }, { evaluacion: "Parcial 2", nota: 6.8 }, { evaluacion: "parcial 3", nota: 4.9 }, { evaluacion: "Examen", nota: 6.0 }] },
                { id: "bases", nombre: "Bases de Innovación", notas: [{ evaluacion: "Parcial 1", nota: 6.2 }, { evaluacion: "Parcial 2", nota: 7.0 }, { evaluacion: "Parcial 3", nota: 6.5 }, { evaluacion: "Examen", nota: 6.0}] },
                { id: "cloud", nombre: "Cloud computing", notas: [{ evaluacion: "Parcial 1", nota: 4.0 }, { evaluacion: "Parcial 2", nota: 3.5 }, { evaluacion: "Parcial 3", nota: 4.8 }, { evaluacion: "Examen", nota: 5.8 }] }
            ]
        },
        "alan.vidal@duocuc.cl": {
            password: "alan1412",
            name: "Alan Vidal",
            seccion: "002D",
            asignaturas: [
                { id: "prog", nombre: "Fundamentos de Programación", notas: [{ evaluacion: "Parcial 1", nota: 7.0 }, { evaluacion: "Parcial 2", nota: 6.5 }, { evaluacion: "parcial 3", nota: 6.8 }, { evaluacion: "Examen", nota: 6.9 }] },
                { id: "cloud", nombre: "Cloud computing", notas: [{ evaluacion: "Parcial 1", nota: 6.1 }, { evaluacion: "Parcial 2", nota: 5.5 }, { evaluacion: "Parcial 3", nota: 6.0 }, { evaluacion: "Examen", nota: 6.2 }] }
            ]
        }
    };
    // Guardamos la base de datos en localStorage si no existe, para poder añadir nuevos usuarios.
    if (!localStorage.getItem('userDatabase')) {
        localStorage.setItem('userDatabase', JSON.stringify(DATABASE));
    }
    const getUserDatabase = () => JSON.parse(localStorage.getItem('userDatabase'));
    const saveUserDatabase = (db) => localStorage.setItem('userDatabase', JSON.stringify(db));


    // Vistas y formularios
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginGoogleBtn = document.getElementById('login-google');
    const signupGoogleBtn = document.getElementById('signup-google');

    // --- MANEJO DE VISTAS ---
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
    });
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    // --- MANEJO DE FORMULARIOS ---
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const db = getUserDatabase();
        if (db[email]) {
            alert('El correo electrónico ya está registrado.');
            return;
        }

        // Crear nuevo usuario con datos vacíos y guardarlo en nuestra "BD"
        db[email] = { name, password, seccion: "Sin sección", asignaturas: [] };
        saveUserDatabase(db);

        alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
        signupForm.reset();
        showLoginLink.click();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const db = getUserDatabase();
        const userProfile = db[email];

        if (userProfile && userProfile.password === password) {
            // ¡ÉXITO! Guardamos el perfil COMPLETO del usuario en la sesión.
            sessionStorage.setItem('loggedInUser', JSON.stringify(userProfile));
            window.location.href = 'index.html'; // Redirigir al portal
        } else {
            alert('Correo o contraseña incorrectos.');
        }
    });

    // --- SIMULACIÓN DE LOGIN CON GOOGLE ---
    const loginWithGoogle = () => {
        alert("Simulando inicio de sesión con Google...");
        const googleUser = {
            name: "Usuario de Google",
            seccion: "Invitado",
            asignaturas: [] // Un usuario de Google no tendría notas en nuestro sistema
        };
        sessionStorage.setItem('loggedInUser', JSON.stringify(googleUser));
        window.location.href = 'index.html';
    };
    loginGoogleBtn.addEventListener('click', loginWithGoogle);
    signupGoogleBtn.addEventListener('click', loginWithGoogle);
});
