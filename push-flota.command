#!/bin/bash

# Navegar al directorio del proyecto
cd "/Users/sebastianjasinsky/Desktop/mantenimiento flota taxi/FLOTATAXI/src"

# Obtener la fecha y hora actual
fecha=$(date "+%Y-%m-%d %H:%M:%S")

# Agregar todos los cambios
git add .

# Crear el commit con la fecha
git commit -m "Actualización automática: $fecha"

# Subir los cambios a GitHub
git push origin main

# Mostrar mensaje de éxito
echo "✅ Cambios subidos exitosamente a GitHub" 