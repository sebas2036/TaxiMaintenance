#!/bin/bash

# Cambiar al directorio del proyecto
cd "$(dirname "$0")"

# Mostrar mensaje de inicio
echo "🚀 Iniciando actualización del repositorio..."

# Hacer pull de los cambios
echo "📥 Obteniendo cambios del repositorio remoto..."
git pull origin main

# Agregar todos los cambios
echo "📝 Agregando cambios locales..."
git add .

# Crear commit con fecha y hora
echo "💾 Creando commit..."
git commit -m "Actualización automática: $(date '+%Y-%m-%d %H:%M:%S')"

# Hacer push de los cambios
echo "📤 Subiendo cambios al repositorio remoto..."
git push origin main

# Mostrar mensaje de finalización
echo "✅ ¡Actualización completada!"

# Esperar 3 segundos antes de cerrar
sleep 3 