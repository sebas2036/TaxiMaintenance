# Sistema de Gestión de Flota de Taxis

Sistema web para la gestión y seguimiento del mantenimiento de una flota de taxis.

## Características

- Gestión de vehículos
- Seguimiento de mantenimiento
- Panel de control en tiempo real
- Búsqueda de taxis
- Estadísticas y reportes

## Requisitos

- Node.js >= 14.x
- MongoDB >= 4.x
- NPM >= 6.x

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
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