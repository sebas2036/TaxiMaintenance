function addNewMaintenanceType() {
    // Obtener el taxi actual del panel de detalles
    const panel = document.querySelector('.detail-panel');
    const taxiId = panel.getAttribute('data-taxi-id');
    const taxi = taxiData.find(t => t.id === taxiId);

    if (!taxi) {
        alert('Por favor, seleccione un taxi primero.');
        return;
    }

    // Generar un nombre único basado en la fecha y hora
    const fecha = new Date();
    const nombre = `Mantenimiento ${fecha.getHours()}:${fecha.getMinutes()}`;

    // Generar una clave única basada en el timestamp
    const timestamp = Date.now();
    const key = `mantenimiento_${timestamp}`;

    // Crear el nuevo mantenimiento
    const newMaintenance = {
        title: nombre,
        lastDate: 'No registrado',
        kmSinceLastService: 0,
        nextServiceKm: 5000,
        type: 'ok',
        timestamp: timestamp
    };

    // Inicializar el objeto maintenance si no existe
    if (!taxi.maintenance) {
        taxi.maintenance = {};
    }

    // Crear un nuevo objeto con el mantenimiento al principio
    const updatedMaintenance = {
        [key]: newMaintenance
    };

    // Copiar los mantenimientos existentes después del nuevo
    Object.keys(taxi.maintenance).forEach(k => {
        updatedMaintenance[k] = taxi.maintenance[k];
    });

    // Actualizar los mantenimientos del taxi
    taxi.maintenance = updatedMaintenance;

    // Actualizar el estado del taxi
    taxi.status = calculateMaintenanceStatus(taxi.maintenance);

    // Actualizar la interfaz
    updateTaxiCard(taxi);
    showTaxiDetails(taxi);

    // Guardar los cambios
    saveTaxiData();
}

function showTaxiDetails(taxi) {
    const panel = document.querySelector('.detail-panel');
    const overlay = document.querySelector('.overlay');
    const panelTitle = panel.querySelector('.panel-title');
    
    // Calcular el estado actual
    const currentStatus = calculateMaintenanceStatus(taxi.maintenance);
    taxi.status = currentStatus;
    
    // Actualizar la tarjeta correspondiente para mantener la sincronización
    updateTaxiCard(taxi);
    
    // Guardar el ID del taxi actual en el panel
    panel.setAttribute('data-taxi-id', taxi.id);
    
    // Asegurar que el panel esté visible antes de actualizar el contenido
    panel.style.display = 'block';
    
    // Actualizar título y datos generales
    panelTitle.textContent = `Taxi ${taxi.id}`;

    // Crear la lista de mantenimientos
    const maintenanceSection = panel.querySelector('.maintenance-section');
    maintenanceSection.innerHTML = `
        <div class="maintenance-header">
            <h3>Mantenimientos</h3>
            <button class="add-maintenance-btn" id="addNewMaintenanceBtn">
                <i class="fas fa-plus"></i> Nuevo Mantenimiento
            </button>
        </div>
        <div class="maintenance-list">
            ${Object.entries(taxi.maintenance || {}).map(([key, maint]) => {
                const progress = (maint.kmSinceLastService / maint.nextServiceKm) * 100;
                return `
                    <div class="maintenance-item" data-maintenance-key="${key}">
                        <div class="maintenance-header">
                            <div class="maintenance-title">${maint.title}</div>
                            <div class="maintenance-date">Último: ${maint.lastDate}</div>
                        </div>
                        <div class="maintenance-km">
                            Kilómetros desde último servicio: 
                            <span class="editable-km" data-field="kmSinceLastService">${maint.kmSinceLastService}</span> km
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill progress-${maint.type}" 
                                 style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                        <div class="next-service">
                            <i class="fas fa-wrench"></i>
                            Próximo servicio: ${maint.nextServiceKm} km
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // Agregar event listener para el botón de nuevo mantenimiento
    const addNewMaintenanceBtn = maintenanceSection.querySelector('#addNewMaintenanceBtn');
    if (addNewMaintenanceBtn) {
        addNewMaintenanceBtn.addEventListener('click', addNewMaintenanceType);
    }

    // Mostrar panel y overlay con animación
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        panel.classList.add('active');
    });
}

// Función para crear el calendario
function createDatePicker(date, onSelect) {
    const datePicker = document.createElement('div');
    datePicker.className = 'date-picker';
    
    // Convertir la fecha actual a objeto Date
    const currentDate = date ? new Date(date.split('/').reverse().join('-')) : new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    function updateCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        datePicker.innerHTML = `
            <div class="header">
                <button class="prev-year">&lt;&lt;</button>
                <button class="prev-month">&lt;</button>
                <span>${monthNames[currentMonth]} ${currentYear}</span>
                <button class="next-month">&gt;</button>
                <button class="next-year">&gt;&gt;</button>
            </div>
            <div class="calendar">
                <div class="day-name">Do</div>
                <div class="day-name">Lu</div>
                <div class="day-name">Ma</div>
                <div class="day-name">Mi</div>
                <div class="day-name">Ju</div>
                <div class="day-name">Vi</div>
                <div class="day-name">Sa</div>
                ${Array(42).fill(0).map((_, i) => {
                    const day = i - startingDay + 1;
                    const isCurrentMonth = day > 0 && day <= monthLength;
                    const isToday = isCurrentMonth && 
                        currentYear === new Date().getFullYear() && 
                        currentMonth === new Date().getMonth() && 
                        day === new Date().getDate();
                    const isSelected = isCurrentMonth && 
                        currentYear === currentDate.getFullYear() && 
                        currentMonth === currentDate.getMonth() && 
                        day === currentDate.getDate();
                    
                    if (!isCurrentMonth) {
                        return `<div class="day other-month"></div>`;
                    }
                    
                    return `
                        <div class="day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                             data-date="${day}/${currentMonth + 1}/${currentYear}">
                            ${day}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Event listeners para los botones de navegación
        const prevYearBtn = datePicker.querySelector('.prev-year');
        const nextYearBtn = datePicker.querySelector('.next-year');
        const prevMonthBtn = datePicker.querySelector('.prev-month');
        const nextMonthBtn = datePicker.querySelector('.next-month');
        
        if (prevYearBtn) {
            prevYearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentYear--;
                updateCalendar();
            });
        }
        
        if (nextYearBtn) {
            nextYearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentYear++;
                updateCalendar();
            });
        }
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                updateCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                updateCalendar();
            });
        }
        
        // Event listeners para los días
        datePicker.querySelectorAll('.day:not(.other-month)').forEach(day => {
            day.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const selectedDate = day.dataset.date.split('/');
                const formattedDate = `${selectedDate[0].padStart(2, '0')}/${selectedDate[1].padStart(2, '0')}/${selectedDate[2]}`;
                onSelect(formattedDate);
                datePicker.remove();
            });
        });
    }
    
    updateCalendar();
    return datePicker;
} 