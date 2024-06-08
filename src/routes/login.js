
// Exportamos los modulos que vamos a usar
const express = require('express');
const LoginController = require('../controllers/LoginController');


// Creamos el router, que manejará las rutas
const router = express.Router();


// Manipulamos las peticiones HTTP y rutas
router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);
router.get('/logout', LoginController.logout);


// Exportamos el modulo
module.exports = router;
