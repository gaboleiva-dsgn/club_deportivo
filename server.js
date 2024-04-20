const fs = require("fs");

const express = require('express');
const app = express();

const PORT = 3000;
app.listen(3000, () => console.log("Servidor escuchando Puerto: " + PORT));

app.use(express.json());

app.get("/agregar", (req, res) => {

    const { nombre, precio } = req.query;

    if (!nombre || !precio) {
        return res.status(400).json({
            error: "Ups! se requiere nombre y precio"
        });
    }

    const nuevoDeporte = {
        nombre: nombre,
        precio: precio
    };

    const { deportes } = JSON.parse(fs.readFileSync("deportes.json", "utf8")); deportes.push(nuevoDeporte);

    fs.writeFileSync("deportes.json", JSON.stringify({ deportes }));
    res.send('Deporte creado con exito');
});


app.get("/deportes", (req, res) => {
    const { deportes } = JSON.parse(fs.readFileSync("deportes.json", "utf8"));

    deportes.forEach(element => {
        console.log(element.deporte + " " + element.precio);
    });
    res.send('Listado generado con exito!!!')
});

app.get("/editar/:nombre", (req, res) =>{
    const deporte = req.params.nombre;
    console.log(`El deporte que quiere editar es: ${deporte}`);
    res.send("Todo ok");
});

app.get("/eliminar/:nombre", (req, res) =>{
    // Para recibir parametros debo enviar el parametro directo por la ruta ej: (http://localhost:3000/eliminar/Basketball)
    const nombreDeporte = req.params.nombre;
    //console.log(`El deporte que quiere eliminar es: ${deporte}`);

    const data = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    console.log(data);
    const deportes = data.deportes;
    let busqueda = deportes.findIndex((deporte) => deporte.nombre == nombreDeporte);

    if(busqueda == -1){
        console.log("El deporte: " + nombreDeporte + " no existe");
        return res.send("El deporte buscado no existe")
        
    } else {
        console.log("El deporte es: ", deportes[busqueda]);
        deportes.splice(busqueda,1);
        fs.writeFileSync("deportes.json", JSON.stringify(data));
    }

    res.send(`Se ha eliminado ${nombreDeporte} de la lista con exito!!`);
});

app.get("*", (req, res) => {
    //
    res.send("Esta página no existe");
});

