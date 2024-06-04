const express = require("express");
const app = express();
const { connectToMongoDB, disconnectFromMongoDB } = require("./src/mongodb.js");
const { object } = require("zod");
const { ObjectId } = require("mongodb");
process.loadEnvFile();
const port = process.env.PORT ?? 3000;

app.use("/peliculas", connectToMongoDB, async (req, res, next) => {
  //espera que finalicen todas las rutas para hacer la desconeccion
  res.on("finish", async () => {
    await disconnectFromMongoDB();
  });
  next();
});

app.get("/", (req, res) => {
  res.json("Bienvenido a la API de peliculas !");
});
//Obtener las peliculas
app.get("/peliculas", async (req, res) => {
  try {
    const peliculas = await req.db.find().toArray();
    res.json(peliculas);
  } catch (error) {
    res.status(500).send("Error al obtener las peliculas");
  }
});

app.get("/peliculas/:id", async (req, res) => {
  const { id } = req.params;
  const objectId = new ObjectId(id);
  const pelicula = await req.db.findOne({ _id: objectId });
  if (pelicula) return res.json(pelicula);
  res.status(404).json({ message: "Pelicula no encontrada" });
});

//Inicializamos el servidor
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
