/**
 * Módulo para la gestión de tarjetas de taxi
 */

export class TaxiCard {
    constructor(taxi) {
        this.taxi = taxi;
    }

    /**
     * Crea una tarjeta de taxi
     * @returns {HTMLElement} Elemento de la tarjeta
     */
    createCard() {
        const card = document.createElement('div');
        card.className = 'taxi-card';
        card.setAttribute('data-taxi-id', this.taxi.id);

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
        this.taxi = {
            ...defaultData,
            ...this.taxi,
            maintenance: {
                ...defaultData.maintenance,
                ...(this.taxi.maintenance || {})
            }
        };

        // Calcular el estado actual del taxi
        const currentStatus = this.calculateMaintenanceStatus(this.taxi.maintenance);
        this.taxi.status = currentStatus;

        card.innerHTML = this.generateCardHTML(currentStatus);
        this.attachEventListeners(card);

        return card;
    }

    /**
     * Genera el HTML de la tarjeta
     * @param {string} currentStatus Estado actual del taxi
     * @returns {string} HTML de la tarjeta
     */
    generateCardHTML(currentStatus) {
        return `
            <div class="taxi-header">
                <div class="taxi-number">${this.taxi.id}</div>
            </div>
            <div class="taxi-content">
                <div class="taxi-info">
                    <div class="taxi-model" data-field="model">${this.taxi.model}</div>
                    <div class="taxi-details">
                        <span data-field="year">${this.taxi.year}</span> | 
                        <span data-field="domain">${this.taxi.domain}</span>
                    </div>
                </div>
                <span class="taxi-status status-${currentStatus}">${this.getStatusText(currentStatus)}</span>
                <button class="edit-btn">✎</button>
                <button class="delete-btn">×</button>
            </div>
        `;
    }

    /**
     * Adjunta los event listeners a la tarjeta
     * @param {HTMLElement} card Elemento de la tarjeta
     */
    attachEventListeners(card) {
        // Hacer los campos editables
        const editableFields = card.querySelectorAll('[data-field]');
        editableFields.forEach(field => {
            field.addEventListener('dblclick', (e) => this.handleFieldEdit(e, field));
        });
        
        // Evento para mostrar detalles
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn') && 
                !e.target.classList.contains('edit-btn') && 
                !e.target.hasAttribute('data-field')) {
                this.onShowDetails(this.taxi);
            }
        });

        // Evento para eliminar
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onDelete(this.taxi.id);
        });

        // Evento para editar
        const editBtn = card.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEditNumber(this.taxi);
        });
    }

    /**
     * Maneja la edición de un campo
     * @param {Event} e Evento
     * @param {HTMLElement} field Campo a editar
     */
    handleFieldEdit(e, field) {
        e.stopPropagation();
        if (!field.isContentEditable) {
            field.contentEditable = true;
            field.classList.add('editing');
            field.focus();
            
            const range = document.createRange();
            range.selectNodeContents(field);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            const originalValue = field.textContent;
            
            const handleSave = () => {
                field.contentEditable = false;
                field.classList.remove('editing');
                const fieldName = field.dataset.field;
                const newValue = field.textContent.trim();
                if (newValue !== originalValue) {
                    this.onSaveChanges(this.taxi, fieldName, newValue);
                }
            };
            
            field.addEventListener('blur', handleSave, { once: true });
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    field.blur();
                }
                if (e.key === 'Escape') {
                    field.textContent = originalValue;
                    field.blur();
                }
            });
        }
    }

    /**
     * Calcula el estado del mantenimiento
     * @param {Object} maintenance Datos de mantenimiento
     * @returns {string} Estado calculado
     */
    calculateMaintenanceStatus(maintenance) {
        let status = 'ok';
        
        Object.values(maintenance).forEach(maint => {
            const progress = (maint.kmSinceLastService / maint.nextServiceKm) * 100;
            if (progress >= 100) {
                status = 'danger';
            } else if (progress >= 90 && status !== 'danger') {
                status = 'warning';
            }
            
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

    /**
     * Obtiene el texto del estado
     * @param {string} status Estado del taxi
     * @returns {string} Texto del estado
     */
    getStatusText(status) {
        const statusTexts = {
            'ok': 'OK',
            'warning': 'Revisión',
            'danger': 'Urgente'
        };
        return statusTexts[status] || status;
    }

    /**
     * Actualiza la tarjeta con los datos más recientes
     */
    updateCard() {
        const card = document.querySelector(`[data-taxi-id="${this.taxi.id}"]`);
        if (card) {
            const currentStatus = this.calculateMaintenanceStatus(this.taxi.maintenance);
            this.taxi.status = currentStatus;
            card.innerHTML = this.generateCardHTML(currentStatus);
            this.attachEventListeners(card);
        }
    }

    // Callbacks
    onShowDetails = (taxi) => {};
    onDelete = (taxiId) => {};
    onEditNumber = (taxi) => {};
    onSaveChanges = (taxi, fieldName, newValue) => {};
} 