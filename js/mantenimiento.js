// Configuración de intervalos de mantenimiento
const maintenanceIntervals = {
    'cambio de aceite': {
        dias: 90,
        kilometros: 5000
    },
    'filtros': {
        dias: 180,
        kilometros: 10000
    },
los botones no estan ContentVisibilityAutoStateChangeEvent    'batería': {
        dias: 365,
        kilometros: 30000
    }
};

// Configuración de seguros
const insuranceConfig = {
    warningDays: 30, // Días antes del vencimiento para mostrar advertencia
};

// Configuración de WhatsApp
const whatsappConfig = {
    phoneNumber: null,
    notifications: {
        days30: true,
        days15: true,
        days7: true
    },
    // Configuración de la API de WhatsApp
    api: {
        version: 'v17.0',
        phoneNumberId: 'TU_PHONE_NUMBER_ID', // Reemplazar con tu Phone Number ID
        accessToken: 'TU_ACCESS_TOKEN', // Reemplazar con tu Access Token
        templateName: 'alerta_seguro' // Nombre de tu plantilla aprobada
    }
};

// Configuración de SMS
const smsConfig = {
    phoneNumber: null,
    notifications: {
        days30: true,
        days15: true,
        days7: true
    },
    // Configuración de Twilio (reemplazar con tus credenciales)
    twilio: {
        accountSid: 'TU_ACCOUNT_SID',
        authToken: 'TU_AUTH_TOKEN',
        fromNumber: 'TU_NUMERO_TWILIO'
    }
};

// Datos de muestra (simulación de base de datos)
let maintenanceData = {
    // ... existing maintenance data ...
};

// Datos de vehículos
let vehiclesData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeGrid();
    initializeEventListeners();
    
    // Configurar verificación periódica de vencimientos
    setInterval(checkInsuranceExpirations, 24 * 60 * 60 * 1000); // Verificar cada 24 horas
    checkInsuranceExpirations(); // Verificar inmediatamente
});

function initializeGrid() {
    const grid = document.querySelector('.vehicles-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Crear 20 botones numerados
    for (let i = 1; i <= 20; i++) {
        const card = createEmptyVehicleCard(i);
        grid.appendChild(card);
    }
}

function createEmptyVehicleCard(number) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    
    // Crear input para el número
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'number-input';
    input.value = number;
    input.min = 1;
    input.max = 9999;
    
    // Verificar si existe un vehículo con este número
    const vehicle = vehiclesData.find(v => v.id === number);
    if (vehicle) {
        card.classList.add('active');
        input.title = `${vehicle.brand || ''} - ${vehicle.plate || ''}`;
    } else {
        card.classList.add('empty');
    }
    
    // Agregar el input al card
    card.appendChild(input);
    
    // Si hay un vehículo, agregar el botón de eliminar
    if (vehicle) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        card.appendChild(deleteBtn);
        
        // Evento de click en el botón de eliminar
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteVehicle(number);
        });
    }
    
    // Eventos del input
    input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value > 9999) {
            e.target.value = 9999;
        }
    });

    input.addEventListener('change', (e) => {
        e.stopPropagation();
        const value = parseInt(e.target.value);
        if (value && value >= 1 && value <= 9999) {
            if (vehicle) {
                updateVehicleNumber(number, value);
            }
        }
    });
    
    // Prevenir que el click en el input propague al card
    input.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Evento de click en el card
    card.addEventListener('click', () => {
        if (vehicle) {
            showVehicleDetails(number);
        } else {
            showAddVehicleModal(number);
        }
    });
    
    return card;
}

function showAddVehicleModal(number) {
    const modal = document.getElementById('addVehicleModal');
    if (!modal) return;

    // Establecer el número en el formulario
    const numberInput = document.getElementById('newVehicleNumber');
    numberInput.value = number;
    
    // Limpiar el resto del formulario
    document.getElementById('newVehicleBrand').value = '';
    document.getElementById('newVehicleModel').value = '';
    document.getElementById('newVehicleYear').value = '';
    document.getElementById('newVehiclePlate').value = '';
    document.getElementById('newVehicleColor').value = '';
    document.getElementById('newVehicleVin').value = '';
    document.getElementById('newVehicleEngineType').value = '';
    document.getElementById('newVehicleDisplacement').value = '';
    document.getElementById('newVehicleFuelType').value = 'gasolina';
    document.getElementById('newVehicleMileage').value = '0';
    
    modal.style.display = 'block';
}

function showVehicleDetails(vehicleId) {
    const vehicle = vehiclesData.find(v => v.id === parseInt(vehicleId));
    if (!vehicle) return;

    const modal = document.getElementById('vehicleDetailsModal');
    if (!modal) return;

    // Actualizar el número del vehículo en el título
    const detallesTaxiNumero = document.getElementById('detallesTaxiNumero');
    if (detallesTaxiNumero) {
        detallesTaxiNumero.textContent = vehicle.id;
    }

    // Cargar los datos del vehículo en el formulario
    document.getElementById('currentMileage').value = vehicle.mileage || 0;
    document.getElementById('marcaVehiculo').value = vehicle.brand || '';
    document.getElementById('modeloVehiculo').value = vehicle.model || '';
    document.getElementById('anioVehiculo').value = vehicle.year || '';
    document.getElementById('placaVehiculo').value = vehicle.plate || '';
    document.getElementById('colorVehiculo').value = vehicle.color || '';
    document.getElementById('vinVehiculo').value = vehicle.vin || '';
    document.getElementById('tipoMotor').value = vehicle.engineType || '';
    document.getElementById('cilindrada').value = vehicle.displacement || '';
    document.getElementById('tipoCombustible').value = vehicle.fuelType || 'gasolina';

    modal.style.display = 'block';
}

function initializeEventListeners() {
    // Event listeners para cerrar modales
    document.querySelectorAll('.btn-cerrar, .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Event listener para el formulario de detalles
    const vehicleDetailsForm = document.getElementById('vehicleDetailsForm');
    if (vehicleDetailsForm) {
        vehicleDetailsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const vehicleId = document.getElementById('detallesTaxiNumero').textContent;
            saveVehicleDetails(vehicleId);
        });
    }

    // Event listener para el formulario de nuevo vehículo
    const addVehicleForm = document.getElementById('addVehicleForm');
    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNewVehicle();
        });
    }

    // Botón de actualizar kilometraje
    const updateMileageBtn = document.getElementById('updateMileageBtn');
    if (updateMileageBtn) {
        updateMileageBtn.addEventListener('click', function() {
            const vehicleId = document.getElementById('detallesTaxiNumero').textContent;
            const newMileage = parseInt(document.getElementById('currentMileage').value) || 0;
            updateVehicleMileage(vehicleId, newMileage);
        });
    }

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function updateVehicleNumber(oldId, newId) {
    newId = parseInt(newId);
    if (vehiclesData.some(v => v.id === newId && v.id !== oldId)) {
        alert('Este número ya está en uso');
        initializeGrid();
        return;
    }
    
    const vehicle = vehiclesData.find(v => v.id === oldId);
    if (vehicle) {
        vehicle.id = newId;
        saveData();
        initializeGrid();
    }
}

function updateVehicleMileage(vehicleId, newMileage) {
    const vehicle = vehiclesData.find(v => v.id === parseInt(vehicleId));
    if (!vehicle) return;

    if (newMileage < vehicle.mileage) {
        alert('El nuevo kilometraje no puede ser menor al actual');
        return;
    }

    vehicle.mileage = newMileage;
    saveData();
}

function saveVehicleDetails(vehicleId) {
    const vehicle = vehiclesData.find(v => v.id === parseInt(vehicleId));
    if (!vehicle) return;

    vehicle.brand = document.getElementById('marcaVehiculo').value;
    vehicle.model = document.getElementById('modeloVehiculo').value;
    vehicle.year = parseInt(document.getElementById('anioVehiculo').value);
    vehicle.plate = document.getElementById('placaVehiculo').value;
    vehicle.color = document.getElementById('colorVehiculo').value;
    vehicle.vin = document.getElementById('vinVehiculo').value;
    vehicle.engineType = document.getElementById('tipoMotor').value;
    vehicle.displacement = document.getElementById('cilindrada').value;
    vehicle.fuelType = document.getElementById('tipoCombustible').value;
    vehicle.mileage = parseInt(document.getElementById('currentMileage').value) || 0;

    saveData();
    initializeGrid();
    
    // Cerrar modal
    document.getElementById('vehicleDetailsModal').style.display = 'none';
}

function saveNewVehicle() {
    const vehicleId = parseInt(document.getElementById('newVehicleNumber').value);
    
    if (!vehicleId || vehicleId < 1 || vehicleId > 9999) {
        alert('El número de vehículo debe estar entre 1 y 9999');
        return;
    }
    
    if (vehiclesData.some(v => v.id === vehicleId)) {
        alert('Este número de vehículo ya existe');
        return;
    }

    const newVehicle = {
        id: vehicleId,
        brand: document.getElementById('newVehicleBrand').value,
        model: document.getElementById('newVehicleModel').value,
        year: parseInt(document.getElementById('newVehicleYear').value),
        plate: document.getElementById('newVehiclePlate').value,
        color: document.getElementById('newVehicleColor').value,
        vin: document.getElementById('newVehicleVin').value,
        engineType: document.getElementById('newVehicleEngineType').value,
        displacement: document.getElementById('newVehicleDisplacement').value,
        fuelType: document.getElementById('newVehicleFuelType').value,
        mileage: parseInt(document.getElementById('newVehicleMileage').value) || 0,
        status: 'active'
    };

    vehiclesData.push(newVehicle);
    saveData();
    initializeGrid();

    // Cerrar el modal
    document.getElementById('addVehicleModal').style.display = 'none';
}

function deleteVehicle(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
        vehiclesData = vehiclesData.filter(v => v.id !== id);
        saveData();
        initializeGrid();
    }
}

function saveData() {
    localStorage.setItem('vehiclesData', JSON.stringify(vehiclesData));
}

function loadData() {
    const savedData = localStorage.getItem('vehiclesData');
    if (savedData) {
        try {
            vehiclesData = JSON.parse(savedData);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            vehiclesData = [];
        }
    }
}

function updateMaintenanceProgress(vehicle) {
    const items = document.querySelectorAll('.item-mantenimiento');
    
    items.forEach(item => {
        const tipo = item.querySelector('h4').textContent.toLowerCase();
        const ultimoKm = item.querySelector('.ultimo-km');
        const proximoKm = item.querySelector('.proximo-km');
        const progreso = item.querySelector('.progreso');
        const kmRestantes = item.querySelector('.km-restantes');
        
        // Obtener datos del mantenimiento
        const lastMaintenance = vehicle.lastMaintenance?.[tipo]?.mileage || 0;
        const nextMaintenance = lastMaintenance + (maintenanceIntervals[tipo]?.kilometros || 5000);
        const currentMileage = vehicle.mileage || 0;
        
        // Calcular porcentaje
        const total = nextMaintenance - lastMaintenance;
        const avanzado = currentMileage - lastMaintenance;
        const porcentaje = Math.min(100, Math.max(0, (avanzado / total) * 100));
        
        // Actualizar elementos
        ultimoKm.textContent = lastMaintenance.toLocaleString();
        proximoKm.textContent = nextMaintenance.toLocaleString();
        progreso.style.width = `${porcentaje}%`;
        progreso.dataset.porcentaje = Math.round(porcentaje);
        kmRestantes.textContent = `Faltan ${Math.max(0, nextMaintenance - currentMileage).toLocaleString()} km para el próximo mantenimiento`;
    });
}

function handleMaintenanceAction(vehicleId, type) {
    const vehicle = vehiclesData.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const date = new Date().toISOString();
    let description = '';
    
    switch(type) {
        case 'cambio de aceite':
            description = 'Cambio de aceite realizado';
            break;
        case 'filtros':
            description = 'Cambio de filtros realizado';
            break;
        case 'batería':
            description = 'Cambio de batería realizado';
            break;
        case 'reparacion':
            description = 'Reparación general realizada';
            break;
        case 'emergencia':
            description = 'Atención de emergencia realizada';
            break;
        case 'revision':
            description = 'Revisión técnica completada';
            break;
        case 'seguro':
            description = 'Seguro renovado';
            break;
    }

    // Actualizar última fecha y kilometraje de mantenimiento
    vehicle.lastMaintenance[type] = {
        date: date,
        mileage: vehicle.mileage
    };

    // Calcular próximo mantenimiento por defecto
    vehicle.nextMaintenance[type] = {
        date: new Date(new Date(date).getTime() + maintenanceIntervals[type].dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mileage: vehicle.mileage + maintenanceIntervals[type].kilometros
    };

    // Agregar al historial
    vehicle.maintenanceHistory.unshift({
        date: new Date().toLocaleDateString(),
        type: type,
        description: description,
        mileage: vehicle.mileage
    });

    // Actualizar estado del vehículo
    vehicle.status = 'active';

    // Guardar cambios
    saveData();

    // Actualizar vista
    showVehicleDetails(vehicleId);
}

// Función para mostrar el modal de seguros
function showInsuranceModal() {
    const modal = document.getElementById('insuranceModal');
    const tableBody = document.getElementById('insuranceTableBody');
    tableBody.innerHTML = '';

    vehiclesData.forEach(vehicle => {
        const row = document.createElement('tr');
        const status = getInsuranceStatus(vehicle.insurance?.expirationDate);
        
        row.innerHTML = `
            <td>${vehicle.name}</td>
            <td>${vehicle.plate}</td>
            <td>
                <input type="date" 
                       class="insurance-date" 
                       data-vehicle-id="${vehicle.id}"
                       value="${vehicle.insurance?.expirationDate || ''}"
                       onchange="updateInsuranceDate(${vehicle.id}, this.value)">
            </td>
            <td>
                <span class="status ${status.class}">${status.text}</span>
            </td>
            <td class="actions">
                <button class="btn-update" onclick="renewInsurance(${vehicle.id})">
                    Renovar
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });

    modal.style.display = 'block';
}

// Función para obtener el estado del seguro
function getInsuranceStatus(expirationDate) {
    if (!expirationDate) {
        return { class: 'expired', text: 'Sin registro' };
    }

    const today = new Date();
    const expiration = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
        return { class: 'expired', text: 'Vencido' };
    } else if (daysUntilExpiration <= insuranceConfig.warningDays) {
        return { class: 'warning', text: `Vence en ${daysUntilExpiration} días` };
    } else {
        return { class: 'active', text: 'Vigente' };
    }
}

// Función para actualizar la fecha de vencimiento
function updateInsuranceDate(vehicleId, newDate) {
    const vehicle = vehiclesData.find(v => v.id === vehicleId);
    if (!vehicle) return;

    if (!vehicle.insurance) {
        vehicle.insurance = {
            expirationDate: null,
            lastRenewal: null
        };
    }

    vehicle.insurance.expirationDate = newDate;
    saveData();
    
    // Actualizar el estado en la tabla
    const row = document.querySelector(`input[data-vehicle-id="${vehicleId}"]`).closest('tr');
    const statusCell = row.querySelector('.status');
    const status = getInsuranceStatus(newDate);
    statusCell.className = `status ${status.class}`;
    statusCell.textContent = status.text;
}

// Función para renovar el seguro
function renewInsurance(vehicleId) {
    const vehicle = vehiclesData.find(v => v.id === vehicleId);
    if (!vehicle) return;

    if (!vehicle.insurance) {
        vehicle.insurance = {
            expirationDate: null,
            lastRenewal: null
        };
    }

    // Registrar la renovación en el historial
    const today = new Date().toISOString().split('T')[0];
    vehicle.maintenanceHistory.unshift({
        date: new Date().toLocaleDateString(),
        type: 'seguro',
        description: 'Renovación de seguro',
        mileage: vehicle.mileage
    });

    vehicle.insurance.lastRenewal = today;
    saveData();
    
    alert('Seguro renovado correctamente');
}

// Función para verificar vencimientos y enviar notificaciones
async function checkInsuranceExpirations() {
    if (!whatsappConfig.phoneNumber) return;

    for (const vehicle of vehiclesData) {
        if (vehicle.insurance?.expirationDate) {
            const expiration = new Date(vehicle.insurance.expirationDate);
            const today = new Date();
            const daysUntilExpiration = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));

            let shouldNotify = false;
            if (daysUntilExpiration === 30 && whatsappConfig.notifications.days30) shouldNotify = true;
            if (daysUntilExpiration === 15 && whatsappConfig.notifications.days15) shouldNotify = true;
            if (daysUntilExpiration === 7 && whatsappConfig.notifications.days7) shouldNotify = true;

            if (shouldNotify) {
                const message = `