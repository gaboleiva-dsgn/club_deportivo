const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(3000, () => console.log(`servidor iniciado en el puerto ${PORT}`));