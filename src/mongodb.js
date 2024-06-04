process.loadEnvFile();
const { MongoClient } = require("mongodb");

const URI = process.env.MONGODB_URLSTRING;
const client = new MongoClient(URI);

// const connectToMongoDB = async () => {
//   await client.connection();
// };

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Conectandose a MongoDB");
    return client;
  } catch (error) {
    console.error("Error al conectar a MongoDB");
    return null;
  }
}

async function disconnectFromMongoDB() {
  try {
    await client.close();
    console.log("Desconectandose a MongoDB");
  } catch (error) {
    console.error("Error al desconectar a MongoDB");
  }
}

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
};
