// prisma/seed.js
const prisma = require("../src/prisma"); // usa el prisma con adapter-pg

async function main() {
  console.log("Seeding database...");

  // Crear/actualizar cliente (requiere Client.email UNIQUE)
  const client = await prisma.client.upsert({
    where: { email: "billing@horizon.com" },
    update: {},
    create: {
      name: "Horizon Corp",
      email: "billing@horizon.com",
    },
  });

  // Crear/actualizar usuario (requiere User.username UNIQUE)
  const user = await prisma.user.upsert({
    where: { username: "juan" },
    update: {
      // opcional: si querés “arreglar” password en cada seed
      password: "1234",
      clientId: client.id,
      name: "Juan",
    },
    create: {
      username: "juan",
      password: "1234",
      name: "Juan",
      clientId: client.id,
    },
  });

  const usersCount = await prisma.user.count();
  const clientsCount = await prisma.client.count();

  console.log("✅ Seed finished");
  console.log("Client:", client.id, client.email);
  console.log("User:", user.id, user.username);
  console.log("Counts => clients:", clientsCount, "users:", usersCount);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });