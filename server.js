const fs = require("fs");

const express = require('express');
const app = express();

const PORT = 3000;
app.listen(3000, () => console.log("Servidor escuchando por Puerto: " + PORT));
const _ = require("lodash");
app.use(express.json());

app.get("/agregar", (req, res) => {

    const { nombre, precio } = req.query;

    if (!nombre || !precio || isNaN(parseFloat(precio))) {
        return res.status(400).json({
            error: "Ups! se requiere nombre y precio"
        });
    }

    // Validamos si existe el archivo JSON deportes.json, si no lo creamos con un arreglo vacio
    if (!fs.existsSync("deportes.json")) {
        fs.writeFileSync("deportes.json", "[]", "utf8");
    }

    // Leer el archivo JSON de deportes
    let archivoDeportes = [];

    try {
        archivoDeportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    } catch (error) {
        console.error("Error al leer el archivo deportes.json: ", error.message);
        return res.status(500).json({
            error: "No se puede leer el archivo JSON desde el servidor",
        });
    }
    console.log(`archivoDeportes es: ${archivoDeportes}`)
    if (archivoDeportes.find((deporte) => deporte.nombre === nombre)) {
        return res.status(400).json({
            error: "Ya existe un deporte con ese nombre",
        });
    } else {
        archivoDeportes.push({ nombre: nombre, precio: precio });
        fs.writeFileSync("deportes.json", JSON.stringify({ deportes }));
        res.send('Deporte creado con exito');
    }

});


app.get("/deportes", (req, res) => {
    // Verificar si el archivo JSON de deportes existe
    if (!fs.existsSync("deportes.json")) {
        // Si no existe, inicializar el archivo con un arreglo vacío
        fs.writeFileSync("deportes.json", "[]", "utf8");
    }

    // Leer el archivo JSON de deportes
    let deportes = [];
    try {
        deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    } catch (error) {
        console.error("Error al leer el archivo de deportes JSON: ", error.message);
        return res.status(500).json({
            error: "Error interno del servidor",
        });
    }
    //usar lodash para ordenar el archivo json por la consola
    deportes = _.orderBy(deportes, ["nombre"], ["asc"]);


    // Enviar la lista de deportes en formato JSON como respuesta
    console.log(deportes);
    res.send({ deportes });
});

app.get("/modificar", (req, res) => {
    const { nombre, precio } = req.query;

    // Verificar el nombre y precio
    if (!nombre || !precio) {
        return res.send(
            "Ingrese nombre del deporte para editar su valor, o todos los parámetros correspondientes"
        );
    }

    // Verificar si el precio es un número
    if (isNaN(parseFloat(precio))) {
        return res.send("El precio debe ser un número válido");
    }

    // Leer el archivo de deportes.json
    fs.readFile("deportes.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error interno del servidor");
        }
        let deportes = JSON.parse(data);

        // Busca el deporte y actualiza el valor
        const index = deportes.findIndex((deporte) => deporte.nombre === nombre);
        if (index === -1) {
            return res.send("No existe ningún deporte con ese nombre");
        }
        deportes[index].precio = parseFloat(precio); // Convertir el precio a número
        fs.writeFile("deportes.json", JSON.stringify(deportes), (err) => {
            //guarda el valor
            if (err) {
                console.error(err);
                return res.status(500).send("Error interno del servidor");
            }
            res.send(`El precio del deporte ${nombre} se actualizó a ${precio}.`);
        });
    });
});

app.get("/eliminar/:nombre", (req, res) => {
    // Para recibir parametros debo enviar el parametro directo por la ruta ej: (http://localhost:3000/eliminar/Basketball)
    const nombreDeporte = req.params.nombre;
    //console.log(`El deporte que quiere eliminar es: ${deporte}`);

    const data = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    console.log(data);
    const deportes = data.deportes;
    let busqueda = deportes.findIndex((deporte) => deporte.nombre == nombreDeporte);

    if (busqueda == -1) {
        console.log("El deporte: " + nombreDeporte + " no existe");
        return res.send("El deporte buscado no existe")

    } else {
        console.log("El deporte es: ", deportes[busqueda]);
        deportes.splice(busqueda, 1);
        fs.writeFileSync("deportes.json", JSON.stringify(data));
    }

    res.send(`Se ha eliminado ${nombreDeporte} de la lista con exito!!`);
});

app.get("*", (req, res) => {
    //
    res.send("Esta página no existe");
});

