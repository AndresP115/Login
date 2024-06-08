
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


// Manejamos la autentiacación del usuario
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
                            res.render('login/index', { error: 'Error: incorrect password !' });
                        } else {
                            req.session.loggedin = true;
                            req.session.name = element.name;

                            res.redirect('/');
                        }
                        
                    });
                });
                
            } else {

                // // Si no existe, muestra un error
                res.render('login/index', { error: 'Error: user not exists !' });
                
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
            if(userdata.length > 0){
                res.render('login/register', { error: 'Error: user already exist !' });
            } else {
                bcrypt.hash(data.password, 12).then(hash => {
                    data.password = hash;
             
                    req.getConnection((err, conn) => {
                     conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
                        
                        //Esta parte hace que inicie sesión inmediatamente al crear el usuario mediante el Registro
                        //req.session.loggedin = true;
                        req.session.name = data.name;

                         res.redirect('/login');
                     });
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


// Exportamos todas las funciones
module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout,

}
