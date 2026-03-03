const router = require("express").Router();
const jwt = require("jsonwebtoken");
const prisma = require('../prisma'); // 👈 IMPORTANTE: importar prisma

router.post("/login", (req, res, next) => {
    console.log('\n--- [auth/login] Request Logger ---');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body));
    console.log('-----------------------------------\n');
    next();
}, async (req, res) => {
    try {
        // 👈 Obtener username y password del body
        const { username, password } = req.body;

        // Validar que llegaron los datos
        if (!username || !password) {
            return res.status(400).json({ error: "username and password required" });
        }

        console.log('🔍 Buscando usuario:', username);

        // Buscar usuario en la base de datos
        const user = await prisma.user.findUnique({
            where: { username },
            include: { client: true },
        });

        console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No');

        // 👈 CORREGIDO: !user (no existe) O contraseña incorrecta
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Crear payload del token
        const payload = {
            id: user.id,
            clientId: user.clientId,
            username: user.username,
        };

        // Generar token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || "dev_secret",
            { expiresIn: "7d" }
        );

        console.log('✅ Login exitoso para:', username);

        // Responder con token y datos del usuario
        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
            },
        });

    } catch (error) {
        console.error('🔥 Error en login:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;