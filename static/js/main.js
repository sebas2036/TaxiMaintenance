document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const loginForm = document.getElementById('colsaLoginForm');
    const gpsPanel = document.getElementById('gpsPanel');
    const vehiclesTable = document.getElementById('vehiclesTable');
    const vehiclesList = document.getElementById('vehiclesList');
    const startTrackingBtn = document.getElementById('startTracking');
    const stopTrackingBtn = document.getElementById('stopTracking');
    const addVehicleBtn = document.getElementById('addVehicle');
    const refreshVehiclesBtn = document.getElementById('refreshVehicles');
    const addVehicleModal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
    const saveVehicleBtn = document.getElementById('saveVehicle');

    // Variables globales
    let updateInterval;

    // Manejador de login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('loginForm').style.display = 'none';
                gpsPanel.style.display = 'block';
                vehiclesTable.style.display = 'block';
                await refreshVehicles();
            } else {
                alert('Error de login: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });

    // Iniciar seguimiento
    startTrackingBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/api/start-tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ interval: 30 })
            });
            
            const data = await response.json();
            
            if (data.success) {
                startTrackingBtn.disabled = true;
                stopTrackingBtn.disabled = false;
                // Iniciar actualización automática
                updateInterval = setInterval(refreshVehicles, 30000);
            } else {
                alert('Error al iniciar seguimiento: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });

    // Detener seguimiento
    stopTrackingBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/api/stop-tracking', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                startTrackingBtn.disabled = false;
                stopTrackingBtn.disabled = true;
                clearInterval(updateInterval);
            } else {
                alert('Error al detener seguimiento: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });

    // Mostrar modal de agregar vehículo
    addVehicleBtn.addEventListener('click', function() {
        document.getElementById('vehicleId').value = '';
        addVehicleModal.show();
    });

    // Guardar nuevo vehículo
    saveVehicleBtn.addEventListener('click', async function() {
        const vehicleId = document.getElementById('vehicleId').value;
        
        try {
            const response = await fetch(`/api/vehicle/${vehicleId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                addVehicleModal.hide();
                await refreshVehicles();
            } else {
                alert('Error al agregar vehículo: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });

    // Actualizar lista de vehículos
    refreshVehiclesBtn.addEventListener('click', refreshVehicles);

    // Función para actualizar la tabla de vehículos
    async function refreshVehicles() {
        try {
            const response = await fetch('/api/vehicles');
            const data = await response.json();
            
            if (data.success) {
                vehiclesList.innerHTML = '';
                
                Object.entries(data.vehicles).forEach(([id, info]) => {
                    const row = document.createElement('tr');
                    row.className = 'vehicle-row';
                    row.innerHTML = `
                        <td>${id}</td>
                        <td>${info.latitude || '-'}</td>
                        <td>${info.longitude || '-'}</td>
                        <td>${info.speed || '0'} km/h</td>
                        <td><span class="status-${info.status || 'inactive'}">${info.status || 'inactivo'}</span></td>
                        <td>${info.timestamp ? new Date(info.timestamp).toLocaleString() : '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="removeVehicle('${id}')">
                                Eliminar
                            </button>
                        </td>
                    `;
                    vehiclesList.appendChild(row);
                });
            } else {
                alert('Error al obtener vehículos: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    }

    // Función global para eliminar vehículo
    window.removeVehicle = async function(vehicleId) {
        if (!confirm('¿Está seguro de eliminar este vehículo?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/vehicle/${vehicleId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                await refreshVehicles();
            } else {
                alert('Error al eliminar vehículo: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    };
});

// Configuración global
let colsaClient = null;
let updateInterval = null;

// Función para inicializar el cliente de Colsa
async function initColsaClient() {
    const config = JSON.parse(localStorage.getItem('gpsConfig')) || {};
    if (!config.username || !config.password) {
        alert('Por favor, configure primero sus credenciales de Colsa');
        openGPSConfigModal();
        return false;
    }

    try {
        const response = await fetch('/api/init-colsa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: config.username,
                password: config.password,
                interval: config.updateInterval || 30
            })
        });

        const data = await response.json();
        if (data.success) {
            return true;
        } else {
            alert('Error al inicializar Colsa: ' + data.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
        return false;
    }
}

// Event listener para el botón Vista GPS
document.querySelector('.gps-view-btn').addEventListener('click', async function() {
    const config = JSON.parse(localStorage.getItem('gpsConfig')) || {};
    
    if (!config.enabled) {
        alert('El seguimiento GPS no está habilitado. Por favor, configure el GPS primero.');
        openGPSConfigModal();
        return;
    }

    if (config.provider !== 'colsa') {
        alert('Esta función solo está disponible para el proveedor Colsa.');
        return;
    }

    // Intentar inicializar el cliente si no existe
    if (!colsaClient && !(await initColsaClient())) {
        return;
    }

    // Abrir la ventana de Colsa
    const colsaWindow = window.open('https://www.colsa.com.ar', '_blank');
    if (!colsaWindow) {
        alert('El navegador bloqueó la apertura de la ventana. Por favor, permita las ventanas emergentes.');
        return;
    }

    // Esperar a que la página cargue
    setTimeout(() => {
        try {
            // Enviar credenciales para login automático
            colsaWindow.postMessage({
                type: 'COLSA_LOGIN',
                credentials: {
                    username: config.username,
                    password: config.password
                }
            }, 'https://www.colsa.com.ar');
        } catch (error) {
            console.error('Error al enviar credenciales:', error);
        }
    }, 2000);
});

// Event listener para el formulario de configuración GPS
document.getElementById('gpsConfigForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const provider = document.getElementById('gpsProvider').value;
    const username = document.getElementById('gpsUsername').value;
    const password = document.getElementById('gpsPassword').value;
    const apiKey = document.getElementById('gpsApiKey').value;
    const updateInterval = parseInt(document.getElementById('gpsUpdateInterval').value);
    const enabled = document.getElementById('gpsEnabled').checked;

    // Guardar configuración
    const config = {
        provider,
        username,
        password,
        apiKey,
        updateInterval,
        enabled
    };
    
    localStorage.setItem('gpsConfig', JSON.stringify(config));

    // Si está habilitado y es Colsa, inicializar el cliente
    if (enabled && provider === 'colsa') {
        if (await initColsaClient()) {
            alert('Configuración guardada y conexión establecida con Colsa');
        }
    }

    closeGPSConfigModal();
});

// Función para abrir el modal de configuración GPS
function openGPSConfigModal() {
    const modal = document.getElementById('gpsConfigModal');
    modal.style.display = 'block';
    
    // Cargar configuración guardada
    const config = JSON.parse(localStorage.getItem('gpsConfig')) || {};
    if (config.provider) {
        document.getElementById('gpsProvider').value = config.provider;
        document.getElementById('gpsUsername').value = config.username || '';
        document.getElementById('gpsPassword').value = config.password || '';
        document.getElementById('gpsApiKey').value = config.apiKey || '';
        document.getElementById('gpsUpdateInterval').value = config.updateInterval || 30;
        document.getElementById('gpsEnabled').checked = config.enabled || false;
    }
}

// Función para cerrar el modal de configuración GPS
function closeGPSConfigModal() {
    const modal = document.getElementById('gpsConfigModal');
    modal.style.display = 'none';
}

// Event listeners para los botones de cerrar modales
document.querySelectorAll('.close-modal-btn').forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
}); 