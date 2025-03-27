/**
 * Módulo para la gestión de datos
 */

export class DataManager {
    constructor() {
        this.taxis = this.loadTaxis();
    }

    /**
     * Carga los taxis desde el localStorage
     * @returns {Array} Lista de taxis
     */
    loadTaxis() {
        const taxis = localStorage.getItem('taxis');
        return taxis ? JSON.parse(taxis) : [];
    }

    /**
     * Guarda los taxis en el localStorage
     */
    saveTaxis() {
        localStorage.setItem('taxis', JSON.stringify(this.taxis));
    }

    /**
     * Obtiene todos los taxis
     * @returns {Array} Lista de taxis
     */
    getAllTaxis() {
        return this.taxis;
    }

    /**
     * Obtiene un taxi por su ID
     * @param {string} id ID del taxi
     * @returns {Object|null} Datos del taxi o null si no existe
     */
    getTaxiById(id) {
        return this.taxis.find(taxi => taxi.id === id) || null;
    }

    /**
     * Agrega un nuevo taxi
     * @param {Object} taxi Datos del taxi
     */
    addTaxi(taxi) {
        this.taxis.push(taxi);
        this.saveTaxis();
    }

    /**
     * Actualiza un taxi existente
     * @param {string} id ID del taxi
     * @param {Object} updates Datos a actualizar
     */
    updateTaxi(id, updates) {
        const index = this.taxis.findIndex(taxi => taxi.id === id);
        if (index !== -1) {
            this.taxis[index] = {
                ...this.taxis[index],
                ...updates
            };
            this.saveTaxis();
        }
    }

    /**
     * Elimina un taxi
     * @param {string} id ID del taxi
     */
    deleteTaxi(id) {
        this.taxis = this.taxis.filter(taxi => taxi.id !== id);
        this.saveTaxis();
    }

    /**
     * Actualiza un campo específico de un taxi
     * @param {string} id ID del taxi
     * @param {string} fieldName Nombre del campo
     * @param {any} value Nuevo valor
     */
    updateTaxiField(id, fieldName, value) {
        const taxi = this.getTaxiById(id);
        if (taxi) {
            if (fieldName.includes('.')) {
                // Para campos anidados (ej: maintenance.aceite.kmSinceLastService)
                const [section, item, field] = fieldName.split('.');
                if (taxi[section] && taxi[section][item]) {
                    taxi[section][item][field] = value;
                }
            } else {
                taxi[fieldName] = value;
            }
            this.saveTaxis();
        }
    }

    /**
     * Calcula el estado de mantenimiento de un taxi
     * @param {Object} taxi Datos del taxi
     * @returns {string} Estado del mantenimiento
     */
    calculateMaintenanceStatus(taxi) {
        let status = 'ok';
        
        Object.values(taxi.maintenance).forEach(maint => {
            const progress = (maint.kmSinceLastService / maint.nextServiceKm) * 100;
            if (progress >= 100) {
                status = 'danger';
            } else if (progress >= 90 && status !== 'danger') {
                status = 'warning';
            }
        });
        
        return status;
    }

    /**
     * Actualiza el estado de un taxi basado en su mantenimiento
     * @param {string} id ID del taxi
     */
    updateTaxiStatus(id) {
        const taxi = this.getTaxiById(id);
        if (taxi) {
            taxi.status = this.calculateMaintenanceStatus(taxi);
            this.saveTaxis();
        }
    }
} 