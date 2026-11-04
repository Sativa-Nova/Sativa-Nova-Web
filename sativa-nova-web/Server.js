const express = require('express');
const app = express(); // <--- Esto es lo que debe ir antes de usar app

// Justo después ya puedes usar app sin problemas:
app.use(express.static('public'));
