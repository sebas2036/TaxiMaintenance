document.addEventListener('DOMContentLoaded', function() {
    const maintenanceIntervals = {
        'Cambio de Aceite': 5000,
        'Filtros': 15000,
        'Frenos': 30000
    };

    // Función para generar las tarjetas de vehículos
    function generarTarjetasVehiculos() {
        const vehiclesGrid = document.querySelector('.vehicles-grid');
        // Simulación de datos de vehículos
        const vehiculos = [
            { numero: '1001', estado: 'activo' },
            { numero: '1002', estado: 'mantenimiento' },
            { numero: '1003', estado: 'inactivo' }
        ];

        vehiculos.forEach(vehiculo => {
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.innerHTML = `
                <div class="vehicle-number" data-numero="${vehiculo.numero}">
                    ${vehiculo.numero}
                </div>
                <div class="vehicle-status ${vehiculo.estado}"></div>
            `;
            
            // Agregar event listener a la tarjeta
            card.addEventListener('click', function(e) {
                const numero = this.querySelector('.vehicle-number').dataset.numero;
                abrirModalDetalles(numero);
            });
            
            vehiclesGrid.appendChild(card);
        });
    }

    function actualizarBarrasProgreso() {
        const barras = document.querySelectorAll('.progreso');
        barras.forEach(barra => {
            const porcentaje = barra.getAttribute('data-porcentaje');
            barra.style.width = `${porcentaje}%`;
        });
    }

    function calcularProximoMantenimiento(ultimoKm, intervalo) {
        return ultimoKm + intervalo;
    }

    function actualizarKilometraje() {
        const kmActual = document.getElementById('kmActual').value;
        if (!kmActual) return;

        const items = document.querySelectorAll('.item-mantenimiento');
        items.forEach(item => {
            const titulo = item.querySelector('h3').textContent;
            const intervalo = maintenanceIntervals[titulo];
            const ultimoKm = parseInt(item.querySelector('.ultimo-km').textContent);
            const proximoKm = calcularProximoMantenimiento(ultimoKm, intervalo);
            
            const kmRestantes = proximoKm - kmActual;
            const porcentaje = Math.min(100, (kmActual - ultimoKm) / intervalo * 100);
            
            const barra = item.querySelector('.progreso');
            barra.style.width = `${porcentaje}%`;
            
            if (porcentaje >= 80) {
                barra.style.backgroundColor = '#f44336';
            } else if (porcentaje >= 60) {
                barra.style.backgroundColor = '#ff9800';
            } else {
                barra.style.backgroundColor = '#4CAF50';
            }
            
            item.querySelector('.km-restantes').textContent = `Faltan ${kmRestantes.toLocaleString()} km`;
        });
    }

    // Event Listeners
    document.querySelector('.btn-actualizar').addEventListener('click', actualizarKilometraje);
    document.querySelector('.btn-cerrar').addEventListener('click', () => {
        document.getElementById('modalMantenimiento').style.display = 'none';
    });

    // Elementos del modal de detalles
    const vehicleDetailsModal = document.getElementById('vehicleDetailsModal');
    const detallesTaxiNumero = document.getElementById('detallesTaxiNumero');
    const btnCerrarDetalles = vehicleDetailsModal.querySelector('.btn-cerrar');
    const btnGuardarDetalles = vehicleDetailsModal.querySelector('.btn-primary');
    const btnCancelarDetalles = vehicleDetailsModal.querySelector('.btn-secondary');

    // Función para abrir el modal de detalles
    function abrirModalDetalles(vehiculoId) {
        detallesTaxiNumero.textContent = vehiculoId;
        vehicleDetailsModal.style.display = 'block';
        cargarDatosVehiculo(vehiculoId);
    }

    // Función para cargar datos del vehículo
    function cargarDatosVehiculo(vehiculoId) {
        // Simulación de carga de datos
        const datosSimulados = {
            marca: 'Toyota',
            modelo: 'Corolla',
            anio: 2020,
            placa: 'ABC123',
            color: 'Blanco',
            vin: '1HGCM82633A123456',
            tipoMotor: '1.8L 4 cilindros',
            cilindrada: '1800cc',
            combustible: 'gasolina',
            ultimoAceite: '2024-02-15',
            ultimoFiltros: '2024-02-15',
            ultimoFrenos: '2024-01-20',
            tallerPreferido: 'Taller Mecánico Central',
            mecanicoAsignado: 'Juan Pérez',
            vencimientoSeguro: '2024-12-31',
            vencimientoVtv: '2024-06-30',
            vencimientoLicencia: '2024-08-15'
        };

        // Llenar los campos del formulario
        document.getElementById('marcaVehiculo').value = datosSimulados.marca;
        document.getElementById('modeloVehiculo').value = datosSimulados.modelo;
        document.getElementById('anioVehiculo').value = datosSimulados.anio;
        document.getElementById('placaVehiculo').value = datosSimulados.placa;
        document.getElementById('colorVehiculo').value = datosSimulados.color;
        document.getElementById('vinVehiculo').value = datosSimulados.vin;
        document.getElementById('tipoMotor').value = datosSimulados.tipoMotor;
        document.getElementById('cilindrada').value = datosSimulados.cilindrada;
        document.getElementById('tipoCombustible').value = datosSimulados.combustible;
        document.getElementById('ultimoAceite').value = datosSimulados.ultimoAceite;
        document.getElementById('ultimoFiltros').value = datosSimulados.ultimoFiltros;
        document.getElementById('ultimoFrenos').value = datosSimulados.ultimoFrenos;
        document.getElementById('tallerPreferido').value = datosSimulados.tallerPreferido;
        document.getElementById('mecanicoAsignado').value = datosSimulados.mecanicoAsignado;
        document.getElementById('vencimientoSeguro').value = datosSimulados.vencimientoSeguro;
        document.getElementById('vencimientoVtv').value = datosSimulados.vencimientoVtv;
        document.getElementById('vencimientoLicencia').value = datosSimulados.vencimientoLicencia;
    }

    // Función para guardar los datos del vehículo
    function guardarDatosVehiculo() {
        // Aquí irían las validaciones necesarias
        
        // Recoger todos los datos del formulario
        const datosVehiculo = {
            marca: document.getElementById('marcaVehiculo').value,
            modelo: document.getElementById('modeloVehiculo').value,
            anio: document.getElementById('anioVehiculo').value,
            placa: document.getElementById('placaVehiculo').value,
            color: document.getElementById('colorVehiculo').value,
            vin: document.getElementById('vinVehiculo').value,
            tipoMotor: document.getElementById('tipoMotor').value,
            cilindrada: document.getElementById('cilindrada').value,
            combustible: document.getElementById('tipoCombustible').value,
            ultimoAceite: document.getElementById('ultimoAceite').value,
            ultimoFiltros: document.getElementById('ultimoFiltros').value,
            ultimoFrenos: document.getElementById('ultimoFrenos').value,
            tallerPreferido: document.getElementById('tallerPreferido').value,
            mecanicoAsignado: document.getElementById('mecanicoAsignado').value,
            vencimientoSeguro: document.getElementById('vencimientoSeguro').value,
            vencimientoVtv: document.getElementById('vencimientoVtv').value,
            vencimientoLicencia: document.getElementById('vencimientoLicencia').value
        };

        // Aquí guardarías los datos en tu base de datos
        console.log('Datos a guardar:', datosVehiculo);
        
        // Cerrar el modal
        vehicleDetailsModal.style.display = 'none';
        
        // Mostrar mensaje de éxito
        alert('Datos guardados correctamente');
    }

    // Event Listeners para el modal de detalles
    btnCerrarDetalles.addEventListener('click', () => {
        vehicleDetailsModal.style.display = 'none';
    });

    btnGuardarDetalles.addEventListener('click', guardarDatosVehiculo);

    btnCancelarDetalles.addEventListener('click', () => {
        vehicleDetailsModal.style.display = 'none';
    });

    // Cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target === vehicleDetailsModal) {
            vehicleDetailsModal.style.display = 'none';
        }
    });

    // Inicializar la aplicación
    generarTarjetasVehiculos();
    actualizarBarrasProgreso();
}); 