let cart = {
    list: async(req, res) => {
    
    let carrito = []; 
    
    if(req.cookies.carrito_cookie){
        try{
            carrito = JSON.parse(req.cookies.carrito_cookie);
        } catch(error){
            carrito = [];
        }
    }
    
    if (req.session.cart && req.session.cart.length > 0) { 
        if (carrito.length === 0) {
            carrito = req.session.cart;
        }
    }
    
    carrito = Array.isArray(carrito) ? carrito : [];
    
    res.cookie("carrito_cookie", JSON.stringify(carrito), {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 días
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'none',
        path: "/"
    });

    req.session.cart = carrito;

    res.json({
        success: true,
        carrito: carrito,
        count: carrito.length,
        fuente: req.cookies.carrito_cookie ? 'cookie' : (req.session.cart ? 'session' : 'nuevo'),
        sessionId: req.sessionID
    });
},

    save: async(req, res) => {
    try {
        const { cart } = req.body;
        
        if (!Array.isArray(cart)) {
            return res.status(400).json({
                success: false,
                message: 'El carrito debe ser un array'
            });
        }
        req.session.cart = cart;
        
        res.cookie('carrito_cookie', JSON.stringify(cart), {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 días
            httpOnly: true, 
            path: '/', 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none' 
        });

        res.json({
            success: true,
            message: 'Carrito guardado en session y cookies',
            count: cart.length,
            sessionId: req.sessionID,
            cookieGuardada: true
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error guardando carrito'
        });
    }
},
    clear: async(req, res) => {
        req.session.cart = [];
        res.clearCookie('carrito_cookie', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });

        res.json({
            success: true,
            message: 'Carrito limpiado de session y cookies'
        });
    }
}
module.exports = cart;