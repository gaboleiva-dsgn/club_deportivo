const express = require("express");
const fs = require("fs");
const app = express();
const _ = require("lodash");
const PORT = 3000;

app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

//Middleware
app.use(express.json());
app.use(express.static("index.html"));

// Ruta raíz
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Creamos la ruta Agregar
app.get("/agregar", (req, res) => {
    const { nombre, precio } = req.query;

    if (!nombre || !precio || isNaN(parseFloat(precio))) {
        return res.status(400).json({
            error: "Se requiere nombre y precio como parámetros",
        });
    }

    // Verificamos que el archivo deportes.json existe, si no existe lo creamos con un arreglo vacío
    if (!fs.existsSync("deportes.json")) {
        fs.writeFileSync("deportes.json", "[]", "utf8");
    }

    // Leemos el archivo deportes.json
    let deportes = [];
    try {
        deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    } catch (error) {
        console.error("Error al leer el archivo deportes.json: ", error.message);
        return res.status(500).json({
            error: "No se puede leer el archivo JSON desde el servidor",
        });
    }

    // Validamos que al ingresar no ingresemos un deporte que existe
    if (deportes.find((deporte) => deporte.nombre === nombre)) {
        return res.status(500).json({
            error: "No puede ingresar un deporte que ya existe",
        });
    }

    // Agregamos el nuevo deporte al arreglo
    deportes.push({ nombre, precio: parseFloat(precio) });

    // persistimos el arreglo nuevo en el archivo deportes.json
    fs.writeFile("deportes.json", JSON.stringify(deportes), (err) => {
        if (err) {
            console.error("Error al escribir en deportes.json:", err);
            return res.status(500).json({
                error: "Error interno del servidor",
            });
        }
        console.log("Deporte agregado con éxito");
        res.send("Deporte agregado con éxito");
    });
});

// // Creamos la ruta Deportes
app.get("/deportes", (req, res) => {

    // Verificamos que el archivo deportes.json existe, si no existe lo creamos con un arreglo vacío
    if (!fs.existsSync("deportes.json")) {
        fs.writeFileSync("deportes.json", "[]", "utf8");
    }

    // Leemos el archivo deportes.json
    let deportes = [];
    try {
        deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    } catch (error) {
        console.error("Error al leer el archivo deportes.json: ", error.message);
        return res.status(500).json({
            error: "No se puede leer el archivo JSON desde el servidor",
        });
    }

    deportes = _.orderBy(deportes, ["nombre"], ["asc"]);
    console.log(deportes);
    res.send({ deportes });
});

// Creamos ruta Editar
app.get("/editar", (req, res) => {
    const { nombre, precio } = req.query;

    if (!nombre || !precio) {
        return res.send(
            "Se requiere nombre y precio como parámetros"
        );
    }

    // Verificamos si el precio es un numero
    if (isNaN(parseFloat(precio))) {
        return res.send("Precio debe ser un número válido");
    }

    // Leemos el archivo deportes.json
    fs.readFile("deportes.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error interno del servidor");
        }
        let deportes = JSON.parse(data);

        // Buscamos el deporte y se actualiza
        const index = deportes.findIndex((deporte) => deporte.nombre === nombre);
        if (index === -1) {
            return res.send("No existe ningún deporte con ese nombre");
        }
        deportes[index].precio = parseFloat(precio);
        // Persistimos la modificación en el archivo deportes.json
        fs.writeFile("deportes.json", JSON.stringify(deportes), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error interno del servidor");
            }
            res.send(`El precio del deporte ${nombre} se actualizó a ${precio}.`);
        });
    });
});

// Creamos la ruta Eliminar
app.get("/eliminar/:nombreDeporte", (req, res) => {
    const nombreDeporte = req.params.nombreDeporte;

    if (!nombreDeporte) {
        return res.status(400).json({
            error: "Debe igresar un deporte para eliminar",
        });
    }

    // Leer el archivo JSON de deportes
    fs.readFile("deportes.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "Error interno del servidor",
            });
        }

        let deportes = JSON.parse(data);
        const buscarDeporte = deportes.findIndex(
            (deporte) => deporte.nombre === nombreDeporte
        );

        if (buscarDeporte === -1) {
            return res.status(404).json({
                error: `El deporte '${nombreDeporte}' no existe en la lista`,
            });
        }

        // Eliminaamos con splice el deporte encontrado
        deportes.splice(buscarDeporte, 1);

        // Persistimos la eliminación en el archivo deportes.json
        fs.writeFile("deportes.json", JSON.stringify(deportes), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: "Error interno del servidor al escribir en el archivo de deportes",
                });
            }

            res.send(`El deporte '${nombreDeporte}' se eliminó correctamente`);
        });
    });
});

app.get("*", (req, res) => {
    res.send("Esta página no existe");
});