# React API Práctica

Aplicación web desarrollada con React y Vite para buscar recetas y consultar sus detalles mediante una API pública.

## Funcionalidades

- Buscar recetas por nombre.
- Mostrar estados de carga, errores y resultados vacíos.
- Consultar recetas desde TheMealDB.
- Navegar entre el listado y la página de detalle.
- Mostrar instrucciones e imagen de cada receta.
- Diseño adaptable a diferentes tamaños de pantalla.

## Tecnologías

- React
- Vite
- JavaScript
- React Router
- CSS
- Fetch API
- TheMealDB
- Git y GitHub

## Conceptos aplicados

- Componentes funcionales.
- Props.
- Hooks `useState` y `useEffect`.
- Hooks personalizados.
- Solicitudes HTTP asincrónicas.
- Manejo de estados y errores.
- Navegación con React Router.
- Composición y separación de componentes.

## Instalación y ejecución

### Requisitos

- Node.js
- npm

### Pasos

1. Clonar el repositorio:

```powershell
git clone https://github.com/wfonsecag/react-api-practica.git
```

2. Entrar al proyecto:

```powershell
cd react-api-practica
```

3. Instalar dependencias:

```powershell
npm install
```

4. Iniciar el servidor de desarrollo:

```powershell
npm run dev
```

5. Abrir la dirección mostrada por Vite en el navegador.

## Compilar para producción

```powershell
npm run build
```

La carpeta `dist` contendrá los archivos optimizados listos para desplegar.

## API utilizada

TheMealDB: https://www.themealdb.com/

Endpoints utilizados:

- Buscar recetas: `https://www.themealdb.com/api/json/v1/1/search.php?s=chicken`
- Consultar detalle: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=ID`

## Rutas

- `/`: listado y búsqueda de recetas.
- `/recipe/:id`: detalle de una receta seleccionada.

## Repositorio

https://github.com/wfonsecag/react-api-practica

## Autor

Wilmar Fonseca
