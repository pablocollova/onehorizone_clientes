// En prisma/seed.js, antes de crear, verifica si ya existen:
async function main() {
    console.log("Seeding database...");

    // Buscar o crear cliente
    const client = await prisma.client.upsert({
        where: { email: "billing@horizon.com" },
        update: {},
        create: {
            name: "Horizon Corp",
            email: "billing@horizon.com",
        },
    });

    // Buscar o crear usuario
    const user = await prisma.user.upsert({
        where: { username: "juan" },
        update: {},
        create: {
            username: "juan",
            password: "1234",
            name: "Juan",
            clientId: client.id,
        },
    });

    console.log("✅ Seed finished (sin duplicados)");
}