/**
 * Módulo para la gestión del panel de detalles
 */

export class DetailPanel {
    constructor() {
        this.panel = document.createElement('div');
        this.panel.className = 'detail-panel';
        this.currentTaxi = null;
        this.setupPanel();
    }

    /**
     * Configura el panel de detalles
     */
    setupPanel() {
        this.panel.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title">Detalles del Taxi</h2>
                <button class="close-btn">×</button>
            </div>
            <div class="panel-body">
                <div class="info-section">
                    <h3>Información General</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Número:</label>
                            <span data-field="id" class="editable"></span>
                        </div>
                        <div class="info-item">
                            <label>Modelo:</label>
                            <span data-field="model" class="editable"></span>
                        </div>
                        <div class="info-item">
                            <label>Año:</label>
                            <span data-field="year" class="editable"></span>
                        </div>
                        <div class="info-item">
                            <label>Dominio:</label>
                            <span data-field="domain" class="editable"></span>
                        </div>
                    </div>
                </div>
                <div class="maintenance-section">
                    <h3>Mantenimiento</h3>
                    <div class="maintenance-grid"></div>
                </div>
            </div>
            <div class="panel-footer">
                <button class="save-btn">Guardar Cambios</button>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Adjunta los event listeners al panel
     */
    attachEventListeners() {
        // Cerrar panel
        const closeBtn = this.panel.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.hide());

        // Guardar cambios
        const saveBtn = this.panel.querySelector('.save-btn');
        saveBtn.addEventListener('click', () => this.saveChanges());

        // Campos editables
        const editableFields = this.panel.querySelectorAll('[data-field]');
        editableFields.forEach(field => {
            field.addEventListener('dblclick', (e) => this.handleFieldEdit(e, field));
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
                    this.onSaveChanges(this.currentTaxi, fieldName, newValue);
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
     * Muestra el panel con los detalles del taxi
     * @param {Object} taxi Datos del taxi
     */
    show(taxi) {
        this.currentTaxi = taxi;
        this.updatePanelContent();
        this.panel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Oculta el panel
     */
    hide() {
        this.panel.classList.remove('active');
        document.body.style.overflow = '';
        this.currentTaxi = null;
    }

    /**
     * Actualiza el contenido del panel
     */
    updatePanelContent() {
        if (!this.currentTaxi) return;

        // Actualizar información general
        const fields = ['id', 'model', 'year', 'domain'];
        fields.forEach(field => {
            const element = this.panel.querySelector(`[data-field="${field}"]`);
            if (element) {
                element.textContent = this.currentTaxi[field] || 'No especificado';
            }
        });

        // Actualizar sección de mantenimiento
        const maintenanceGrid = this.panel.querySelector('.maintenance-grid');
        maintenanceGrid.innerHTML = '';

        Object.entries(this.currentTaxi.maintenance).forEach(([key, maint]) => {
            const progress = (maint.kmSinceLastService / maint.nextServiceKm) * 100;
            const maintenanceItem = document.createElement('div');
            maintenanceItem.className = `maintenance-item status-${maint.type}`;
            maintenanceItem.innerHTML = `
                <div class="maintenance-header">
                    <h4>${maint.title}</h4>
                    <span class="maintenance-status">${this.getStatusText(maint.type)}</span>
                </div>
                <div class="maintenance-details">
                    <div class="maintenance-info">
                        <div class="info-row">
                            <span>Último servicio:</span>
                            <span>${maint.lastDate}</span>
                        </div>
                        <div class="info-row">
                            <span>Kilómetros desde último servicio:</span>
                            <span data-field="maintenance.${key}.kmSinceLastService" class="editable">${maint.kmSinceLastService}</span>
                        </div>
                        <div class="info-row">
                            <span>Próximo servicio en:</span>
                            <span>${maint.nextServiceKm} km</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
            `;

            // Adjuntar event listeners para campos editables
            const editableField = maintenanceItem.querySelector('[data-field]');
            if (editableField) {
                editableField.addEventListener('dblclick', (e) => this.handleFieldEdit(e, editableField));
            }

            maintenanceGrid.appendChild(maintenanceItem);
        });
    }

    /**
     * Guarda los cambios realizados
     */
    saveChanges() {
        if (!this.currentTaxi) return;
        this.onSaveChanges(this.currentTaxi);
    }

    /**
     * Obtiene el texto del estado
     * @param {string} status Estado del mantenimiento
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

    // Callbacks
    onSaveChanges = (taxi, fieldName, newValue) => {};
} 