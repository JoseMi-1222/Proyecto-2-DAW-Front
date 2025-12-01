# Proyecto-2-DAW
Proyecto de final de Grado Superior hecho por Jose Miguel Arras Gavira y Juan Antonio Sancho Hidalgo

📘 Guía de Despliegue: Proyecto Horarios (TFG)
Autor: Jose Miguel Arras Gavira / Juan Antonio Sancho Hidalgo
Fecha: 1 de Diciembre de 2025
Entorno: Windows (PowerShell) + Docker (Ubuntu 22.04)

1. Preparación Previa (En Windows)
Antes de iniciar Docker, es crítico configurar el código para permitir la conexión y ubicarse en el directorio correcto.
1.1 Ubicación
Abre PowerShell y navega a la carpeta raíz que contiene el directorio data.
PowerShell
cd "Ruta\Donde\Tengas\Tu\Proyecto"
# Ejemplo: cd "C:\Users\Jose Miguel\Desktop\JoseMi"

Verificación: Al escribir ls o dir, debe aparecer la carpeta data.
1.2 Configuración CORS (Backend)
Para evitar errores de conexión entre el Front y el Back, edita el siguiente archivo en VS Code:
Ruta: data/servidor/app-horario/src/main/java/com/ies/poligono/sur/app/horario/security/CorsConfig.java
Acción: Añade el puerto 5147 a la lista de orígenes permitidos.
Java
config.setAllowedOrigins(List.of("http://localhost:5173", "http://172.17.0.2:5173", "http://localhost:5147"));

Guarda el archivo (Ctrl + S).

2. Creación del Entorno Docker
Ejecuta el siguiente comando en PowerShell para levantar el contenedor Ubuntu mapeando la carpeta actual:
PowerShell
docker run -it --name ubuntu-dev -p 8080:8080 -p 8081:8081 -p 5147:5147 -p 3306:3306 -v "${PWD}:/workspace" ubuntu:22.04 bash (Windows)
docker run -it --name ubuntu-dev -p 8080:8080 -p 8081:8081 -p 5147:5147 -p 3306:3306 -v "$(pwd):/workspace" ubuntu:22.04 bash (Ubuntu) 

Nota: Si el contenedor ya existe, usa docker start -ai ubuntu-dev. Una vez dentro, el prompt cambiará a root@....

3. Instalación de Dependencias (Dentro del Docker)
Copia y pega el siguiente bloque de comandos en la terminal de Docker para instalar Java 21, Maven, Node.js 24 y MariaDB:
Bash
apt update && apt install -y curl software-properties-common openjdk-21-jdk maven mariadb-server mariadb-client

# Instalar Node.js v24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

4. Configuración de Base de Datos
El servicio MariaDB debe iniciarse y configurarse manualmente cada vez que se crea el contenedor de cero.
Bash
# Iniciar el servicio
service mariadb start

# Crear BD y Usuario admin
mariadb -u root -e "CREATE DATABASE IF NOT EXISTS \`app-horario\`; CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'admin'; GRANT ALL PRIVILEGES ON \`app-horario\`.* TO 'admin'@'%'; FLUSH PRIVILEGES;"

5. Ejecución del Backend (Servidor)
Lanza el servidor Spring Boot. Este comando bloqueará la terminal.
Bash
cd /workspace/data/servidor/app-horario
mvn spring-boot:run

ESPERA hasta ver el mensaje: Started AppHorarioApplication in X.XXX seconds. NO CIERRES esta terminal. Déjala minimizada.

6. Ejecución del Frontend (Cliente)
Abre una NUEVA ventana de PowerShell en Windows para controlar el Frontend.
6.1 Acceder al contenedor
PowerShell
docker exec -it ubuntu-dev bash

6.2 Reinstalar dependencias de Node
Es necesario reemplazar las dependencias de Windows por las de Linux.
Bash
cd /workspace/data/cliente/mi-horario
rm -rf node_modules
npm install

6.3 Lanzar servidor Vue
Forzamos el puerto 5147 para que coincida con Docker.
Bash
npm run dev -- --port 5147 --host

7. Acceso y Carga de Datos
Abre tu navegador web y entra en: http://localhost:5147
Credenciales Admin:
Usuario: admin@admin.com
Clave: admin
Carga de Horarios:
En el menú, selecciona la opción de importar/cargar.
Sube el archivo: data/servidor/BBDD/horario_formato_nuevo.txt
Espera el mensaje de éxito.
7.1 Acceso Profesor
Cierra sesión de admin.
Prueba con un usuario profesor generado (Ej: nombre.apellido@iespoligonosur.org).
Contraseña por defecto: Pass123.

