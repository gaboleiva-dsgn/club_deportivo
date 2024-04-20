const fs = require("fs");

const express = require('express');
const app = express();

const PORT = 3000;
app.listen(3000, () => console.log("Servidor escuchando Puerto: " + PORT));

app.use(express.json());

app.get("/agregar", (req, res) => {

    const { deporte, precio } = req.query;

    if (!deporte || !precio) {
        return res.status(400).json({
            error: "Ups! se requiere deporte y precio"
        });
    }

    const nuevoDeporte = {
        deporte: deporte,
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

app.get("/eliminar/:deporte", (req, res) =>{
    const deporte = req.params.deporte;
    console.log(`El deporte que quiere eliminar es: ${deporte}`);
    // const data = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
    // console.log(data);
    // const deportes = data.deportes;
    // let busqueda = deportes.findIndex((deportes) => deportes.deporte == deporte);

    // if(busqueda == -1){
    //     console.log("El deporte: " + deporte + " no existe");
    //     return res.send("El deporte buscado no existe")
        
    // } else {
    //     console.log("El deporte es: ", deportes[busqueda]);
    //     deportes.splice(busqueda,1);
    //     fs.writeFileSync("deportes.json", JSON.stringify(data));
    // }

    res.send("Todo ok");
});

