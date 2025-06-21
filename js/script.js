document.addEventListener('DOMContentLoaded', () => {
    // 1. OBTENER Y VALIDAR EL USUARIO DESDE LA SESIÓN
    let loggedInUser = null;
    try {
        loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    } catch (error) {
        console.error("Error al leer los datos de la sesión:", error);
        // Si hay un error, redirigimos como si no hubiera sesión.
        window.location.href = 'login.html';
        return;
    }

    // 2. VERIFICACIÓN DE SEGURIDAD
    if (!loggedInUser) {
        console.log("No se encontró usuario en la sesión. Redirigiendo a login.");
        window.location.href = 'login.html';
        return;
    }
    
    // --> ¡PASO DE DEPURACIÓN CLAVE! <--
    console.log("Usuario logueado correctamente:", loggedInUser);

    // 3. LÓGICA DE CERRAR SESIÓN
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });
    
    // --- CÁLCULOS INICIALES (con verificación de seguridad) ---
    if (loggedInUser.asignaturas && Array.isArray(loggedInUser.asignaturas)) {
        loggedInUser.asignaturas.forEach(asignatura => {
            if (asignatura.notas && Array.isArray(asignatura.notas)) {
                const totalNotas = asignatura.notas.reduce((sum, nota) => sum + (nota.nota || 0), 0);
                asignatura.promedio = (totalNotas / (asignatura.notas.length || 1)).toFixed(1);
            } else {
                asignatura.promedio = "N/A"; // Asignar un valor por defecto si no hay notas
            }
        });
    }

    // --- ELEMENTOS DEL DOM ---
    const navResumen = document.getElementById('nav-resumen');
    const navPerfil = document.getElementById('nav-perfil');
    const resumenView = document.getElementById('resumen-view');
    const perfilView = document.getElementById('perfil-view');
    const filterSelect = document.getElementById('filter-subject');
    const subjectListContainer = document.getElementById('subject-list');

    // --- FUNCIONES DE RENDERIZADO (AHORA MÁS ROBUSTAS) ---
    function renderProfile() {
        console.log("Renderizando perfil...");
        // Usamos || '' para evitar errores si una propiedad es undefined. Mostrará un texto vacío.
        document.getElementById('perfil-nombre').textContent = loggedInUser.name || 'Nombre no disponible';
        document.getElementById('perfil-seccion').textContent = loggedInUser.seccion || 'Sección no disponible';
        
        const materiasList = document.getElementById('perfil-materias');
        materiasList.innerHTML = '';
        if (loggedInUser.asignaturas && loggedInUser.asignaturas.length > 0) {
            loggedInUser.asignaturas.forEach(asignatura => {
                const li = document.createElement('li');
                li.textContent = asignatura.nombre || 'Asignatura sin nombre';
                materiasList.appendChild(li);
            });
        } else {
            materiasList.innerHTML = '<li>No hay asignaturas inscritas.</li>';
        }
        console.log("Perfil renderizado.");
    }
    
    // Las demás funciones (renderSummary, createMainChart, etc.) deberían funcionar bien con las verificaciones ya hechas.
    // Las dejo como estaban en el código anterior porque dependen de los cálculos que ya hemos protegido.
    function renderSummary() {
        if (!loggedInUser.asignaturas || loggedInUser.asignaturas.length === 0) {
            document.getElementById('avg-general').textContent = 'N/A';
            document.getElementById('avg-aprobadas').textContent = '0 / 0';
            document.getElementById('mejor-ramo').textContent = 'N/A';
            return;
        }
        const totalAsignaturas = loggedInUser.asignaturas.length;
        const promedios = loggedInUser.asignaturas.map(a => parseFloat(a.promedio)).filter(p => !isNaN(p));
        if (promedios.length === 0) {
            document.getElementById('avg-general').textContent = 'N/A';
            document.getElementById('avg-aprobadas').textContent = '0 / ' + totalAsignaturas;
            document.getElementById('mejor-ramo').textContent = 'N/A';
            return;
        }
        const promedioGeneral = (promedios.reduce((sum, p) => sum + p, 0) / promedios.length).toFixed(1);
        const aprobadas = loggedInUser.asignaturas.filter(a => parseFloat(a.promedio) >= 4.0).length;
        const mejorAsignatura = loggedInUser.asignaturas.reduce((mejor, actual) => (parseFloat(actual.promedio) || 0) > (parseFloat(mejor.promedio) || 0) ? actual : mejor);

        document.getElementById('avg-general').textContent = promedioGeneral;
        document.getElementById('avg-aprobadas').textContent = `${aprobadas} / ${totalAsignaturas}`;
        document.getElementById('mejor-ramo').textContent = mejorAsignatura.nombre;
    }

    function createMainChart() {
        if (!loggedInUser.asignaturas || loggedInUser.asignaturas.length === 0) return;
        const ctx = document.getElementById('gradeChart').getContext('2d');
        const labels = loggedInUser.asignaturas.map(a => a.nombre);
        const data = loggedInUser.asignaturas.map(a => a.promedio);
        new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Promedio Final', data: data, backgroundColor: ['rgba(0, 95, 115, 0.7)', 'rgba(10, 147, 150, 0.7)', 'rgba(148, 210, 189, 0.7)'], borderColor: ['rgba(0, 95, 115, 1)', 'rgba(10, 147, 150, 1)', 'rgba(148, 210, 189, 1)'], borderWidth: 1 }] }, options: { scales: { y: { beginAtZero: true, max: 7.0 } }, responsive: true, maintainAspectRatio: false } });
    }

    function populateFilter() {
        if (!loggedInUser.asignaturas) return;
        loggedInUser.asignaturas.forEach(asignatura => {
            const option = document.createElement('option');
            option.value = asignatura.id;
            option.textContent = asignatura.nombre;
            filterSelect.appendChild(option);
        });
    }

    function renderSubjectList(filter = 'todos') {
        if (!loggedInUser.asignaturas) return;
        subjectListContainer.innerHTML = '';
        const asignaturasAMostrar = (filter === 'todos') ? loggedInUser.asignaturas : loggedInUser.asignaturas.filter(a => a.id === filter);
        asignaturasAMostrar.forEach(asignatura => {
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'subject-item';
            let notasHTML = '<ul>';
            if (asignatura.notas) {
                asignatura.notas.forEach(nota => { notasHTML += `<li><span>${nota.evaluacion}</span><strong>${(nota.nota || 0).toFixed(1)}</strong></li>`; });
            }
            notasHTML += '</ul>';
            subjectDiv.innerHTML = `<h4><span>${asignatura.nombre}</span><span class="promedio">Promedio: ${asignatura.promedio}</span></h4>${notasHTML}`;
            subjectListContainer.appendChild(subjectDiv);
        });
    }
    
    // --- EVENT LISTENERS ---
    navResumen.addEventListener('click', (e) => { e.preventDefault(); resumenView.classList.remove('hidden'); perfilView.classList.add('hidden'); navResumen.classList.add('active'); navPerfil.classList.remove('active'); });
    navPerfil.addEventListener('click', (e) => { e.preventDefault(); resumenView.classList.add('hidden'); perfilView.classList.remove('hidden'); navResumen.classList.remove('active'); navPerfil.classList.add('active'); });
    filterSelect.addEventListener('change', (e) => { renderSubjectList(e.target.value); });

    // --- INICIALIZACIÓN ---
    function init() {
        renderProfile();
        renderSummary();
        createMainChart();
        populateFilter();
        renderSubjectList();
    }
    init();
});