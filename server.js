const express = require("express");
const app = express();
const { connectToMongoDB, disconnectFromMongoDB } = require("./src/mongodb.js");
const { object } = require("zod");
const { ObjectId } = require("mongodb");
const morgan = require("morgan");
process.loadEnvFile();
const port = process.env.PORT ?? 3000;

//middleware
app.use(express.json());
app.use(morgan("dev"));

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
  const { genero } = req.query;
  try {
    const peliculas = !genero
      ? await req.db.find().toArray()
      : await req.db
          .find({ genre: { $regex: genero, $options: "i" } })
          .toArray();

    res.json(peliculas);
  } catch (error) {
    res.status(500).send("Error al obtener las peliculas");
  }
});

//Buscar una pelicula por ID
app.get("/peliculas/:id", async (req, res) => {
  const { id } = req.params;
  const objectId = new ObjectId(id);
  const pelicula = await req.db.findOne({ _id: objectId });
  if (pelicula) return res.json(pelicula);
  res.status(404).json({ message: "Peli no encontrada" });
});

//Agregar una peli
app.post("/peliculas", async (req, res) => {
  const resultado = validarPeli(req.body);

  if (!resultado.success) return res.status(400).json(resultado.error.message);

  // Agregar id interno es opcional en este caso ya que mongodb tambien genera su propio uuid
  const nuevaPeli = {
    id: crypto.randomUUID(),
    ...resultado.data,
  };

  try {
    await req.db.insertOne(nuevaPeli);
    res.json(nuevaPeli);
  } catch {
    return res.status(500).json({ message: "Error al agregar la peli" });
  }
});

//Borrar una peli por id
app.delete("/peliculas/:id", async (req, res) => {
  const { id } = req.params;
  const objectId = new ObjectId(id);

  try {
    const { deletedCount } = await req.db.deleteOne({ _id: objectId });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Peli no encontrada para borrar" });
    }
    res.json({ message: "Peli borrada con exito" });
  } catch (error) {
    return res.status(500).json({ message: "Error al borrar la peli" });
  }
});

//Modificar/Actualizar una peli
app.patch("/peliculas/:id", async (req, res) => {
  const resultado = validarPeliParcialmente(req.body);
  if (!resultado.success) return res.status(400).json(resultado.error.message);

  const { id } = req.params;
  const objectId = new ObjectId(id);

  try {
    const peliActualizada = await req.db.findOneAndUpdate(
      { _id: objectId },
      { $set: resultado.data },
      { returnDocument: "after" }
    );

    if (!peliActualizada) {
      return res
        .status(404)
        .json({ message: "Peli no encontrada para borrar" });
    }
    res.json({ message: "Peli actualizada con exito", peliActualizada });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la peli" });
  }
});

//Inicializamos el servidor
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
