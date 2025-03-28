document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const taxiGrid = document.getElementById('taxi-grid');
    const detailPanel = document.querySelector('.detail-panel');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.close-btn');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const addTaxiBtn = document.querySelector('.add-taxi-btn');
    const programMaintenanceBtn = document.getElementById('programMaintenance');
    const maintenanceModal = document.getElementById('maintenanceModal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const cancelMaintenanceBtn = document.getElementById('cancelMaintenance');
    const saveMaintenanceBtn = document.getElementById('saveMaintenance');
    const maintenanceTypeSelect = document.getElementById('maintenanceType');
    const maintenanceDateInput = document.getElementById('maintenanceDate');
    const currentKmInput = document.getElementById('currentKm');
    const nextServiceKmInput = document.getElementById('nextServiceKm');

    // Nuevos elementos para tipos de mantenimiento
    const addMaintenanceTypeBtn = document.getElementById('addMaintenanceTypeBtn');
    const newMaintenanceTypeModal = document.getElementById('newMaintenanceTypeModal');
    const closeNewTypeModalBtn = document.getElementById('closeNewTypeModalBtn');
    const cancelNewTypeBtn = document.getElementById('cancelNewTypeBtn');
    const saveNewTypeBtn = document.getElementById('saveNewTypeBtn');
    const newMaintenanceTypeName = document.getElementById('newMaintenanceTypeName');
    const newMaintenanceTypeKey = document.getElementById('newMaintenanceTypeKey');
    const defaultNextServiceKm = document.getElementById('defaultNextServiceKm');

    let currentTaxi = null;

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

    // Cargar tipos de mantenimiento guardados
    let maintenanceTypes = JSON.parse(localStorage.getItem('maintenanceTypes')) || {
        'aceite': { name: 'Cambio de Aceite', defaultKm: 5000 },
        'neumaticos': { name: 'Neumáticos', defaultKm: 15000 },
        'bateria': { name: 'Batería', defaultKm: 20000 },
        'distribucion': { name: 'Distribución', defaultKm: 50000 },
        'frenos': { name: 'Frenos', defaultKm: 30000 },
        'filtros': { name: 'Filtros', defaultKm: 10000 }
    };

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
        
        Object.values(maintenance).forEach(maint => {
            const progress = (maint.kmSinceLastService / maint.nextServiceKm) * 100;
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

    // Función para mostrar los detalles del taxi
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
        
        // Limpiar y actualizar lista de mantenimientos
        const maintenanceList = Object.entries(taxi.maintenance || {}).map(([key, maint]) => {
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
        }).join('');

        const maintenanceSection = panel.querySelector('.maintenance-section');
        maintenanceSection.innerHTML = `
            <div class="maintenance-header">
                <h3>Mantenimientos</h3>
                <button onclick="addNewMaintenanceType()">Nuevo Mantenimiento</button>
            </div>
            <div class="maintenance-list">
                ${maintenanceList}
            </div>
        `;

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
        
        const newTaxi = {
            id: `TX-${newNumber}`,
            model: 'Nuevo Taxi',
            year: new Date().getFullYear(),
            domain: 'Pendiente',
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

    // Función para mostrar el modal de mantenimiento
    function showMaintenanceModal(taxi) {
        currentTaxi = taxi;
        maintenanceModal.style.display = 'block';
        overlay.style.display = 'block';

        // Obtener el tipo de mantenimiento seleccionado
        const maintenanceType = maintenanceTypeSelect.value;
        const maintenance = taxi.maintenance[maintenanceType];

        // Establecer valores por defecto
        maintenanceDateInput.value = maintenance.lastDate === 'No registrado' ? '' : maintenance.lastDate;
        currentKmInput.value = maintenance.kmSinceLastService;
        nextServiceKmInput.value = maintenance.nextServiceKm;

        // Configurar los campos
        maintenanceDateInput.type = 'date';
        currentKmInput.type = 'number';
        nextServiceKmInput.type = 'number';

        // Hacer los campos editables
        maintenanceDateInput.removeAttribute('readonly');
        currentKmInput.removeAttribute('readonly');
        nextServiceKmInput.removeAttribute('readonly');

        // Agregar event listeners para cambios
        maintenanceDateInput.addEventListener('change', function() {
            if (this.value) {
                const date = new Date(this.value);
                maintenance.lastDate = date.toLocaleDateString();
                saveMaintenanceChanges();
            }
        });

        currentKmInput.addEventListener('change', function() {
            const value = parseInt(this.value) || 0;
            if (value < 0) this.value = 0;
            saveMaintenanceChanges();
        });

        nextServiceKmInput.addEventListener('change', function() {
            const value = parseInt(this.value) || 5000;
            if (value < 1) this.value = 1;
            saveMaintenanceChanges();
        });

        // Manejar la tecla Enter
        currentKmInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveMaintenanceChanges();
            }
        });

        nextServiceKmInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveMaintenanceChanges();
            }
        });

        // Manejar la tecla Escape
        currentKmInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = maintenance.kmSinceLastService;
                this.blur();
            }
        });

        nextServiceKmInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = maintenance.nextServiceKm;
                this.blur();
            }
        });
    }

    // Función para guardar cambios en el mantenimiento
    function saveMaintenanceChanges() {
        if (!currentTaxi) return;

        const maintenanceType = maintenanceTypeSelect.value;
        const maintenance = currentTaxi.maintenance[maintenanceType];

        // Validar y guardar kilómetros actuales
        const newCurrentKm = parseInt(currentKmInput.value) || 0;
        maintenance.kmSinceLastService = newCurrentKm;

        // Validar y guardar kilómetros del próximo servicio
        const newNextServiceKm = parseInt(nextServiceKmInput.value) || 5000;
        maintenance.nextServiceKm = newNextServiceKm;

        // Recalcular el estado del mantenimiento
        maintenance.type = calculateMaintenanceStatus(currentTaxi.maintenance)[maintenanceType];

        // Actualizar la interfaz
        updateTaxiCard(currentTaxi);
        showTaxiDetails(currentTaxi);

        // Guardar los cambios
        saveTaxiData();
    }

    // Función para cerrar el modal de mantenimiento
    function closeMaintenanceModal() {
        maintenanceModal.style.display = 'none';
        overlay.style.display = 'none';
        currentTaxi = null;
    }

    // Función para guardar el mantenimiento
    function saveMaintenance() {
        if (!currentTaxi) return;

        const maintenanceType = maintenanceTypeSelect.value;
        const maintenanceDate = maintenanceDateInput.value;
        const currentKm = parseInt(currentKmInput.value);
        const nextServiceKm = parseInt(nextServiceKmInput.value);

        // Asegurarse de que el tipo de mantenimiento existe
        if (!maintenanceTypes[maintenanceType]) {
            alert('Error: Tipo de mantenimiento no válido.');
            return;
        }

        // Actualizar los datos del taxi
        currentTaxi.maintenance[maintenanceType] = {
            title: maintenanceTypes[maintenanceType].name,
            lastDate: new Date(maintenanceDate).toLocaleDateString(),
            kmSinceLastService: currentKm,
            nextServiceKm: nextServiceKm,
            type: calculateMaintenanceStatus(currentTaxi.maintenance)[maintenanceType]
        };

        // Actualizar el estado general del taxi
        currentTaxi.status = calculateMaintenanceStatus(currentTaxi.maintenance);

        // Actualizar la interfaz
        updateTaxiCard(currentTaxi);
        showTaxiDetails(currentTaxi);

        // Cerrar el modal
        closeMaintenanceModal();
    }

    // Event Listeners para el modal de mantenimiento
    programMaintenanceBtn.addEventListener('click', () => {
        const taxiId = detailPanel.getAttribute('data-taxi-id');
        const taxi = taxiData.find(t => t.id === taxiId);
        if (taxi) {
            showMaintenanceModal(taxi);
        }
    });

    closeModalBtn.addEventListener('click', closeMaintenanceModal);
    cancelMaintenanceBtn.addEventListener('click', closeMaintenanceModal);
    saveMaintenanceBtn.addEventListener('click', saveMaintenance);
    overlay.addEventListener('click', closeMaintenanceModal);

    // Event listener para el cambio de tipo de mantenimiento
    maintenanceTypeSelect.addEventListener('change', () => {
        if (currentTaxi) {
            const maintenanceType = maintenanceTypeSelect.value;
            currentKmInput.value = currentTaxi.maintenance[maintenanceType].kmSinceLastService;
            nextServiceKmInput.value = currentTaxi.maintenance[maintenanceType].nextServiceKm;
        }
    });

    // Función para actualizar el select de tipos de mantenimiento
    function updateMaintenanceTypeSelect() {
        const select = document.getElementById('maintenanceType');
        select.innerHTML = '';
        
        Object.entries(maintenanceTypes).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value.name;
            select.appendChild(option);
        });
    }

    // Función para mostrar el modal de nuevo tipo
    function showNewMaintenanceTypeModal() {
        const modal = document.getElementById('newMaintenanceTypeModal');
        const overlay = document.querySelector('.overlay');
        
        // Asegurarse de que el modal y el overlay estén visibles
        modal.style.display = 'block';
        overlay.style.display = 'block';
        
        // Limpiar los campos
        document.getElementById('newMaintenanceTypeName').value = '';
        document.getElementById('newMaintenanceTypeKey').value = '';
        document.getElementById('defaultNextServiceKm').value = '';
    }

    // Función para cerrar el modal de nuevo tipo
    function closeNewMaintenanceTypeModal() {
        const modal = document.getElementById('newMaintenanceTypeModal');
        const overlay = document.querySelector('.overlay');
        
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }

    // Función para agregar nuevo tipo de mantenimiento
    window.addNewMaintenanceType = function() {
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

        // Generar una clave única basada en el nombre
        const key = nombre.toLowerCase().replace(/\s+/g, '_');

        // Agregar el nuevo mantenimiento al taxi
        taxi.maintenance[key] = {
            title: nombre,
            lastDate: 'No registrado',
            kmSinceLastService: 0,
            nextServiceKm: 5000,
            type: 'ok'
        };

        // Actualizar el estado del taxi
        taxi.status = calculateMaintenanceStatus(taxi.maintenance);

        // Actualizar la interfaz
        updateTaxiCard(taxi);
        showTaxiDetails(taxi); // Recargar el panel para mostrar el nuevo mantenimiento

        // Guardar los cambios
        saveTaxiData();
    };

    // Función para actualizar la lista de mantenimientos
    function updateMaintenanceList() {
        const maintenanceList = document.getElementById('maintenanceList');
        const maintenanceTypes = JSON.parse(localStorage.getItem('maintenanceTypes') || '{}');
        
        maintenanceList.innerHTML = '';
        
        Object.entries(maintenanceTypes).forEach(([key, maintenance]) => {
            const maintenanceItem = document.createElement('div');
            maintenanceItem.className = 'maintenance-item';
            maintenanceItem.innerHTML = `
                <div class="maintenance-header">
                    <h3 class="maintenance-title">${maintenance.nombre}</h3>
                    <div class="maintenance-actions">
                        <button onclick="editMaintenanceType('${key}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteMaintenanceType('${key}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="maintenance-info">
                    <p>Último servicio: ${maintenance.ultimoServicio}</p>
                    <p>Kilometraje actual: ${maintenance.kilometrajeActual}</p>
                    <p>Próximo servicio: ${maintenance.kilometraje} km</p>
                </div>
            `;
            maintenanceList.appendChild(maintenanceItem);
        });
    }

    // Función para editar un tipo de mantenimiento
    function editMaintenanceType(key) {
        const maintenanceTypes = JSON.parse(localStorage.getItem('maintenanceTypes') || '{}');
        const maintenance = maintenanceTypes[key];
        
        const nombre = prompt('Ingrese el nuevo nombre:', maintenance.nombre);
        if (!nombre) return;
        
        const kilometraje = prompt('Ingrese el nuevo kilometraje para el próximo servicio:', maintenance.kilometraje);
        if (!kilometraje || isNaN(kilometraje)) return;
        
        maintenanceTypes[key] = {
            ...maintenance,
            nombre: nombre,
            kilometraje: parseInt(kilometraje)
        };
        
        localStorage.setItem('maintenanceTypes', JSON.stringify(maintenanceTypes));
        updateMaintenanceList();
    }

    // Función para eliminar un tipo de mantenimiento
    function deleteMaintenanceType(key) {
        if (!confirm('¿Está seguro de que desea eliminar este mantenimiento?')) return;
        
        const maintenanceTypes = JSON.parse(localStorage.getItem('maintenanceTypes') || '{}');
        delete maintenanceTypes[key];
        
        localStorage.setItem('maintenanceTypes', JSON.stringify(maintenanceTypes));
        updateMaintenanceList();
    }

    // Event Listener para el botón de agregar tipo
    const addNewMaintenanceBtn = document.getElementById('addNewMaintenanceBtn');
    if (addNewMaintenanceBtn) {
        addNewMaintenanceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            addNewMaintenanceType();
        });
    }

    // Inicialización
    taxiData.forEach(taxi => {
        taxiGrid.appendChild(createTaxiCard(taxi));
    });

    // Inicializar el select de tipos de mantenimiento
    updateMaintenanceTypeSelect();
}); 