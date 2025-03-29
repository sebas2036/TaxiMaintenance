class Flota {
    constructor() {
        this.vehiculos = {};
        this.maintenanceIntervals = {
            'aceite': {
                title: 'Aceite y Filtros',
                dias: 180,
                kilometros: 12000
            },
            'neumaticos': {
                title: 'Neumáticos',
                dias: 180,
                kilometros: 15000
            },
            'bateria': {
                title: 'Batería',
                dias: 180,
                kilometros: 20000
            },
            'distribucion': {
                title: 'Distribución',
                dias: 180,
                kilometros: 60000
            }
        };
        this.KM_PER_DAY = 200;
    }

    registrarVehiculo(id, modelo, kmActual) {
        if (this.vehiculos[id]) {
            throw new Error(`Ya existe un vehículo con el ID ${id}`);
        }

        const today = new Date();
        const currentDate = today.toLocaleDateString('es-ES');

        this.vehiculos[id] = {
            id,
            modelo,
            kmActual,
            status: 'ok',
            maintenance: {}
        };

        // Inicializar mantenimientos
        Object.keys(this.maintenanceIntervals).forEach(key => {
            this.vehiculos[id].maintenance[key] = {
                title: this.maintenanceIntervals[key].title,
                lastDate: currentDate,
                kmSinceLastService: 0,
                nextServiceKm: this.maintenanceIntervals[key].kilometros,
                type: 'ok',
                history: []
            };
        });

        this.actualizarEstadoVehiculo(id);
        this.guardarDatos();
    }

    registrarServicio(id, tipoServicio, kmServicio, fecha) {
        const vehiculo = this.vehiculos[id];
        if (!vehiculo) {
            throw new Error(`No existe el vehículo con ID ${id}`);
        }

        const mantenimiento = vehiculo.maintenance[tipoServicio];
        if (!mantenimiento) {
            throw new Error(`Tipo de servicio no válido: ${tipoServicio}`);
        }

        // Registrar en el historial
        mantenimiento.history.push({
            fecha,
            kmServicio,
            kmActual: vehiculo.kmActual
        });

        // Actualizar último servicio
        mantenimiento.lastDate = fecha;
        mantenimiento.kmSinceLastService = 0;
        mantenimiento.nextServiceKm = this.maintenanceIntervals[tipoServicio].kilometros;

        this.actualizarEstadoVehiculo(id);
        this.guardarDatos();
    }

    actualizarEstadoVehiculo(id) {
        const vehiculo = this.vehiculos[id];
        if (!vehiculo) return;

        let worstStatus = 'ok';
        let totalKm = 0;

        Object.entries(vehiculo.maintenance).forEach(([key, maint]) => {
            const interval = this.maintenanceIntervals[key];
            if (!interval) return;

            // Calcular kilómetros desde el último servicio
            const kmSinceLastService = this.calcularKmDesdeUltimoServicio(maint.lastDate);
            maint.kmSinceLastService = kmSinceLastService;

            // Calcular progreso
            const progress = (kmSinceLastService / interval.kilometros) * 100;
            maint.nextServiceKm = interval.kilometros;

            // Determinar estado
            if (progress >= 100) {
                maint.type = 'danger';
                worstStatus = 'danger';
            } else if (progress >= 90) {
                maint.type = 'warning';
                if (worstStatus !== 'danger') worstStatus = 'warning';
            } else {
                maint.type = 'ok';
            }

            totalKm += kmSinceLastService;
        });

        vehiculo.status = worstStatus;
        vehiculo.kmPromedio = totalKm / Object.keys(vehiculo.maintenance).length;
    }

    calcularKmDesdeUltimoServicio(fecha) {
        if (!fecha || fecha === 'No registrado') return 0;
        
        const today = new Date();
        const lastServiceDate = new Date(fecha.split('/').reverse().join('-'));
        const daysDiff = Math.floor((today - lastServiceDate) / (1000 * 60 * 60 * 24));
        
        return daysDiff * this.KM_PER_DAY;
    }

    obtenerProximoServicio(id) {
        const vehiculo = this.vehiculos[id];
        if (!vehiculo) return null;

        let proximoServicio = {
            tipo: null,
            diasRestantes: Infinity,
            kmRestantes: Infinity,
            prioridad: 'baja'
        };

        Object.entries(vehiculo.maintenance).forEach(([key, maint]) => {
            const interval = this.maintenanceIntervals[key];
            if (!interval) return;

            const kmRestantes = interval.kilometros - maint.kmSinceLastService;
            const diasRestantes = Math.ceil(kmRestantes / this.KM_PER_DAY);

            if (diasRestantes < proximoServicio.diasRestantes) {
                proximoServicio = {
                    tipo: key,
                    diasRestantes,
                    kmRestantes,
                    prioridad: this.determinarPrioridad(diasRestantes)
                };
            }
        });

        return proximoServicio;
    }

    determinarPrioridad(diasRestantes) {
        if (diasRestantes <= 7) return 'alta';
        if (diasRestantes <= 30) return 'media';
        return 'baja';
    }

    guardarDatos() {
        localStorage.setItem('flotaData', JSON.stringify(this.vehiculos));
    }

    cargarDatos() {
        const datos = localStorage.getItem('flotaData');
        if (datos) {
            this.vehiculos = JSON.parse(datos);
            Object.keys(this.vehiculos).forEach(id => {
                this.actualizarEstadoVehiculo(id);
            });
        }
    }
}

// Exportar la clase para su uso en otros archivos
window.Flota = Flota; 