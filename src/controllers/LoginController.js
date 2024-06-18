
// Importamos el modulo necesario
const bcrypt = require('bcrypt');


// Renderizamos el login o dirigimos al usuario al home
function login(req, res) {
    if(req.session.loggedin != true){
        res.render('login/index');
    } else {
        res.redirect('/')
    }
}


// Manejamos la autenticación del usuario
function auth(req, res) {
    const data = req.body;
    req.getConnection((err, conn) => {

        // Consultamos la base de datos para encontrar el usuario
        conn.query('SELECT * FROM users WHERE email = ?', [data.email], (err, userdata) => {
            
            // Si lo encuentra redirige al usuario a la página de confirmación
            if(userdata.length > 0){

                userdata.forEach(element => {
                    bcrypt.compare(data.password, element.password, (err, isMatch) => {
                        if(!isMatch){

                            // Si existe, pero estan mal los datos, muestra un error
                            if (req.is('application/json')) {
                                return res.status(401).json({ error: 'Incorrect password' });
                            } else {
                                return res.render('login/index', { error: 'Incorrect password' });
                            }
                        } else {
                            req.session.loggedin = true;
                            req.session.name = element.name;

                            if (req.is('application/json')) {
                                return res.status(200).json({ message: 'Login successful', name: element.name });
                            } else {
                                return res.redirect('/');
                            }
                        }
                        
                    });
                });
                
            } else {

                // Si no existe, muestra un error
                if (req.is('application/json')) {
                    return res.status(404).json({ error: 'User not exists' });
                } else {
                    return res.render('login/index', { error: 'User not exists' });
                }
                
            }
        });
    });
}


// Renderiza el registro o redirige al usuario al inicio
function register(req, res) {
    if(req.session.loggedin != true){
        res.render('login/register');
    } else {
        res.redirect('/')
    }
}


// Manejamos toda la lógica del registro
function storeUser (req, res) {
    const data = req.body;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM users WHERE email = ?', [data.email], (err, userdata) => {
            if (err) {
                if (req.is('application/json')) {
                    return res.status(500).json({ error: err.message });
                } else {
                    return res.render('login/register', { error: 'Internal server error' });
                }
            }

            if(userdata.length > 0){
                if (req.is('application/json')) {
                    return res.status(400).json({ error: 'User already exists' });
                } else {
                    return res.render('login/register', { error: 'User already exists' });
                }
            } else {
                bcrypt.hash(data.password, 12).then(hash => {
                    data.password = hash;

                    conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
                        if (err) {
                            if (req.is('application/json')) {
                                return res.status(500).json({ error: err.message });
                            } else {
                                return res.render('login/register', { error: 'Internal server error' });
                            }
                        }

                        if (req.is('application/json')) {
                            return res.status(201).json({ message: 'User registered successfully' });
                        } else {
                            res.redirect('/login');
                        }
                    });
                });
            }
        });
    });
}


// Definimos la lógica del cierre de sesión 
function logout(req, res) {
    if(req.session.loggedin == true) {

        // Destruimos la sesión
        req.session.destroy();
    
    }

    // Enviamos al usuario al login
    res.redirect('/login');
    
}

// Función para obtener todos los usuarios
function getAll(req, res) {
    req.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        connection.query('SELECT * FROM users', (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    });
}

// Función para obtener un usuario
function getUser(req, res) {
    const userEmail = req.params.email;
    req.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        connection.query('SELECT * FROM users WHERE email = ?', [userEmail], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(results[0]); // Devolver el primer resultado (suponiendo que el correo electrónico es único)
        });
    });
}


// Función para eliminar un usuario
function deleteUser(req, res) {
    const userEmail = req.params.email;
    req.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        connection.query('DELETE FROM users WHERE email = ?', [userEmail], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'User deleted successfully' });
        });
    });
}

// Función para actualizar un usuario
function updateUser(req, res) {
    const userEmail = req.params.email;
    const data = req.body;

    req.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Encriptar la nueva contraseña si se proporciona
        if (data.password) {
            bcrypt.hash(data.password, 12).then(hash => {
                data.password = hash;

                connection.query('UPDATE users SET ? WHERE email = ?', [data, userEmail], (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'User updated successfully' });
                });
            });
        } else {
            connection.query('UPDATE users SET ? WHERE email = ?', [data, userEmail], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'User updated successfully' });
            });
        }
    });
}



// Exportamos todas las funciones
module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout,
    getAll,
    getUser,
    deleteUser,
    updateUser,

}
