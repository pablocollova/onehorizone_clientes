/**
 * seed.js — run with:  node seed.js
 * Creates one Client + one User for local dev/testing.
 * Uses the same PrismaPg adapter as the app so it works with the same DB.
 */
require("dotenv").config();
const prisma = require("./src/prisma");

async function main() {
    console.log("🌱 Seeding database...");

    // Upsert a client so re-runs are idempotent
    const client = await prisma.client.upsert({
        where: { email: "dev@onehorizon.es" },
        update: {},
        create: {
            name: "One Horizon Dev",
            email: "dev@onehorizon.es",
        },
    });
    console.log("✅ Client:", client.id, client.name);

    // Upsert the dev user
    const user = await prisma.user.upsert({
        where: { username: "admin" },
        update: { clientId: client.id },
        create: {
            username: "admin",
            password: "admin123",   // plain-text — auth route compares directly
            name: "Admin User",
            clientId: client.id,
        },
    });
    console.log("✅ User:", user.username, "/ password: admin123");
    console.log("🎉 Seed complete. Login with  admin / admin123");
}

main()
    .catch((e) => { console.error("🔥 Seed failed:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());
