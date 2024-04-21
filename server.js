const fs = require("fs");
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static("public"));

app.listen(PORT, () => console.log("Servidor escuchando por Puerto: " + PORT));

// Ruta raíz
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/agregar", (req, res) => {
    const { nombre, precio } = req.query;

    if (!nombre || !precio) {
        return res.status(400).json({
            error: "Se requiere nombre y precio como parámetros"
        });
    }

    const precioFloat = parseFloat(precio);
    if (isNaN(precioFloat)) {
        return res.status(400).json({
            error: "El precio debe ser un número válido"
        });
    }

    if (!fs.existsSync("deportes.json")) {
        fs.writeFileSync("deportes.json", JSON.stringify([]), "utf8"); // Asegúrate de escribir un array vacío
    }

    let archivoDeportes = [];
    try {
        archivoDeportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
        if (!Array.isArray(archivoDeportes)) { // Verifica que sea realmente un array
            archivoDeportes = [];
        }
    } catch (error) {
        console.error("Error al leer el archivo deportes.json: ", error.message);
        return res.status(500).json({
            error: "No se puede leer el archivo JSON desde el servidor",
        });
    }

    if (archivoDeportes.find(deporte => deporte.nombre === nombre)) {
        return res.status(400).json({
            error: "Ya existe un deporte con ese nombre",
        });
    } else {
        archivoDeportes.push({ nombre, precio: precioFloat });
        fs.writeFileSync("deportes.json", JSON.stringify(archivoDeportes));
        res.send('Deporte creado con éxito');
    }
});

// se crea ruta para listar todos los deportes
app.get("/deportes", (req, res) => {
    // Verificar si el archivo JSON de deportes existe
    if (!fs.existsSync("deportes.json")) {
        // Si no existe, inicializar el archivo con un arreglo vacío
        fs.writeFileSync("deportes.json", "[]", "utf8");
    }

    // Leer el archivo JSON de deportes
    let deportes = [];
    // Leer el archivo JSON de deportes
    try {
        deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    } catch (error) {
        console.error("Error al leer el archivo de deportes JSON: ", error.message);
        return res.status(500).json({
            error: "Error interno del servidor",
        });
    }
    //usar lodash para ordenar el archivo json 
    deportes = _.orderBy(deportes, ["nombre"], ["asc"]);


    // Enviar la lista de deportes en formato JSON como respuesta
    console.log(deportes);
    res.send({ deportes });
});

app.get("/modificar", (req, res) => {
    const { nombre, precio } = req.query;

    // Validamos que nos envían el nombre y precio
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
        deportes[index].precio = parseFloat(precio);
        fs.writeFile("deportes.json", JSON.stringify(deportes), (err) => {
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

