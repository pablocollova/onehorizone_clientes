// backend/prisma/seed.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const prisma = require("../src/prisma");

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.auditLog.deleteMany();
  await prisma.gdprRequest.deleteMany();
  await prisma.consentLog.deleteMany();
  await prisma.serviceRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.inviteToken.deleteMany(); // Must be before User
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();
  await prisma.vendor.deleteMany();

  const password = await bcrypt.hash("admin123", 10);

  // ===== CLIENTS =====
  const horizon = await prisma.client.create({
    data: {
      name: "Horizon Corp",
      email: "contact@horizon.com",
    },
  });

  const atlantic = await prisma.client.create({
    data: {
      name: "Atlantic Group",
      email: "info@atlantic.com",
    },
  });

  // ===== USERS =====
  await prisma.user.createMany({
    data: [
      {
        username: "platform_admin",
        email: "platform_admin@onehorizon.local",
        password,
        name: "Platform Admin",
        clientId: null, // Platform-level, no specific client
        role: "PLATFORM_ADMIN",
        status: "ACTIVE"
      },
      {
        username: "horizon_admin",
        email: "horizon_admin@onehorizon.local",
        password,
        name: "Horizon Admin",
        clientId: horizon.id,
        role: "CLIENT_ADMIN",
        status: "ACTIVE"
      },
      {
        username: "manager",
        email: "manager@onehorizon.local",
        password,
        name: "Horizon Manager",
        clientId: horizon.id,
        role: "CLIENT_ADMIN",
        status: "ACTIVE"
      },
      {
        username: "atlantic_admin",
        email: "atlantic_admin@onehorizon.local",
        password,
        name: "Atlantic Admin",
        clientId: atlantic.id,
        role: "CLIENT_ADMIN",
        status: "ACTIVE"
      },
      {
        username: "atlantic_user",
        email: "atlantic_user@onehorizon.local",
        password,
        name: "Atlantic User",
        clientId: atlantic.id,
        role: "CLIENT_USER",
        status: "ACTIVE"
      },
    ],
  });

  // ===== LOCATIONS =====
  const horizonHQ = await prisma.location.create({
    data: {
      label: "Horizon HQ",
      address: "Madrid Central",
      clientId: horizon.id,
    },
  });

  const horizonBranch = await prisma.location.create({
    data: {
      label: "Horizon Branch",
      address: "Barcelona Office",
      clientId: horizon.id,
    },
  });

  const atlanticHQ = await prisma.location.create({
    data: {
      label: "Atlantic HQ",
      address: "Lisbon Center",
      clientId: atlantic.id,
    },
  });

  const atlanticBranch = await prisma.location.create({
    data: {
      label: "Atlantic Branch",
      address: "Porto Office",
      clientId: atlantic.id,
    },
  });

  // ===== INVOICES =====
  await prisma.invoice.createMany({
    data: [
      {
        clientId: horizon.id,
        locationId: horizonHQ.id,
        type: "ONEHORIZON_FEE",
        status: "ISSUED",
        totalCents: 450000,
      },
      {
        clientId: horizon.id,
        locationId: horizonBranch.id,
        type: "VENDOR_REBILL",
        status: "OVERDUE",
        totalCents: 180000,
      },
      {
        clientId: atlantic.id,
        locationId: atlanticHQ.id,
        type: "ONEHORIZON_FEE",
        status: "PAID",
        totalCents: 600000,
      },
      {
        clientId: atlantic.id,
        locationId: atlanticBranch.id,
        type: "VENDOR_DIRECT",
        status: "ISSUED",
        totalCents: 250000,
      },
    ],
  });

  // ===== DOCUMENTS =====
  await prisma.document.createMany({
    data: [
      {
        clientId: horizon.id,
        name: "Annual Contract.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2400000,
        storagePath: "/docs/horizon_contract.pdf",
      },
      {
        clientId: horizon.id,
        name: "Utility Invoice.xlsx",
        mimeType: "application/vnd.ms-excel",
        sizeBytes: 120000,
        storagePath: "/docs/horizon_invoice.xlsx",
      },
      {
        clientId: atlantic.id,
        name: "Service Agreement.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1800000,
        storagePath: "/docs/atlantic_agreement.pdf",
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
