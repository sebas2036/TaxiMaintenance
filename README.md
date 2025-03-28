# Sistema de Gestión de Flota de Taxis

Sistema web para la gestión y seguimiento del mantenimiento de una flota de taxis.

## 🚕 Características

- Vista de cuadrícula con todos los taxis
- Estados de mantenimiento:
  - 🟢 OK
  - 🟡 Revisión
  - 🔴 Urgente
- Búsqueda por número de taxi
- Panel de detalles al hacer clic
- Gestión de vehículos
- Seguimiento de mantenimiento
- Panel de control en tiempo real
- Estadísticas y reportes

## 🚀 Cómo Usar

1. Abre el archivo `index.html` en tu navegador
2. O inicia el servidor local:
```bash
python3 -m http.server 8000
```
3. Visita `http://localhost:8000`

## 📁 Archivos

- `index.html`: Página principal
- `css/styles.css`: Estilos
- `js/main.js`: Funcionalidad

## 🔄 Commit Automático

Para subir cambios automáticamente:

1. Haz doble clic en `push-flota.command` en el escritorio
2. Los cambios se subirán a GitHub automáticamente

## Requisitos

- Node.js >= 14.x
- MongoDB >= 4.x
- NPM >= 6.x

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/sebas2036/TaxiMaintenance.git
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Iniciar el servidor:
```bash
npm run dev
```

## Estructura del Proyecto

```
FLOTATAXI/
├── src/
│   ├── css/
│   ├── js/
│   ├── components/
│   └── index.html
├── public/
├── assets/
├── server.js
├── package.json
└── README.md
```

## Tecnologías Utilizadas

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- Base de datos: MongoDB
- Otras: Mongoose, CORS, dotenv

## Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC.
