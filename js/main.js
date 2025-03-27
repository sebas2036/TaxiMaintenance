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
        { id: 'TX-1001', status: 'ok' },
        { id: 'TX-1002', status: 'warning' },
        { id: 'TX-1003', status: 'danger' },
        { id: 'TX-1004', status: 'ok' },
        { id: 'TX-1005', status: 'ok' },
        { id: 'TX-1006', status: 'warning' },
        { id: 'TX-1007', status: 'ok' },
        { id: 'TX-1008', status: 'danger' },
        { id: 'TX-1009', status: 'ok' },
        { id: 'TX-1010', status: 'warning' },
        { id: 'TX-1011', status: 'ok' },
        { id: 'TX-1012', status: 'ok' }
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
            // Eliminar del array de datos
            taxiData = taxiData.filter(taxi => taxi.id !== taxiId);
            
            // Eliminar la tarjeta del DOM
            const card = document.querySelector(`[data-taxi-id="${taxiId}"]`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.remove();
                }, 200);
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
        document.getElementById('taxi-id').textContent = taxi.id;
        detailPanel.classList.add('active');
        overlay.classList.add('active');
    }

    // Función para editar el número de taxi
    function editTaxiNumber(taxi) {
        const currentNumber = taxi.id.split('-')[1];
        const newNumber = prompt('Ingrese el nuevo número de taxi (máximo 4 dígitos):', currentNumber);
        
        if (newNumber !== null) {
            // Validar que sea un número y tenga máximo 4 dígitos
            if (/^\d{1,4}$/.test(newNumber)) {
                const newId = `TX-${newNumber}`;
                
                // Verificar si el número ya existe
                if (taxiData.some(t => t.id === newId && t.id !== taxi.id)) {
                    alert('Este número de taxi ya existe.');
                    return;
                }

                // Encontrar la tarjeta actual antes de cambiar el ID
                const currentCard = document.querySelector(`[data-taxi-id="${taxi.id}"]`);
                
                // Actualizar el ID en el array de datos
                taxi.id = newId;
                
                // Actualizar la tarjeta en el DOM
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
            status: 'ok' // Por defecto, nuevo taxi en estado OK
        };
        
        taxiData.push(newTaxi);
        const newCard = createTaxiCard(newTaxi);
        taxiGrid.appendChild(newCard);
    }

    // Función de búsqueda
    function searchTaxis() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.taxi-card');
        
        if (searchTerm === '') {
            // Si el campo de búsqueda está vacío, mostrar todas las tarjetas
            cards.forEach(card => {
                card.style.display = 'block';
            });
        } else {
            // Si hay término de búsqueda, filtrar las tarjetas
            cards.forEach(card => {
                const taxiNumber = card.querySelector('.taxi-number').textContent.toLowerCase();
                card.style.display = taxiNumber.includes(searchTerm) ? 'block' : 'none';
            });
        }
    }

    // Event Listeners
    closeBtn.addEventListener('click', () => {
        detailPanel.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        detailPanel.classList.remove('active');
        overlay.classList.remove('active');
    });

    searchButton.addEventListener('click', searchTaxis);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchTaxis();
        } else {
            // Buscar mientras el usuario escribe
            searchTaxis();
        }
    });

    addTaxiBtn.addEventListener('click', addNewTaxi);

    // Inicialización
    taxiData.forEach(taxi => {
        taxiGrid.appendChild(createTaxiCard(taxi));
    });
}); 