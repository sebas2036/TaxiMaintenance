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

        card.innerHTML = `
            <div class="taxi-number">${taxi.id}</div>
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
        const panelTitle = detailPanel.querySelector('.panel-title');
        const taxiBrand = detailPanel.querySelector('.taxi-brand');
        const taxiYear = detailPanel.querySelector('.taxi-year');
        const taxiDomain = detailPanel.querySelector('.taxi-domain');
        const maintenanceList = detailPanel.querySelector('.maintenance-list');
        
        // Actualizar título y datos generales
        panelTitle.textContent = `Taxi ${taxi.id}`;
        taxiBrand.textContent = taxi.model || 'No especificado';
        taxiYear.textContent = taxi.year || 'No especificado';
        taxiDomain.textContent = taxi.domain || 'No especificado';

        // Función para hacer un elemento editable
        function makeEditable(element, property) {
            element.addEventListener('dblclick', () => {
                element.contentEditable = true;
                element.classList.add('editing');
                element.focus();

                // Guardar cambios cuando se pierde el foco
                element.addEventListener('blur', () => {
                    element.contentEditable = false;
                    element.classList.remove('editing');
                    taxi[property] = element.textContent;
                    saveTaxiData();
                });

                // Guardar cambios al presionar Enter
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        element.blur();
                    }
                });
            });
        }

        // Hacer los campos editables
        makeEditable(taxiBrand, 'model');
        makeEditable(taxiYear, 'year');
        makeEditable(taxiDomain, 'domain');

        // Limpiar y actualizar lista de mantenimientos
        maintenanceList.innerHTML = '';
        if (taxi.maintenance) {
            Object.values(taxi.maintenance).forEach(maintenance => {
                const maintenanceItem = createMaintenanceItem(maintenance);
                maintenanceList.appendChild(maintenanceItem);
            });
        }
        
        // Mostrar panel
        detailPanel.style.display = 'block';
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            detailPanel.classList.add('active');
        });
    }

    // Función para crear elementos de mantenimiento
    function createMaintenanceItem(maintenance) {
        const div = document.createElement('div');
        div.className = 'maintenance-item';

        const progress = (maintenance.kmSinceLastService / maintenance.nextServiceKm) * 100;
        const kmRemaining = maintenance.nextServiceKm - maintenance.kmSinceLastService;

        div.innerHTML = `
            <div class="maintenance-header">
                <div class="maintenance-title">${maintenance.title}</div>
                <div class="maintenance-date">${maintenance.lastDate}</div>
            </div>
            <div class="maintenance-km">${maintenance.kmSinceLastService.toLocaleString()} km recorridos</div>
            <div class="progress-bar">
                <div class="progress-fill progress-${maintenance.type}" style="width: ${progress}%"></div>
            </div>
            <div class="next-service">
                <i class="fas fa-exclamation-circle"></i>
                ${kmRemaining > 0 ? 
                    `Servicio en ${kmRemaining.toLocaleString()} km` : 
                    '¡Servicio requerido!'
                }
            </div>
        `;

        return div;
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
            status: 'ok'
        };
        
        taxiData.push(newTaxi);
        const newCard = createTaxiCard(newTaxi);
        taxiGrid.appendChild(newCard);
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

    // Event Listeners
    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        detailPanel.classList.remove('active');
        setTimeout(() => {
            detailPanel.style.display = 'none';
        }, 300);
    });

    overlay.addEventListener('click', () => {
        overlay.classList.remove('active');
        detailPanel.classList.remove('active');
        setTimeout(() => {
            detailPanel.style.display = 'none';
        }, 300);
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