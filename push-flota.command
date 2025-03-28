#!/bin/bash

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