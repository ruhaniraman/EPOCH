
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const themes = [
  {
    id: "cancer",
    code: "CAN",
    name: "Cancer",
    blurb: "Diagnosis records, staging and outcomes.",
    capacity: 5,
  },
  {
    id: "diabetes",
    code: "DIA",
    name: "Diabetes",
    blurb: "Glucose readings, lab panels and risk.",
    capacity: 5,
  },
  {
    id: "cardiac",
    code: "CAR",
    name: "Cardiac",
    blurb: "Vitals, ECG features and heart events.",
    capacity: 5,
  },
  {
    id: "operations",
    code: "OPS",
    name: "Hospital Operations",
    blurb: "Beds, staffing, wait times and flow.",
    capacity: 5,
  },
  {
    id: "icu",
    code: "ICU",
    name: "Emergency / ICU",
    blurb: "Triage, admissions and critical care.",
    capacity: 5,
  },
];

async function main() {
  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { id: theme.id },
      update: theme,
      create: theme,
    });
  }

  console.log("Successfully seeded all 5 EPOCH themes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
