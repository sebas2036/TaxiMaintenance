document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const taxiGrid = document.getElementById('taxi-grid');
    const detailPanel = document.querySelector('.detail-panel');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.close-btn');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const addTaxiBtn = document.querySelector('.add-taxi-btn');

    // Inicializar la flota
    const flota = new Flota();
    flota.cargarDatos();

    // Función para crear una tarjeta de taxi
    function createTaxiCard(taxi) {
        const card = document.createElement('div');
        card.className = 'taxi-card';
        card.dataset.id = taxi.id;
        
        const proximoServicio = flota.obtenerProximoServicio(taxi.id);
        
        card.innerHTML = `
            <div class="taxi-header">
                <h3>${taxi.id}</h3>
                <span class="status-badge status-${taxi.status}">${taxi.status}</span>
            </div>
            <div class="taxi-info">
                <p><strong>Modelo:</strong> ${taxi.modelo}</p>
                <p><strong>Kilómetros:</strong> ${taxi.kmActual.toLocaleString()} km</p>
                ${proximoServicio ? `
                    <p><strong>Próximo servicio:</strong> ${proximoServicio.tipo}</p>
                    <p><strong>Días restantes:</strong> ${proximoServicio.diasRestantes}</p>
                    <p><strong>Prioridad:</strong> ${proximoServicio.prioridad}</p>
                ` : ''}
            </div>
            <div class="taxi-actions">
                <button class="btn-edit" onclick="showTaxiDetails('${taxi.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteTaxi('${taxi.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        
        return card;
    }

    // Función para mostrar detalles del taxi
    function showTaxiDetails(taxiId) {
        const taxi = flota.vehiculos[taxiId];
        if (!taxi) return;
        
        // Actualizar el modal con los datos del taxi
        document.getElementById('taxiId').textContent = taxi.id;
        document.getElementById('taxiModel').value = taxi.modelo;
        document.getElementById('taxiKm').value = taxi.kmActual;
        document.getElementById('currentKm').textContent = taxi.kmActual.toLocaleString();
        document.getElementById('kmInput').value = taxi.kmActual;
        
        // Limpiar event listeners anteriores
        const updateKmBtn = document.getElementById('updateKm');
        const newUpdateKmBtn = updateKmBtn.cloneNode(true);
        updateKmBtn.parentNode.replaceChild(newUpdateKmBtn, updateKmBtn);
        
        // Configurar el evento para actualizar kilómetros
        newUpdateKmBtn.addEventListener('click', () => {
            const nuevoKm = parseInt(document.getElementById('kmInput').value);
            if (isNaN(nuevoKm) || nuevoKm < taxi.kmActual) {
                alert('Por favor, ingrese un valor válido mayor al kilometraje actual');
                return;
            }
            
            // Asegurar que el valor sea múltiplo de 200
            const kmAjustado = Math.ceil(nuevoKm / 200) * 200;
            
            // Actualizar kilómetros
            taxi.kmActual = kmAjustado;
            
            // Actualizar visualización
            document.getElementById('currentKm').textContent = kmAjustado.toLocaleString();
            document.getElementById('taxiKm').value = kmAjustado;
            
            // Actualizar estado del vehículo
            flota.actualizarEstadoVehiculo(taxiId);
            
            // Actualizar la visualización
            updateTaxiCard(taxiId);
            showTaxiDetails(taxiId); // Recargar los detalles
        });
        
        // Limpiar y actualizar lista de mantenimientos
        const maintenanceList = Object.entries(taxi.maintenance).map(([key, maint]) => {
            const interval = flota.maintenanceIntervals[key];
            const kmRestantes = interval.kilometros - maint.kmSinceLastService;
            const diasRestantes = Math.ceil(kmRestantes / flota.KM_PER_DAY);
            const progress = (maint.kmSinceLastService / interval.kilometros) * 100;
            
            return `
                <div class="maintenance-item" data-maintenance-key="${key}">
                    <div class="maintenance-header">
                        <div class="maintenance-title">${maint.title}</div>
                        <div class="maintenance-date">
                            Último servicio: ${maint.lastDate}
                        </div>
                    </div>
                    <div class="maintenance-km">
                        <strong>Kilómetros desde último servicio:</strong> 
                        ${maint.kmSinceLastService.toLocaleString()} km
                        <small>(Calculado: ${flota.KM_PER_DAY} km/día)</small>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill progress-${maint.type}" 
                             style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="next-service">
                        <i class="fas fa-wrench"></i>
                        <strong>Próximo servicio:</strong> 
                        <span class="next-service-km">${interval.kilometros.toLocaleString()}</span> km
                        <br>
                        <strong>Faltan:</strong> 
                        <span class="km-restantes">${kmRestantes.toLocaleString()}</span> km
                        <br>
                        <strong>Días restantes:</strong> 
                        <span class="dias-restantes">${diasRestantes}</span> días
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('maintenanceList').innerHTML = maintenanceList;
        
        // Mostrar el panel
        detailPanel.style.display = 'block';
        setTimeout(() => {
            detailPanel.classList.add('active');
            overlay.classList.add('active');
        }, 10);
    }

    // Función para actualizar la tarjeta del taxi
    function updateTaxiCard(taxiId) {
        const taxi = flota.vehiculos[taxiId];
        if (!taxi) return;
        
        const card = document.querySelector(`.taxi-card[data-id="${taxiId}"]`);
        if (!card) return;
        
        const proximoServicio = flota.obtenerProximoServicio(taxiId);
        
        card.innerHTML = `
            <div class="taxi-header">
                <h3>${taxi.id}</h3>
                <span class="status-badge status-${taxi.status}">${taxi.status}</span>
            </div>
            <div class="taxi-info">
                <p><strong>Modelo:</strong> ${taxi.modelo}</p>
                <p><strong>Kilómetros:</strong> ${taxi.kmActual.toLocaleString()} km</p>
                ${proximoServicio ? `
                    <p><strong>Próximo servicio:</strong> ${proximoServicio.tipo}</p>
                    <p><strong>Días restantes:</strong> ${proximoServicio.diasRestantes}</p>
                    <p><strong>Prioridad:</strong> ${proximoServicio.prioridad}</p>
                ` : ''}
            </div>
            <div class="taxi-actions">
                <button class="btn-edit" onclick="showTaxiDetails('${taxi.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteTaxi('${taxi.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
    }

    // Función para agregar un nuevo taxi
    function addNewTaxi() {
        const lastTaxi = Object.values(flota.vehiculos).pop();
        const lastNumber = parseInt(lastTaxi ? lastTaxi.id.split('-')[1] : 0);
        const newNumber = lastNumber + 1;
        
        try {
            flota.registrarVehiculo(`TX-${newNumber}`, 'Nuevo Taxi', 0);
            const newCard = createTaxiCard(flota.vehiculos[`TX-${newNumber}`]);
            taxiGrid.appendChild(newCard);
        } catch (error) {
            alert(error.message);
        }
    }

    // Función para eliminar un taxi
    function deleteTaxi(taxiId) {
        if (confirm('¿Estás seguro de que deseas eliminar este taxi?')) {
            delete flota.vehiculos[taxiId];
            const card = document.querySelector(`[data-taxi-id="${taxiId}"]`);
            if (card) {
                card.remove();
            }
            flota.guardarDatos();
        }
    }

    // Función de búsqueda
    function searchTaxis() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.taxi-card');
        
        cards.forEach(card => {
            const taxiNumber = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = searchTerm === '' || taxiNumber.includes(searchTerm) ? 'block' : 'none';
        });
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
    Object.values(flota.vehiculos).forEach(taxi => {
        taxiGrid.appendChild(createTaxiCard(taxi));
    });
}); 