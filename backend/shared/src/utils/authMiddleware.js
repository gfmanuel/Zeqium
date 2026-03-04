const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("CRÍTICO: JWT_SECRET no definido en las variables de entorno.");
    process.exit(1);
}

const authMiddleware = (requiredRole) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ error: 'No tienes permisos para esta acción' });
            }
            req.user = decoded;
            next();
        } catch (err) {
            res.status(401).json({ error: 'Token inválido o expirado' });
        }
    };
};

module.exports = { authMiddleware, JWT_SECRET };