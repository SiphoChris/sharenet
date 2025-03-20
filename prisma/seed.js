import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

const generateReferenceCode = () =>
  crypto.randomBytes(6).toString("hex").toUpperCase();

async function main() {
  await prisma.booking.createMany({
    data: [
      {
        name: "Music Festival",
        date: new Date("2024-09-20"),
        status: "available",
        reference: generateReferenceCode(),
        totalSeats: 500,
        availableSeats: 500,
      },
      {
        name: "Tech Conference",
        date: new Date("2024-10-05"),
        status: "sold out",
        reference: generateReferenceCode(),
        totalSeats: 200,
        availableSeats: 0,
      },
      {
        name: "Comedy Show",
        date: new Date("2024-11-15"),
        status: "available",
        reference: generateReferenceCode(),
        totalSeats: 150,
        availableSeats: 75,
      },
      {
        name: "Art Exhibition",
        date: new Date("2024-12-01"),
        status: "sold out",
        reference: generateReferenceCode(),
        totalSeats: 300,
        availableSeats: 0,
      },
      {
        name: "Football Match",
        date: new Date("2024-12-10"),
        status: "available",
        reference: generateReferenceCode(),
        totalSeats: 1000,
        availableSeats: 350,
      },
    ],
  });
  console.log("Seed data added!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
