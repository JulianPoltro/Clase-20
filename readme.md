Instalación del proyecto:

npm init -y
npm install express mongodb
crear un archivo en src/mongodb.js donde pondremos la configuración de conexión a la BD
creamos el archivo server.js que será el punto de entrada a nuestra aplicación
crear un archivo .env donde irá nuestras credenciales/ruta de conexión

configurar nuestro archivo mongo:

- Cargamos el archivo .env process.loadEnvFile()
- traemos el cliente: const { MongoClient } = require('mongodb')
- Conectamos con la connectionString
- Creamos las funciones de conexión y desconexión
