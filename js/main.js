/**
 * Módulo principal de la aplicación
 */

import { TaxiCard } from './modules/taxi-card.js';
import { DetailPanel } from './modules/detail-panel.js';
import { DataManager } from './modules/data-manager.js';

class App {
    constructor() {
        this.dataManager = new DataManager();
        this.detailPanel = new DetailPanel();
        this.taxiCards = new Map();
        this.setupApp();
    }

    /**
     * Configura la aplicación
     */
    setupApp() {
        // Agregar el panel de detalles al DOM
        document.body.appendChild(this.detailPanel.panel);

        // Configurar event listeners
        this.setupEventListeners();

        // Cargar taxis iniciales
        this.loadInitialTaxis();

        // Renderizar taxis
        this.renderTaxis();
    }

    /**
     * Configura los event listeners de la aplicación
     */
    setupEventListeners() {
        // Botón para agregar taxi
        const addTaxiBtn = document.querySelector('.add-taxi-btn');
        if (addTaxiBtn) {
            addTaxiBtn.addEventListener('click', () => this.showAddTaxiModal());
        }

        // Barra de búsqueda
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Callbacks del panel de detalles
        this.detailPanel.onSaveChanges = (taxi, fieldName, newValue) => {
            if (fieldName && newValue) {
                this.handleFieldUpdate(taxi.id, fieldName, newValue);
            } else {
                this.handleTaxiUpdate(taxi);
            }
        };
    }

    /**
     * Carga los taxis iniciales si no hay datos
     */
    loadInitialTaxis() {
        if (this.dataManager.getAllTaxis().length === 0) {
            const initialTaxis = [
                {
                    id: 'TX-001',
                    model: 'Toyota Corolla',
                    year: '2020',
                    domain: 'ABC123',
                    status: 'ok',
                    maintenance: {
                        'aceite': {
                            title: 'Aceite y Filtros',
                            lastDate: '2024-01-15',
                            kmSinceLastService: 3000,
                            nextServiceKm: 5000,
                            type: 'ok'
                        },
                        'neumaticos': {
                            title: 'Neumáticos',
                            lastDate: '2024-02-01',
                            kmSinceLastService: 8000,
                            nextServiceKm: 15000,
                            type: 'ok'
                        },
                        'bateria': {
                            title: 'Batería',
                            lastDate: '2024-01-01',
                            kmSinceLastService: 5000,
                            nextServiceKm: 20000,
                            type: 'ok'
                        },
                        'distribucion': {
                            title: 'Distribución',
                            lastDate: '2023-12-01',
                            kmSinceLastService: 15000,
                            nextServiceKm: 60000,
                            type: 'ok'
                        }
                    }
                },
                {
                    id: 'TX-130',
                    model: 'Toyota Corolla',
                    year: '2020',
                    domain: 'ABC456',
                    status: 'danger',
                    maintenance: {
                        'aceite': {
                            title: 'Aceite y Filtros',
                            lastDate: '2024-01-15',
                            kmSinceLastService: 5500,
                            nextServiceKm: 5000,
                            type: 'danger'
                        },
                        'neumaticos': {
                            title: 'Neumáticos',
                            lastDate: '2024-02-01',
                            kmSinceLastService: 14000,
                            nextServiceKm: 15000,
                            type: 'warning'
                        },
                        'bateria': {
                            title: 'Batería',
                            lastDate: '2024-01-01',
                            kmSinceLastService: 5000,
                            nextServiceKm: 20000,
                            type: 'ok'
                        },
                        'distribucion': {
                            title: 'Distribución',
                            lastDate: '2023-12-01',
                            kmSinceLastService: 15000,
                            nextServiceKm: 60000,
                            type: 'ok'
                        }
                    }
                }
            ];

            initialTaxis.forEach(taxi => this.dataManager.addTaxi(taxi));
        }
    }

    /**
     * Renderiza todos los taxis
     */
    renderTaxis() {
        const taxiGrid = document.querySelector('.taxi-grid');
        if (!taxiGrid) return;

        taxiGrid.innerHTML = '';
        this.taxiCards.clear();

        this.dataManager.getAllTaxis().forEach(taxi => {
            const taxiCard = new TaxiCard(taxi);
            
            // Configurar callbacks
            taxiCard.onShowDetails = (taxi) => this.detailPanel.show(taxi);
            taxiCard.onDelete = (taxiId) => this.handleDeleteTaxi(taxiId);
            taxiCard.onEditNumber = (taxi) => this.handleEditTaxiNumber(taxi);
            taxiCard.onSaveChanges = (taxi, fieldName, newValue) => {
                this.handleFieldUpdate(taxi.id, fieldName, newValue);
            };

            const cardElement = taxiCard.createCard();
            this.taxiCards.set(taxi.id, taxiCard);
            taxiGrid.appendChild(cardElement);
        });
    }

    /**
     * Maneja la búsqueda de taxis
     * @param {string} query Término de búsqueda
     */
    handleSearch(query) {
        const taxiGrid = document.querySelector('.taxi-grid');
        if (!taxiGrid) return;

        const searchTerm = query.toLowerCase();
        const cards = taxiGrid.querySelectorAll('.taxi-card');

        cards.forEach(card => {
            const taxiId = card.getAttribute('data-taxi-id');
            const taxi = this.dataManager.getTaxiById(taxiId);
            
            if (taxi) {
                const matches = 
                    taxi.id.toLowerCase().includes(searchTerm) ||
                    taxi.model.toLowerCase().includes(searchTerm) ||
                    taxi.domain.toLowerCase().includes(searchTerm);
                
                card.style.display = matches ? 'block' : 'none';
            }
        });
    }

    /**
     * Maneja la actualización de un campo
     * @param {string} taxiId ID del taxi
     * @param {string} fieldName Nombre del campo
     * @param {any} newValue Nuevo valor
     */
    handleFieldUpdate(taxiId, fieldName, newValue) {
        this.dataManager.updateTaxiField(taxiId, fieldName, newValue);
        this.dataManager.updateTaxiStatus(taxiId);
        
        // Actualizar tarjeta
        const taxiCard = this.taxiCards.get(taxiId);
        if (taxiCard) {
            taxiCard.updateCard();
        }

        // Actualizar panel si está abierto
        if (this.detailPanel.currentTaxi?.id === taxiId) {
            this.detailPanel.updatePanelContent();
        }
    }

    /**
     * Maneja la actualización completa de un taxi
     * @param {Object} taxi Datos actualizados del taxi
     */
    handleTaxiUpdate(taxi) {
        this.dataManager.updateTaxi(taxi.id, taxi);
        this.dataManager.updateTaxiStatus(taxi.id);
        
        // Actualizar tarjeta
        const taxiCard = this.taxiCards.get(taxi.id);
        if (taxiCard) {
            taxiCard.updateCard();
        }

        // Actualizar panel
        this.detailPanel.updatePanelContent();
    }

    /**
     * Maneja la eliminación de un taxi
     * @param {string} taxiId ID del taxi
     */
    handleDeleteTaxi(taxiId) {
        if (confirm('¿Está seguro de que desea eliminar este taxi?')) {
            this.dataManager.deleteTaxi(taxiId);
            
            // Eliminar tarjeta
            const cardElement = document.querySelector(`[data-taxi-id="${taxiId}"]`);
            if (cardElement) {
                cardElement.remove();
            }
            this.taxiCards.delete(taxiId);

            // Cerrar panel si está abierto
            if (this.detailPanel.currentTaxi?.id === taxiId) {
                this.detailPanel.hide();
            }
        }
    }

    /**
     * Maneja la edición del número de taxi
     * @param {Object} taxi Datos del taxi
     */
    handleEditTaxiNumber(taxi) {
        const newId = prompt('Ingrese el nuevo número de taxi:', taxi.id);
        if (newId && newId !== taxi.id) {
            const existingTaxi = this.dataManager.getTaxiById(newId);
            if (existingTaxi) {
                alert('Ya existe un taxi con ese número.');
                return;
            }

            const updatedTaxi = { ...taxi, id: newId };
            this.dataManager.deleteTaxi(taxi.id);
            this.dataManager.addTaxi(updatedTaxi);
            
            // Actualizar tarjeta
            const taxiCard = this.taxiCards.get(taxi.id);
            if (taxiCard) {
                taxiCard.element.remove();
                this.taxiCards.delete(taxi.id);
            }

            // Crear nueva tarjeta
            const newTaxiCard = new TaxiCard(updatedTaxi);
            newTaxiCard.onShowDetails = (taxi) => this.detailPanel.show(taxi);
            newTaxiCard.onDelete = (taxiId) => this.handleDeleteTaxi(taxiId);
            newTaxiCard.onEditNumber = (taxi) => this.handleEditTaxiNumber(taxi);
            newTaxiCard.onSaveChanges = (taxi, fieldName, newValue) => {
                this.handleFieldUpdate(taxi.id, fieldName, newValue);
            };

            const cardElement = newTaxiCard.createCard();
            this.taxiCards.set(newId, newTaxiCard);
            document.querySelector('.taxi-grid').appendChild(cardElement);

            // Actualizar panel si está abierto
            if (this.detailPanel.currentTaxi?.id === taxi.id) {
                this.detailPanel.show(updatedTaxi);
            }
        }
    }

    /**
     * Muestra el modal para agregar un nuevo taxi
     */
    showAddTaxiModal() {
        // TODO: Implementar modal para agregar taxi
        alert('Funcionalidad en desarrollo');
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 