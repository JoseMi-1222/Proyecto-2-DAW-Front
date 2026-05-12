# Resumen de Cambios entre rama Main y Fixed

## Fecha: 29/04/2026

---

## 📊 Estadísticas Generales

- **Total de archivos modificados**: 33
- **Líneas añadidas**: 3,627
- **Líneas eliminadas**: 1,957
- **Balance neto**: +1,670 líneas

---

## 📝 Commits Realizados (de más antiguo a más reciente)

1. **feat: Refactor layout and loading indicators** - Mejora de layout e indicadores de carga
2. **Rama fixed creada y logica implementada** - Creación de la rama fixed con lógica inicial
3. **Cambios de contraseña y lógica de ausencias hecho** - Sistema de cambio de contraseña y gestión de ausencias
4. **Lógica de creación de profesor y usuarios creado** - Implementación de creación de profesores y usuarios
5. **Lógica de muestra y modificación de horarios hecho** - Sistema de visualización y edición de horarios
6. **Lógica de exportación e importación de datos y fix horarios** - Funcionalidad de importar/exportar + correcciones
7. **HomeView.vue fixeado** - Correcciones finales en la vista principal

---

## 🔧 Cambios por Categoría

### 📦 Dependencias
- **package-lock.json**: Actualización masiva de dependencias (890 cambios)

### 🎯 Componentes Nuevos Creados

1. **ModalAsignarUsuario.vue** (+164 líneas)
   - Nuevo modal para asignar usuarios al sistema
   
2. **ModalConfirmacion.vue** (+58 líneas)
   - Modal de confirmación para acciones críticas
   
3. **ModalHorario.vue** (+382 líneas)
   - Modal completo para gestión de horarios
   
4. **ModalProfesor.vue** (+108 líneas)
   - Modal para información y gestión de profesores
   
5. **TablaAusencias.vue** (+109 líneas)
   - Componente de tabla para mostrar ausencias

### ❌ Componentes Eliminados

- **AusenciasProfesor.vue** (-228 líneas)
  - Componente reemplazado por nueva implementación

### 🔄 Componentes Modificados Significativamente

1. **FormularioCrearAusencia.vue** (refactorización importante)
   - Mejoras en la lógica de creación de ausencias
   
2. **Horario.vue** (refactorización completa - 322 cambios)
   - Reestructuración total del componente de horario
   
3. **Menu.vue** (60 cambios)
   - Actualizaciones en el menú principal
   
4. **MenuLateral.vue** (339 cambios)
   - Refactorización completa del menú lateral
   
5. **TarjetaProfesor.vue** (31 cambios)
   - Mejoras en la visualización de datos de profesores

### 🎨 Vistas Nuevas

1. **AusenciasAdminView.vue** (+261 líneas)
   - Vista completa para que los administradores gestionen ausencias

2. **GestionDatosView.vue** (+312 líneas)
   - Vista para gestión de datos (importar/exportar)

### 🔄 Vistas Refactorizadas

1. **AusenciasProfesorView.vue** (refactorización importante)
   - Simplificación y mejora de la vista de ausencias para profesores
   
2. **DatosProfesoradoView.vue** (refactorización completa - 602 cambios)
   - Reestructuración total de la gestión de datos de profesorado
   
3. **DatosUsuarioView.vue** (153 cambios)
   - Mejoras en la gestión de datos de usuarios
   
4. **HomeView.vue** (262 cambios adicionales)
   - Mejoras significativas en la vista principal
   
5. **PerfilView.vue** (225 cambios)
   - Refactorización del perfil de usuario

### 🔌 Servicios (API)

1. **adminService.js** (+17 líneas)
   - Nuevos métodos para operaciones de administrador
   
2. **ausenciaService.js** (+39 líneas)
   - Ampliación de servicios para gestión de ausencias
   
3. **authService.js** (+13 líneas)
   - Mejoras en autenticación
   
4. **datosService.js** (+29 líneas)
   - Nuevo servicio para gestión de datos (importar/exportar)
   
5. **horarioService.js** (+29 líneas)
   - Ampliación de servicios de horarios
   
6. **profesorService.js** (+64 líneas)
   - Nuevos métodos para gestión de profesores
   
7. **usuarioService.js** (+55 líneas)
   - Ampliación de servicios de usuarios

### 🏪 Estado Global

- **auth.js** (16 cambios)
  - Actualizaciones en el store de autenticación

### ⚙️ Configuración

1. **App.vue** (40 cambios)
   - Mejoras en el componente raíz de la aplicación
   
2. **axios.js** (+4 líneas)
   - Ajustes en la configuración de axios
   
3. **router/index.js** (37 cambios)
   - Actualización de rutas con las nuevas vistas

---

## 🎯 Funcionalidades Principales Añadidas

### 1. Sistema de Gestión de Ausencias Completo
- Vista separada para administradores y profesores
- Creación, edición y eliminación de ausencias
- Tabla de visualización mejorada

### 2. Sistema de Gestión de Horarios
- Modal completo para visualizar y modificar horarios
- Mejoras en la lógica de asignación
- Correcciones de bugs previos

### 3. Gestión de Usuarios y Profesores
- Creación de usuarios con asignación de roles
- Modal de asignación de usuarios
- Servicios API expandidos para operaciones CRUD

### 4. Sistema de Cambio de Contraseña
- Implementación de modal para cambio de contraseña
- Validaciones y seguridad

### 5. Importación y Exportación de Datos
- Nueva vista dedicada a gestión de datos
- Funcionalidad de importar datos al sistema
- Funcionalidad de exportar datos del sistema

### 6. Modales de Confirmación
- Sistema de confirmación para acciones críticas
- Mejora en la experiencia de usuario

### 7. Mejoras en la Vista Principal (Home)
- Refactorización completa con nuevas funcionalidades
- Mejor organización del código
- Correcciones de bugs

---

## 🔒 Mejoras de Seguridad y UX

- Modales de confirmación para operaciones críticas
- Mejoras en el sistema de autenticación
- Mejor manejo de estados de carga
- Refactorización de layouts para mejor experiencia de usuario

---

## 📈 Impacto General

La rama **fixed** representa una evolución significativa del proyecto con:
- **Mayor modularización**: Nuevos componentes y servicios especializados
- **Funcionalidades completas**: Sistemas de gestión implementados end-to-end
- **Mejor arquitectura**: Separación clara de responsabilidades
- **UX mejorada**: Modales, confirmaciones y feedback visual
- **Código más limpio**: Refactorización de componentes legacy

Esta rama está lista para ser considerada como una versión mejorada y más completa del sistema.
Para lanzarlo solo tenemos que poner **npm install** y luego **npm run dev**

---------------------------------------------------------------------------------------------------------

# Summary of Changes between Main and Fixed Branches

## Date: 29/04/2026

---

## 📊 General Statistics

- **Total Files Modified**: 33
- **Lines Added**: 3,627
- **Lines Deleted**: 1,957
- **Net Balance**: +1,670 lines

---

## 📝 Commits Made (Oldest to Newest)

1. **Feat: Refactor layout and loading indicators** - Improved layout and loading indicators
2. **Fixed Branch Created and Logic Implemented** - Creation of the fixed branch with initial logic
3. **Password Changes and Absence Logic Completed** - Password change and absence management system
4. **Professor and User Creation Logic Created** - Implementation of professor and user creation
5. **Sample Logic and Modification Schedules completed** - Schedule viewing and editing system
6. **Data export and import logic and schedule fixes** - Import/export functionality + corrections
7. **HomeView.vue fixed** - Final corrections to the main view

---

## 🔧 Changes by Category

### 📦 Dependencies
- **package-lock.json**: Mass update of dependencies (890 changes)

### 🎯 New Components Created

1. **ModalAsignarUsuario.vue** (+164 lines)

- New modal for assigning users to the system

2. **ModalConfirmacion.vue** (+58 lines)

- Confirmation modal for critical actions

3. **ModalHorario.vue** (+382 lines)

- Complete modal for schedule management

4. **ModalProfesor.vue** (+108 lines) lines)

- Modal for teacher information and management

5. **TablaAbsencias.vue** (+109 lines)

- Table component to display absences

### ❌ Removed Components

- **AusenciasProfesor.vue** (-228 lines)

- Component replaced by a new implementation

### 🔄 Significantly Modified Components

1. **FormularioCrearAbsencia.vue** (major refactoring)

- Improvements to the absence creation logic

2. **Horario.vue** (complete refactoring - 322 changes)

- Complete restructuring of the schedule component

3. **Menu.vue** (60 changes)

- Updates to the main menu

4. **MenuLateral.vue** (339 changes)

- Complete refactoring of the side menu

5. **TarjetaProfesor.vue** (31 Changes)

- Improvements to the visualization of teacher data

### 🎨 New Views

1. **AbsencesAdminView.vue** (+261 lines)

- Complete view for administrators to manage absences

2. **DataManagementView.vue** (+312 lines)

- View for data management (import/export)

### 🔄 Refactored Views

1. **AbsencesTeacherView.vue** (major refactoring)

- Simplification and improvement of the absence view for teachers

2. **FacultyDataView.vue** (complete refactoring - 602 changes)

- Complete restructuring of faculty data management

3. **UserDataView.vue** (153 changes)

- Improvements to user data management

4. **HomeView.vue** (262 changes) Additional features)

- Significant improvements to the main view

5. **PerfilView.vue** (225 changes)

- Refactoring of the user profile

### 🔌 Services (API)

1. **adminService.js** (+17 lines)

- New methods for administrator operations

2. **ausenciaService.js** (+39 lines)

- Expanded absence management services

3. **authService.js** (+13 lines)

- Authentication improvements

4. **datosService.js** (+29 lines)

- New data management service (import/export)

5. **horarioService.js** (+29 lines)

- Expanded schedule services

6. **profesorService.js** (+64 lines)

- New methods for managing professors

7. **usuarioService.js** (+55 lines)

- User Services Expansion

### 🏪 Global Status

- **auth.js** (16 changes)

- Auth store updates

### ⚙️ Configuration

1. **App.vue** (40 changes)

- Improvements to the application's root component

2. **axios.js** (+4 lines)

- Adjustments to the axios configuration

3. **router/index.js** (37 changes)

- Updated routes with the new views

---

## 🎯 Key Features Added

### 1. Complete Absence Management System
- Separate views for administrators and teachers
- Creating, editing, and deleting absences
- Improved display table

### 2. Timetable Management System
- Full modal for viewing and modifying timetables
- Improvements to assignment logic
- Bug fixes Previous Features

### 3. User and Teacher Management
- User creation with role assignment
- User assignment modal
- Expanded API services for CRUD operations

### 4. Password Change System
- Implementation of a password change modal
- Validations and security

### 5. Data Import and Export
- New view dedicated to data management
- Functionality to import data into the system
- Functionality to export data from the system

To launch it, you just need to **run npm install** and then **npm run dev**.



By Jose Miguel and Juan Antonio 2ºDAW

Despliegue en VPS


1. Gestión de Contenedores (Docker)
  Este es el método principal para lanzar todo el sistema (Frontend, Backend y Certbot) de forma unificada.

   * docker-compose up --build -d
       * Qué hace:
           1. --build: Obliga a reconstruir las imágenes de Docker del Frontend y Backend (ejecutando internamente mvn
              package y npm run build).
           2. up: Crea e inicia los contenedores definidos en docker-compose.yml.
           3. -d: Ejecuta los contenedores en segundo plano (modo detached).
   * docker-compose down
       * Qué hace: Detiene y elimina los contenedores, redes y volúmenes creados por el proyecto.

  2. Backend (Java / Spring Boot)
  Ubicado en Proyecto-2-DAW-Back/servidor/app-horario/.

   * ./mvnw clean package -DskipTests (Ejecutado automáticamente dentro de Docker)
       * Qué hace: Limpia compilaciones anteriores (clean), compila el código y genera un archivo .jar ejecutable en la
         carpeta target/. Omite los tests para acelerar el proceso.
   * java -jar target/*.jar
       * Qué hace: Lanza la aplicación Spring Boot directamente si tienes Java instalado localmente (puerto 8081).

  3. Frontend (Vue.js / Vite)
  Ubicado en Proyecto-2-DAW-Front/cliente/mi-horario/.

   * npm install (Ejecutado automáticamente dentro de Docker)
       * Qué hace: Descarga todas las dependencias necesarias definidas en package.json.
   * npm run build (Ejecutado automáticamente dentro de Docker)
       * Qué hace: Compila y optimiza la aplicación para producción, generando archivos estáticos (HTML, JS, CSS) en la
         carpeta dist/.
   * npm run dev (Para desarrollo local sin Docker)
       * Qué hace: Inicia un servidor de desarrollo con hot-reload (recarga automática) para ver los cambios en tiempo
         real.

  4. Configuración de Red (Importante)
  El archivo docker-compose.yml indica que el proyecto depende de una red externa llamada mi-proyecto_default.

   * docker network create mi-proyecto_default
       * Qué hace: Crea manualmente la red virtual necesaria para que los contenedores puedan comunicarse entre sí si no
         existe previamente.

  Resumen del Flujo de Lanzamiento:
   1. Construcción del Backend: Maven descarga dependencias y crea el JAR.
   2. Construcción del Frontend: Node genera los archivos de producción.
   3. Despliegue Web: Nginx sirve el Frontend en el puerto 3000 (HTTP) y 443 (HTTPS).
   4. Despliegue API: El Backend arranca en el puerto 8081.
   5. Seguridad: Certbot se encarga de la renovación de certificados SSL cada 12 horas.


------------------------------------------------------------------------------------------------------
1. Container Management (Docker)
This is the primary method for launching the entire system (Frontend, Backend, and Certbot) in a unified way.

docker-compose up --build -d

What it does:

--build: Forces the rebuilding of Docker images for the Frontend and Backend (internally executing mvn package and npm run build).

up: Creates and starts the containers defined in docker-compose.yml.

-d: Runs the containers in the background (detached mode).

docker-compose down

What it does: Stops and removes the containers, networks, and volumes created by the project.

2. Backend (Java / Spring Boot)
Located in Proyecto-2-DAW-Back/servidor/app-horario/.

./mvnw clean package -DskipTests (Executed automatically within Docker)

What it does: Clears previous builds (clean), compiles the code, and generates an executable .jar file in the target/ folder. It skips tests to speed up the process.

java -jar target/*.jar

What it does: Launches the Spring Boot application directly if you have Java installed locally (port 8081).

3. Frontend (Vue.js / Vite)
Located in Proyecto-2-DAW-Front/cliente/mi-horario/.

npm install (Executed automatically within Docker)

What it does: Downloads all necessary dependencies defined in package.json.

npm run build (Executed automatically within Docker)

What it does: Compiles and optimizes the application for production, generating static files (HTML, JS, CSS) in the dist/ folder.

npm run dev (For local development without Docker)

What it does: Starts a development server with hot-reload to see changes in real-time.

4. Network Configuration (Important)
The docker-compose.yml file indicates that the project depends on an external network named mi-proyecto_default.

docker network create mi-proyecto_default

What it does: Manually creates the necessary virtual network so that containers can communicate with each other if it does not already exist.

Launch Workflow Summary
Backend Build: Maven downloads dependencies and creates the JAR file.

Frontend Build: Node generates the production files.

Web Deployment: Nginx serves the Frontend on port 3000 (HTTP) and 443 (HTTPS).

API Deployment: The Backend starts on port 8081.

Security: Certbot handles SSL certificate renewal every 12 hours.