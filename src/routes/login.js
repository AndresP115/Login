
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


// Obtener todos los usuarios
router.get('/users', LoginController.getAll);

// Obtener un usuario específico
router.get('/users/:email', LoginController.getUser);

// Eliminar un usuario
router.delete('/users/:email', LoginController.deleteUser);

// Actualizar un usuario
router.put('/users/:email', LoginController.updateUser);


// Exportamos el modulo
module.exports = router;
