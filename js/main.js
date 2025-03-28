document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const taxiGrid = document.getElementById('taxi-grid');
    const detailPanel = document.querySelector('.detail-panel');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.close-btn');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const addTaxiBtn = document.querySelector('.add-taxi-btn');

    // Datos de ejemplo
    let taxiData = [
        {
            id: 'TX-130',
            model: 'Toyota Corolla',
            year: 2022,
            domain: 'AB130CD',
            status: 'danger',
            maintenance: {
                'aceite': {
                    title: 'Aceite y Filtros',
                    lastDate: '01/03/2024',
                    kmSinceLastService: 5500,
                    nextServiceKm: 5000,
                    type: 'danger'
                },
                'neumaticos': {
                    title: 'Neumáticos',
                    lastDate: '01/02/2024',
                    kmSinceLastService: 16000,
                    nextServiceKm: 15000,
                    type: 'danger'
                },
                'bateria': {
                    title: 'Batería',
                    lastDate: '15/01/2024',
                    kmSinceLastService: 21000,
                    nextServiceKm: 20000,
                    type: 'danger'
                },
                'distribucion': {
                    title: 'Distribución',
                    lastDate: '01/01/2024',
                    kmSinceLastService: 52000,
                    nextServiceKm: 50000,
                    type: 'danger'
                }
            }
        },
        {
            id: 'TX-1001',
            model: 'Toyota Corolla',
            year: 2023,
            domain: 'AB123CD',
            status: 'ok',
            maintenance: {
                'aceite': {
                    title: 'Aceite y Filtros',
                    lastDate: '01/03/2024',
                    kmSinceLastService: 2500,
                    nextServiceKm: 5000,
                    type: 'ok'
                },
                'neumaticos': {
                    title: 'Neumáticos',
                    lastDate: '01/02/2024',
                    kmSinceLastService: 12000,
                    nextServiceKm: 15000,
                    type: 'warning'
                },
                'bateria': {
                    title: 'Batería',
                    lastDate: '15/01/2024',
                    kmSinceLastService: 8000,
                    nextServiceKm: 20000,
                    type: 'ok'
                },
                'distribucion': {
                    title: 'Distribución',
                    lastDate: '01/01/2024',
                    kmSinceLastService: 30000,
                    nextServiceKm: 60000,
                    type: 'ok'
                }
            }
        },
        {
            id: 'TX-1002',
            model: 'Nissan Versa',
            year: 2022,
            domain: 'CD456EF',
            status: 'warning',
            maintenance: {
                'aceite': {
                    title: 'Aceite y Filtros',
                    lastDate: '14/02/2024',
                    kmSinceLastService: 4800,
                    nextServiceKm: 5000,
                    type: 'warning'
                },
                'neumaticos': {
                    title: 'Neumáticos',
                    lastDate: '10/01/2024',
                    kmSinceLastService: 14000,
                    nextServiceKm: 15000,
                    type: 'warning'
                },
                'bateria': {
                    title: 'Batería',
                    lastDate: '01/12/2023',
                    kmSinceLastService: 18000,
                    nextServiceKm: 20000,
                    type: 'warning'
                },
                'distribucion': {
                    title: 'Distribución',
                    lastDate: '10/01/2024',
                    kmSinceLastService: 48000,
                    nextServiceKm: 50000,
                    type: 'warning'
                }
            }
        },
        {
            id: 'TX-1003',
            model: 'Chevrolet Onix',
            year: 2021,
            domain: 'EF789GH',
            status: 'danger',
            maintenance: {
                'aceite': {
                    title: 'Aceite y Filtros',
                    lastDate: '10/12/2023',
                    kmSinceLastService: 5500,
                    nextServiceKm: 5000,
                    type: 'danger'
                },
                'neumaticos': {
                    title: 'Neumáticos',
                    lastDate: '15/11/2023',
                    kmSinceLastService: 16000,
                    nextServiceKm: 15000,
                    type: 'danger'
                },
                'bateria': {
                    title: 'Batería',
                    lastDate: '01/11/2023',
                    kmSinceLastService: 21000,
                    nextServiceKm: 20000,
                    type: 'danger'
                },
                'distribucion': {
                    title: 'Distribución',
                    lastDate: '01/10/2023',
                    kmSinceLastService: 52000,
                    nextServiceKm: 50000,
                    type: 'danger'
                }
            }
        }
    ];

    // Configuración de intervalos de mantenimiento
    const maintenanceIntervals = {
        'aceite': {
            title: 'Aceite y Filtros',
            dias: 180, // 6 meses
            kilometros: 12000
        },
        'neumaticos': {
            title: 'Neumáticos',
            dias: 180,
            kilometros: 15000
        },
        'bateria': {
            title: 'Batería',
            dias: 180,
            kilometros: 20000
        },
        'distribucion': {
            title: 'Distribución',
            dias: 180,
            kilometros: 60000
        }
    };

    // Configuración de seguros
    const insuranceConfig = {
        warningDays: 30, // Días antes del vencimiento para mostrar advertencia
    };

    // Constante para el cálculo de kilómetros diarios
    const KM_PER_DAY = 200;

    // Función para calcular los kilómetros desde el último servicio
    function calculateKmSinceLastService(lastDate) {
        if (!lastDate || lastDate === 'No registrado') return 0;
        
        const today = new Date();
        const lastServiceDate = new Date(lastDate.split('/').reverse().join('-'));
        const daysDiff = Math.floor((today - lastServiceDate) / (1000 * 60 * 60 * 24));
        
        return daysDiff * KM_PER_DAY;
    }

    // Función para calcular el próximo servicio
    function calculateNextService(maintenanceKey, lastDate, currentKm = null) {
        const interval = maintenanceIntervals[maintenanceKey];
        if (!interval || !lastDate || lastDate === 'No registrado') return null;

        // Usar los kilómetros proporcionados o calcularlos desde la última fecha
        const kmSinceLastService = currentKm !== null ? currentKm : calculateKmSinceLastService(lastDate);
        
        // Calcular kilómetros restantes (simple resta del total menos los recorridos)
        const kmRestantes = interval.kilometros - kmSinceLastService;
        
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
                    const progress = (maint.kmSinceLastService / interval.kilometros) * 100;
                    
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

    // Función para crear una tarjeta de taxi
    function createTaxiCard(taxi) {
        const card = document.createElement('div');
        card.className = 'taxi-card';
        card.setAttribute('data-taxi-id', taxi.id);

        // Asegurarse de que todos los campos necesarios existan
        const defaultData = {
            model: 'No especificado',
            year: 'No especificado',
            domain: 'No especificado',
            status: 'ok',
            maintenance: {
                'aceite': {
                    title: 'Aceite y Filtros',
                    lastDate: 'No registrado',
                    kmSinceLastService: 0,
                    nextServiceKm: 5000,
                    type: 'ok'
                },
                'neumaticos': {
                    title: 'Neumáticos',
                    lastDate: 'No registrado',
                    kmSinceLastService: 0,
                    nextServiceKm: 15000,
                    type: 'ok'
                },
                'bateria': {
                    title: 'Batería',
                    lastDate: 'No registrado',
                    kmSinceLastService: 0,
                    nextServiceKm: 20000,
                    type: 'ok'
                },
                'distribucion': {
                    title: 'Distribución',
                    lastDate: 'No registrado',
                    kmSinceLastService: 0,
                    nextServiceKm: 60000,
                    type: 'ok'
                }
            }
        };

        // Combinar datos por defecto con los datos del taxi
        taxi = {
            ...defaultData,
            ...taxi,
            maintenance: {
                ...defaultData.maintenance,
                ...(taxi.maintenance || {})
            }
        };

        // Calcular el estado actual del taxi
        const currentStatus = calculateMaintenanceStatus(taxi.maintenance);
        taxi.status = currentStatus;

        card.innerHTML = `
            <div class="taxi-header">
                <div class="taxi-number">${taxi.id}</div>
            </div>
            <div class="taxi-content">
                <div class="taxi-info">
                    <div class="taxi-model" data-field="model">${taxi.model}</div>
                    <div class="taxi-details">
                        <span data-field="year">${taxi.year}</span> | 
                        <span data-field="domain">${taxi.domain}</span>
                    </div>
                </div>
                <span class="taxi-status status-${currentStatus}">${getStatusText(currentStatus)}</span>
                <button class="edit-btn">✎</button>
                <button class="delete-btn">×</button>
            </div>
        `;

        // Hacer los campos editables
        const editableFields = card.querySelectorAll('[data-field]');
        editableFields.forEach(field => {
            field.addEventListener('dblclick', function(e) {
                e.stopPropagation(); // Evitar que se abra el panel al editar
                if (!this.isContentEditable) {
                    this.contentEditable = true;
                    this.classList.add('editing');
                    this.focus();
                    
                    const range = document.createRange();
                    range.selectNodeContents(this);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    const originalValue = this.textContent;
                    
                    const handleSave = () => {
                        this.contentEditable = false;
                        this.classList.remove('editing');
                        const fieldName = this.dataset.field;
                        const newValue = this.textContent.trim();
                        if (newValue !== originalValue) {
                            saveChanges(taxi, fieldName, newValue);
                        }
                    };
                    
                    this.addEventListener('blur', handleSave, { once: true });
                    this.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            this.blur();
                        }
                        if (e.key === 'Escape') {
                            this.textContent = originalValue;
                            this.blur();
                        }
                    });
                }
            });
        });
        
        // Evento para mostrar detalles
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn') && 
                !e.target.classList.contains('edit-btn') && 
                !e.target.hasAttribute('data-field')) {
                showTaxiDetails(taxi);
            }
        });

        // Evento para eliminar
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTaxi(taxi.id);
        });

        // Evento para editar
        const editBtn = card.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editTaxiNumber(taxi);
        });

        return card;
    }

    // Función para actualizar la tarjeta de taxi
    function updateTaxiCard(taxi) {
        const card = document.querySelector(`[data-taxi-id="${taxi.id}"]`);
        if (card) {
            const maintenanceStatus = calculateMaintenanceStatus(taxi.maintenance);
            taxi.status = maintenanceStatus;

            card.innerHTML = `
                <div class="taxi-header">
                    <div class="taxi-number">${taxi.id}</div>
                </div>
                <div class="taxi-content">
                    <div class="taxi-info">
                        <div class="taxi-model" data-field="model">${taxi.model}</div>
                        <div class="taxi-details">
                            <span data-field="year">${taxi.year}</span> | 
                            <span data-field="domain">${taxi.domain}</span>
                        </div>
                    </div>
                    <span class="taxi-status status-${maintenanceStatus}">${getStatusText(maintenanceStatus)}</span>
                    <button class="edit-btn">✎</button>
                    <button class="delete-btn">×</button>
                </div>
            `;

            // Hacer los campos editables
            const editableFields = card.querySelectorAll('[data-field]');
            editableFields.forEach(field => {
                field.addEventListener('dblclick', function(e) {
                    e.stopPropagation();
                    if (!this.isContentEditable) {
                        this.contentEditable = true;
                        this.classList.add('editing');
                        this.focus();
                        
                        const range = document.createRange();
                        range.selectNodeContents(this);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        const originalValue = this.textContent;
                        
                        const handleSave = () => {
                            this.contentEditable = false;
                            this.classList.remove('editing');
                            const fieldName = this.dataset.field;
                            const newValue = this.textContent.trim();
                            if (newValue !== originalValue) {
                                saveChanges(taxi, fieldName, newValue);
                            }
                        };
                        
                        this.addEventListener('blur', handleSave, { once: true });
                        this.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                this.blur();
                            }
                            if (e.key === 'Escape') {
                                this.textContent = originalValue;
                                this.blur();
                            }
                        });
                    }
                });
            });

            // Reattach event listeners
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn') && 
                    !e.target.classList.contains('edit-btn') && 
                    !e.target.hasAttribute('data-field')) {
                    showTaxiDetails(taxi);
                }
            });

            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTaxi(taxi.id);
            });

            const editBtn = card.querySelector('.edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editTaxiNumber(taxi);
            });
        }
    }

    // Función para calcular el estado del mantenimiento
    function calculateMaintenanceStatus(maintenance) {
        let status = 'ok';
        
        Object.entries(maintenance).forEach(([key, maint]) => {
            const interval = maintenanceIntervals[key];
            if (interval) {
                const progress = (maint.kmSinceLastService / interval.kilometros) * 100;
                if (progress >= 100) {
                    status = 'danger';
                } else if (progress >= 90 && status !== 'danger') {
                    status = 'warning';
                }
                
                // Actualizar el tipo de mantenimiento individual
                if (progress >= 100) {
                    maint.type = 'danger';
                } else if (progress >= 90) {
                    maint.type = 'warning';
                } else {
                    maint.type = 'ok';
                }
            }
        });
        
        return status;
    }

    // Función para guardar cambios y actualizar la interfaz
    function saveChanges(taxi, fieldName, newValue) {
        taxi[fieldName] = newValue;
        
        // Actualizar el estado del taxi basado en el mantenimiento
        const newStatus = calculateMaintenanceStatus(taxi.maintenance);
        taxi.status = newStatus;
        
        // Actualizar la tarjeta
        updateTaxiCard(taxi);
        
        // Si el panel de detalles está abierto y muestra este taxi, actualizarlo
        const panel = document.querySelector('.detail-panel');
        if (panel.classList.contains('active') && panel.getAttribute('data-taxi-id') === taxi.id) {
            showTaxiDetails(taxi);
        }
        
        // Guardar en localStorage
        saveTaxiData();
        
        return true;
    }

    // Función para eliminar un taxi
    function deleteTaxi(taxiId) {
        if (confirm('¿Estás seguro de que deseas eliminar este taxi?')) {
            taxiData = taxiData.filter(taxi => taxi.id !== taxiId);
            const card = document.querySelector(`[data-taxi-id="${taxiId}"]`);
            if (card) {
                card.remove();
            }
        }
    }

    // Función para obtener el texto del estado
    function getStatusText(status) {
        const statusTexts = {
            'ok': 'OK',
            'warning': 'Revisión',
            'danger': 'Urgente'
        };
        return statusTexts[status] || status;
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

    // Función para mostrar detalles del taxi
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
        
        // Actualizar información general
        const infoSection = panel.querySelector('.info-section');
        infoSection.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <label>Marca</label>
                    <span class="taxi-brand editable" data-field="model">${taxi.model || 'No especificado'}</span>
                </div>
                <div class="info-item">
                    <label>Año</label>
                    <span class="taxi-year editable" data-field="year">${taxi.year || 'No especificado'}</span>
                </div>
                <div class="info-item">
                    <label>Dominio</label>
                    <span class="taxi-domain editable" data-field="domain">${taxi.domain || 'No especificado'}</span>
                </div>
            </div>
        `;
        
        // Actualizar kilómetros automáticamente
        updateTaxiStatus(taxi);

        // Limpiar y actualizar lista de mantenimientos
        const maintenanceList = Object.entries(taxi.maintenance || {}).map(([key, maint]) => {
            const interval = maintenanceIntervals[key];
            const kmRestantes = interval.kilometros - maint.kmSinceLastService;
            const diasRestantes = Math.ceil(kmRestantes / KM_PER_DAY);
            const proximaFecha = new Date(Date.now() + diasRestantes * 24 * 60 * 60 * 1000);
            const progress = (maint.kmSinceLastService / interval.kilometros) * 100;
            
            return `
                <div class="maintenance-item" data-maintenance-key="${key}">
                    <div class="maintenance-header">
                        <div class="maintenance-title">${maint.title}</div>
                        <div class="maintenance-date">
                            Último servicio: 
                            <span class="editable-date" data-field="lastDate">${maint.lastDate}</span>
                        </div>
                    </div>
                    <div class="maintenance-km">
                        Kilómetros recorridos: 
                        <span class="editable-km" data-field="kmSinceLastService">${maint.kmSinceLastService}</span> km
                        <small>(Calculado: 200 km/día)</small>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill progress-${maint.type}" 
                             style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="next-service">
                        <i class="fas fa-wrench"></i>
                        Próximo servicio: 
                        <span class="editable-next-km" data-field="nextServiceKm">${interval.kilometros.toLocaleString()}</span> km
                        <br>
                        <small>
                            Faltan: ${kmRestantes.toLocaleString()} km
                            (${diasRestantes} días - 
                            <span class="editable-next-date" data-field="nextServiceDate">
                                ${proximaFecha.toLocaleDateString('es-ES')}
                            </span>)
                        </small>
                    </div>
                </div>
            `;
        }).join('');

        const maintenanceSection = panel.querySelector('.maintenance-section');
        maintenanceSection.innerHTML = `
            <h3>Mantenimientos</h3>
            ${maintenanceList}
        `;

        // Función para registrar un servicio de mantenimiento
        function registrarServicio(taxi, maintenanceKey, kmServicio, fechaInicio) {
            const maint = taxi.maintenance[maintenanceKey];
            const interval = maintenanceIntervals[maintenanceKey];
            
            // Convertir la fecha de inicio a objeto Date
            const fechaInicioDate = new Date(fechaInicio);
            
            // Calcular próximo servicio
            const proximoKm = kmServicio + interval.kilometros;
            const proximaFecha = new Date(fechaInicioDate);
            proximaFecha.setDate(proximaFecha.getDate() + interval.dias);
            
            // Actualizar el mantenimiento
            maint.lastDate = fechaInicio;
            maint.kmSinceLastService = 0;
            maint.nextService = {
                km: proximoKm,
                date: proximaFecha,
                kmSinceLastService: 0,
                diasRestantes: interval.dias,
                kmRestantes: interval.kilometros
            };
        }

        // Función para actualizar el mantenimiento cuando se cambia la fecha
        function updateMaintenanceFromDate(taxi, maintenanceKey, newDate) {
            const maint = taxi.maintenance[maintenanceKey];
            const interval = maintenanceIntervals[maintenanceKey];
            
            // Calcular la diferencia en días
            const today = new Date();
            const lastServiceDate = new Date(newDate);
            const diffTime = Math.abs(today - lastServiceDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Actualizar la fecha del último servicio
            maint.lastDate = newDate;
            
            // Calcular kilómetros recorridos desde el último servicio
            maint.kmSinceLastService = diffDays * KM_PER_DAY;
            
            // Calcular próximo servicio
            const proximoKm = maint.kmSinceLastService + interval.kilometros;
            const proximaFecha = new Date(today);
            proximaFecha.setDate(today.getDate() + interval.dias);
            
            // Actualizar los detalles del próximo servicio
            maint.nextService = {
                km: proximoKm,
                date: proximaFecha,
                kmSinceLastService: maint.kmSinceLastService,
                diasRestantes: interval.dias,
                kmRestantes: interval.kilometros
            };
        }

        // Función para actualizar el mantenimiento cuando cambian los kilómetros
        function updateMaintenanceFromKm(taxi, maintenanceKey, newKm) {
            const maint = taxi.maintenance[maintenanceKey];
            const interval = maintenanceIntervals[maintenanceKey];
            
            // Actualizar kilómetros
            maint.kmSinceLastService = newKm;
            
            // Calcular la fecha del último servicio basada en los kilómetros
            const today = new Date();
            const daysSinceLastService = Math.floor(newKm / KM_PER_DAY);
            const lastServiceDate = new Date(today);
            lastServiceDate.setDate(today.getDate() - daysSinceLastService);
            
            // Actualizar la fecha del último servicio
            maint.lastDate = lastServiceDate.toLocaleDateString('es-ES');
            
            // Calcular próximo servicio
            const proximoKm = newKm + interval.kilometros;
            const proximaFecha = new Date(today);
            proximaFecha.setDate(today.getDate() + interval.dias);
            
            // Actualizar los detalles del próximo servicio
            maint.nextService = {
                km: proximoKm,
                date: proximaFecha,
                kmSinceLastService: newKm,
                diasRestantes: interval.dias,
                kmRestantes: interval.kilometros
            };
        }

        // Modificar la parte del código que maneja los cambios en las fechas
        const dateInputs = maintenanceSection.querySelectorAll('.editable-date');
        dateInputs.forEach(input => {
            input.addEventListener('click', () => {
                // Remover cualquier calendario existente
                const existingDatePicker = input.parentNode.querySelector('.date-picker');
                if (existingDatePicker) {
                    existingDatePicker.remove();
                }

                // Crear nuevo calendario con la fecha actual del sistema
                const datePicker = createDatePicker(input);
                input.parentNode.appendChild(datePicker);
                datePicker.classList.add('active');

                // Escuchar el evento de selección de fecha
                input.addEventListener('dateSelected', () => {
                    const newDate = input.textContent;
                    const maintenanceKey = input.closest('.maintenance-item').dataset.maintenanceKey;
                    
                    // Actualizar mantenimiento
                    updateMaintenanceFromDate(taxi, maintenanceKey, newDate);
                    
                    // Actualizar estado y guardar
                    updateTaxiStatus(taxi);
                    updateTaxiCard(taxi);
                    saveTaxiData();
                    showTaxiDetails(taxi);
                }, { once: true });
            });
        });

        // Modificar la parte del código que maneja los cambios en los kilómetros
        const editableKms = maintenanceSection.querySelectorAll('.editable-km');
        editableKms.forEach(kmField => {
            kmField.addEventListener('dblclick', function() {
                if (!this.isContentEditable) {
                    this.contentEditable = true;
                    this.classList.add('editing');
                    this.focus();
                    
                    const originalValue = this.textContent;
                    const maintenanceKey = this.closest('.maintenance-item').dataset.maintenanceKey;
                    
                    const saveKmChanges = () => {
                        this.contentEditable = false;
                        this.classList.remove('editing');
                        const newValue = parseInt(this.textContent.trim());
                        if (!isNaN(newValue)) {
                            // Actualizar mantenimiento
                            updateMaintenanceFromKm(taxi, maintenanceKey, newValue);
                            
                            // Actualizar estado y guardar
                            updateTaxiStatus(taxi);
                            updateTaxiCard(taxi);
                            saveTaxiData();
                            showTaxiDetails(taxi);
                        } else {
                            this.textContent = originalValue;
                        }
                    };
                    
                    this.addEventListener('blur', saveKmChanges, { once: true });
                    this.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            this.blur();
                        }
                        if (e.key === 'Escape') {
                            this.textContent = originalValue;
                            this.blur();
                        }
                    });
                }
            });
        });

        // Hacer los kilómetros del próximo servicio editables
        const editableNextKms = maintenanceSection.querySelectorAll('.editable-next-km');
        editableNextKms.forEach(kmField => {
            kmField.addEventListener('dblclick', function() {
                if (!this.isContentEditable) {
                    this.contentEditable = true;
                    this.classList.add('editing');
                    this.focus();
                    
                    const originalValue = this.textContent;
                    const maintenanceKey = this.closest('.maintenance-item').dataset.maintenanceKey;
                    
                    const saveNextKmChanges = () => {
                        this.contentEditable = false;
                        this.classList.remove('editing');
                        const newValue = parseInt(this.textContent.replace(/,/g, ''));
                        if (!isNaN(newValue) && newValue !== parseInt(originalValue.replace(/,/g, ''))) {
                            // Actualizar el intervalo de mantenimiento
                            maintenanceIntervals[maintenanceKey].kilometros = newValue;
                            
                            // Actualizar el mantenimiento del taxi
                            const maint = taxi.maintenance[maintenanceKey];
                            const kmRestantes = newValue - maint.kmSinceLastService;
                            const diasRestantes = Math.ceil(kmRestantes / KM_PER_DAY);
                            const proximaFecha = new Date(Date.now() + diasRestantes * 24 * 60 * 60 * 1000);
                            
                            // Actualizar los detalles del próximo servicio
                            maint.nextService = {
                                km: newValue,
                                date: proximaFecha,
                                kmSinceLastService: maint.kmSinceLastService,
                                diasRestantes: diasRestantes,
                                kmRestantes: kmRestantes
                            };
                            
                            // Actualizar estado y guardar
                            updateTaxiStatus(taxi);
                            updateTaxiCard(taxi);
                            saveTaxiData();
                            showTaxiDetails(taxi);
                        } else {
                            this.textContent = originalValue;
                        }
                    };
                    
                    this.addEventListener('blur', saveNextKmChanges, { once: true });
                    this.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            this.blur();
                        }
                        if (e.key === 'Escape') {
                            this.textContent = originalValue;
                            this.blur();
                        }
                    });
                }
            });
        });

        // Hacer las fechas del próximo servicio editables
        const editableNextDates = maintenanceSection.querySelectorAll('.editable-next-date');
        editableNextDates.forEach(dateField => {
            dateField.addEventListener('click', () => {
                // Remover cualquier calendario existente
                const existingDatePicker = dateField.parentNode.querySelector('.date-picker');
                if (existingDatePicker) {
                    existingDatePicker.remove();
                }

                // Crear nuevo calendario
                const datePicker = createDatePicker(dateField);
                dateField.parentNode.appendChild(datePicker);
                datePicker.classList.add('active');

                // Escuchar el evento de selección de fecha
                dateField.addEventListener('dateSelected', () => {
                    const newDate = dateField.textContent;
                    const maintenanceKey = dateField.closest('.maintenance-item').dataset.maintenanceKey;
                    const maint = taxi.maintenance[maintenanceKey];
                    const interval = maintenanceIntervals[maintenanceKey];
                    
                    // Calcular la diferencia en días entre la fecha actual y la nueva fecha
                    const today = new Date();
                    const nextServiceDate = new Date(newDate);
                    const diffTime = nextServiceDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Calcular los kilómetros restantes basados en los días
                    const kmRestantes = diffDays * KM_PER_DAY;
                    
                    // Actualizar los kilómetros del próximo servicio
                    interval.kilometros = maint.kmSinceLastService + kmRestantes;
                    
                    // Actualizar los detalles del próximo servicio
                    maint.nextService = {
                        km: interval.kilometros,
                        date: nextServiceDate,
                        kmSinceLastService: maint.kmSinceLastService,
                        diasRestantes: diffDays,
                        kmRestantes: kmRestantes
                    };
                    
                    // Actualizar estado y guardar
                    updateTaxiStatus(taxi);
                    updateTaxiCard(taxi);
                    saveTaxiData();
                    showTaxiDetails(taxi);
                }, { once: true });
            });
        });

        // Mostrar panel y overlay con animación
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            panel.classList.add('active');
        });
    }

    // Función para editar el número de taxi
    function editTaxiNumber(taxi) {
        const currentNumber = taxi.id.split('-')[1];
        const newNumber = prompt('Ingrese el nuevo número de taxi (máximo 4 dígitos):', currentNumber);
        
        if (newNumber !== null) {
            if (/^\d{1,4}$/.test(newNumber)) {
                const newId = `TX-${newNumber}`;
                
                if (taxiData.some(t => t.id === newId && t.id !== taxi.id)) {
                    alert('Este número de taxi ya existe.');
                    return;
                }

                const currentCard = document.querySelector(`[data-taxi-id="${taxi.id}"]`);
                taxi.id = newId;
                
                if (currentCard) {
                    currentCard.querySelector('.taxi-number').textContent = newId;
                    currentCard.setAttribute('data-taxi-id', newId);
                }
            } else {
                alert('Por favor, ingrese un número válido de máximo 4 dígitos.');
            }
        }
    }

    // Función para agregar un nuevo taxi
    function addNewTaxi() {
        const lastTaxi = taxiData[taxiData.length - 1];
        const lastNumber = parseInt(lastTaxi.id.split('-')[1]);
        const newNumber = lastNumber + 1;
        
        // Obtener la fecha actual
        const today = new Date();
        const currentDate = today.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const newTaxi = {
            id: `TX-${newNumber}`,
            model: 'Nuevo Taxi',
            year: today.getFullYear(),
            domain: 'Pendiente',
            status: 'ok',
            maintenance: {
                'aceite': {
                    title: 'Aceite y Filtros',
                    lastDate: currentDate,
                    kmSinceLastService: 0,
                    type: 'ok'
                },
                'neumaticos': {
                    title: 'Neumáticos',
                    lastDate: currentDate,
                    kmSinceLastService: 0,
                    type: 'ok'
                },
                'bateria': {
                    title: 'Batería',
                    lastDate: currentDate,
                    kmSinceLastService: 0,
                    type: 'ok'
                },
                'distribucion': {
                    title: 'Distribución',
                    lastDate: currentDate,
                    kmSinceLastService: 0,
                    type: 'ok'
                }
            }
        };
        
        // Registrar servicios iniciales
        Object.keys(newTaxi.maintenance).forEach(key => {
            registrarServicio(newTaxi, key, 0, currentDate);
        });
        
        // Calcular el estado inicial del taxi
        updateTaxiStatus(newTaxi);
        
        taxiData.push(newTaxi);
        const newCard = createTaxiCard(newTaxi);
        taxiGrid.appendChild(newCard);
        saveTaxiData();
    }

    // Función de búsqueda
    function searchTaxis() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.taxi-card');
        
        cards.forEach(card => {
            const taxiNumber = card.querySelector('.taxi-number').textContent.toLowerCase();
            card.style.display = searchTerm === '' || taxiNumber.includes(searchTerm) ? 'block' : 'none';
        });
    }

    // Función para guardar los datos en localStorage
    function saveTaxiData() {
        localStorage.setItem('taxiData', JSON.stringify(taxiData));
    }

    // Función para cerrar el panel de detalles
    function closeDetailPanel() {
        const panel = document.querySelector('.detail-panel');
        const overlay = document.querySelector('.overlay');
        
        overlay.classList.remove('active');
        panel.classList.remove('active');
        
        // Esperar a que termine la animación antes de ocultar
        setTimeout(() => {
            panel.style.display = 'none';
        }, 300);
    }

    // Event Listeners
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDetailPanel();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDetailPanel();
        }
    });

    // Agregar escape key para cerrar el panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const panel = document.querySelector('.detail-panel');
            if (panel.classList.contains('active')) {
                closeDetailPanel();
            }
        }
    });

    searchButton.addEventListener('click', searchTaxis);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchTaxis();
        } else {
            searchTaxis();
        }
    });

    addTaxiBtn.addEventListener('click', addNewTaxi);

    // Inicialización
    taxiData.forEach(taxi => {
        taxiGrid.appendChild(createTaxiCard(taxi));
    });
}); 