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

        card.innerHTML = `
            <div class="taxi-number">${taxi.id}</div>
            <div class="taxi-info">
                <div class="taxi-model">${taxi.model}</div>
                <div class="taxi-details">${taxi.year} | ${taxi.domain}</div>
            </div>
            <span class="taxi-status status-${taxi.status}">${getStatusText(taxi.status)}</span>
            <button class="edit-btn">✎</button>
            <button class="delete-btn">×</button>
        `;
        
        // Evento para mostrar detalles
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn') && !e.target.classList.contains('edit-btn')) {
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
        
        // Hacer los campos editables
        const editableFields = infoSection.querySelectorAll('.editable');
        editableFields.forEach(field => {
            field.addEventListener('dblclick', function() {
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
                    
                    const saveChanges = () => {
                        this.contentEditable = false;
                        this.classList.remove('editing');
                        const fieldName = this.dataset.field;
                        const newValue = this.textContent.trim();
                        if (newValue !== originalValue) {
                            taxi[fieldName] = newValue;
                            saveTaxiData();
                        }
                    };
                    
                    this.addEventListener('blur', saveChanges, { once: true });
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
        
        // Limpiar y actualizar lista de mantenimientos
        const maintenanceList = Object.entries(taxi.maintenance || {}).map(([key, maint]) => {
            const progress = (maint.kmSinceLastService / maint.nextServiceKm) * 100;
            return `
                <div class="maintenance-item">
                    <div class="maintenance-header">
                        <div class="maintenance-title">${maint.title}</div>
                        <div class="maintenance-date">Último: ${maint.lastDate}</div>
                    </div>
                    <div class="maintenance-km">
                        Kilómetros desde último servicio: ${maint.kmSinceLastService} km
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
            <h3>Mantenimientos</h3>
            ${maintenanceList}
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

    // Inicialización
    taxiData.forEach(taxi => {
        taxiGrid.appendChild(createTaxiCard(taxi));
    });
}); 