#!/bin/bash

# Cambiar al directorio del proyecto
cd "$(dirname "$0")/.."

# Obtener la fecha actual
fecha=$(date +"%Y%m%d_%H%M%S")

# Crear directorio de backup si no existe
mkdir -p ~/Desktop/FLOTATAXI_Backups

# Crear nombre del archivo de backup
backup_file="~/Desktop/FLOTATAXI_Backups/flota_backup_$fecha.js"

# Copiar los datos de la flota al archivo de backup
cp src/js/main.js ~/Desktop/FLOTATAXI_Backups/flota_backup_$fecha.js

# Mostrar mensaje de éxito
echo "Backup creado exitosamente en: $backup_file"

# Obtener la fecha y hora actual
FECHA=$(date "+%Y-%m-%d %H:%M:%S")

# Agregar todos los cambios
git add .

# Crear el commit con la fecha
git commit -m "Actualización automática: $FECHA"

# Hacer push al repositorio remoto
git push origin main

# Guardar el historial en un archivo
echo "Push realizado el: $FECHA" >> historial-push.log

# Mostrar mensaje de éxito
echo "Push completado exitosamente"

# Esperar 3 segundos antes de cerrar para poder ver los mensajes
sleep 3 