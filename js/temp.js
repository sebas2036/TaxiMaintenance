adaptar la // Función para calcular el próximo servicio
function calculateNextService(maintenanceKey, lastDate, currentKm = null) {
    const interval = maintenanceIntervals[maintenanceKey];
    if (!interval || !lastDate || lastDate === 'No registrado') return null;

    // Calcular kilómetros desde el último servicio
    const kmSinceLastService = currentKm !== null ? currentKm : calculateKmSinceLastService(lastDate);
    
    // Calcular kilómetros restantes hasta el próximo servicio
    const kmRestantes = interval.kilometros - (kmSinceLastService % interval.kilometros);
    
    // Calcular días restantes basado en los kilómetros restantes
    const diasHastaProximoServicio = Math.max(0, Math.ceil(kmRestantes / KM_PER_DAY));
    
    // Calcular la fecha del próximo servicio
    const today = new Date();
    const nextServiceDate = new Date(today);
    nextServiceDate.setDate(today.getDate() + diasHastaProximoServicio);

    return {
        km: interval.kilometros,
        date: nextServiceDate,
        kmSinceLastService: kmSinceLastService,
        diasRestantes: diasHastaProximoServicio,
        kmRestantes: kmRestantes
    };
}

// Función para crear el selector de fecha
function createDatePicker(input) {
    const datePicker = document.createElement('div');
    datePicker.className = 'date-picker';
    
    // Obtener la fecha actual del sistema
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    function updateCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        
        // Crear el encabezado del calendario
        datePicker.innerHTML = `
            <div class="header">
                <button class="prev-year"><<</button>
                <button class="prev-month"><</button>
                <span>${firstDay.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
                <button class="next-month">></button>
                <button class="next-year">>></button>
            </div>
            <div class="calendar">
                <div class="day-name">Dom</div>
                <div class="day-name">Lun</div>
                <div class="day-name">Mar</div>
                <div class="day-name">Mié</div>
                <div class="day-name">Jue</div>
                <div class="day-name">Vie</div>
                <div class="day-name">Sáb</div>
            </div>
        `;

        const calendar = datePicker.querySelector('.calendar');
        
        // Agregar días del mes anterior
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.textContent = new Date(currentYear, currentMonth, 0).getDate() - i;
            calendar.appendChild(day);
        }

        // Agregar días del mes actual
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.textContent = i;
            
            // Marcar el día actual
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                i === today.getDate()) {
                day.classList.add('today');
            }
            
            // Evento de clic para seleccionar fecha
            day.addEventListener('click', () => {
                const selectedDate = new Date(currentYear, currentMonth, i);
                const formattedDate = selectedDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                input.textContent = formattedDate;
                
                // Disparar evento de selección
                const event = new Event('dateSelected');
                input.dispatchEvent(event);
                
                // Remover el calendario
                datePicker.remove();
            });
            
            calendar.appendChild(day);
        }

        // Agregar días del mes siguiente
        const totalDays = calendar.children.length;
        const remainingDays = 42 - totalDays;
        for (let i = 1; i <= remainingDays; i++) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.textContent = i;
            calendar.appendChild(day);
        }
    }

    // Actualizar el calendario inicialmente
    updateCalendar();

    // Eventos de navegación
    datePicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('prev-month')) {
            e.stopPropagation();
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            updateCalendar();
        }
        
        if (e.target.classList.contains('next-month')) {
            e.stopPropagation();
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            updateCalendar();
        }
        
        if (e.target.classList.contains('prev-year')) {
            e.stopPropagation();
            currentYear--;
            updateCalendar();
        }
        
        if (e.target.classList.contains('next-year')) {
            e.stopPropagation();
            currentYear++;
            updateCalendar();
        }
    });

    // Cerrar el calendario al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!datePicker.contains(e.target) && e.target !== input) {
            datePicker.remove();
        }
    });

    return datePicker;
}

// Función para actualizar el mantenimiento cuando cambia la fecha
function updateMaintenanceFromDate(taxi, maintenanceKey, newDate) {
    const today = new Date();
    const selectedDate = new Date(newDate.split('/').reverse().join('-'));
    const daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));
    
    // Actualizar fecha y kilómetros
    taxi.maintenance[maintenanceKey].lastDate = newDate;
    taxi.maintenance[maintenanceKey].kmSinceLastService = daysDiff * KM_PER_DAY;
    
    // Recalcular próximo servicio
    const nextService = calculateNextService(maintenanceKey, newDate, daysDiff * KM_PER_DAY);
    
    if (nextService) {
        taxi.maintenance[maintenanceKey].nextServiceKm = nextService.km;
        taxi.maintenance[maintenanceKey].nextServiceDate = nextService.date.toLocaleDateString('es-ES');
        taxi.maintenance[maintenanceKey].diasRestantes = nextService.diasRestantes;
    }
}

// Función para actualizar el mantenimiento cuando cambian los kilómetros
function updateMaintenanceFromKm(taxi, maintenanceKey, newKm) {
    // Actualizar kilómetros
    taxi.maintenance[maintenanceKey].kmSinceLastService = newKm;
    
    // Recalcular próximo servicio
    const nextService = calculateNextService(
        maintenanceKey,
        taxi.maintenance[maintenanceKey].lastDate,
        newKm
    );
    
    if (nextService) {
        taxi.maintenance[maintenanceKey].nextServiceKm = nextService.km;
        taxi.maintenance[maintenanceKey].nextServiceDate = nextService.date.toLocaleDateString('es-ES');
        taxi.maintenance[maintenanceKey].diasRestantes = nextService.diasRestantes;
    }
}

// Función para actualizar el estado del taxi
function updateTaxiStatus(taxi) {
    let worstStatus = 'ok';
    
    Object.entries(taxi.maintenance).forEach(([key, maint]) => {
        if (maint.lastDate && maint.lastDate !== 'No registrado') {
            const nextService = calculateNextService(key, maint.lastDate, maint.kmSinceLastService);
            if (nextService) {
                // Actualizar kilómetros y fechas
                maint.kmSinceLastService = nextService.kmSinceLastService;
                maint.nextServiceKm = nextService.km;
                maint.nextServiceDate = nextService.date.toLocaleDateString('es-ES');
                maint.diasRestantes = nextService.diasRestantes;

                // Calcular el progreso basado en el intervalo de mantenimiento
                const interval = maintenanceIntervals[key];
                const progress = (maint.kmSinceLastService % interval.kilometros) / interval.kilometros * 100;
                
                if (progress >= 100) {
                    maint.type = 'danger';
                    worstStatus = 'danger';
                } else if (progress >= 90) {
                    maint.type = 'warning';
                    if (worstStatus !== 'danger') worstStatus = 'warning';
                } else {
                    maint.type = 'ok';
                }
            }
        }
    });

    // Actualizar el estado general del taxi
    taxi.status = worstStatus;
} 