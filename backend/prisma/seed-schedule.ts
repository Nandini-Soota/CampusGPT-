import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'aarav.sharma@campusgpt.com',
    },
  });

  if (!user) {
    throw new Error('Aarav Sharma user was not found.');
  }

  // Remove existing schedule entries for this user
  const result = await prisma.scheduleEntry.deleteMany({
    where: {
      userId: user.id,
    },
  });

  console.log(`Deleted ${result.count} old schedule entries.`);

  // Temporary test schedule using the real weekly slot-code system
  const schedule = [
    {
      userId: user.id,
      courseName: 'Data Structures and Algorithms',
      day: 'Monday',
      slotCode: 'A11',
      startTime: '08:30',
      endTime: '10:00',
      room: 'AB-413',
      instructor: 'Dr. Sharma',
    },
    {
      userId: user.id,
      courseName: 'Applied Linear Algebra',
      day: 'Tuesday',
      slotCode: 'D11',
      startTime: '08:30',
      endTime: '10:00',
      room: 'AB-413',
      instructor: 'Dr. Mehta',
    },
    {
      userId: user.id,
      courseName: 'Object Oriented Programming',
      day: 'Wednesday',
      slotCode: 'A12',
      startTime: '08:30',
      endTime: '10:00',
      room: 'AB-413',
      instructor: 'Prof. Verma',
    },
    {
      userId: user.id,
      courseName: 'Database Management Systems',
      day: 'Thursday',
      slotCode: 'D12',
      startTime: '08:30',
      endTime: '10:00',
      room: 'AB-413',
      instructor: 'Dr. Patel',
    },
  ];

  await prisma.scheduleEntry.createMany({
    data: schedule,
  });

  console.log(
    `Created ${schedule.length} schedule entries for ${user.email}.`,
  );
}

main()
  .catch((error) => {
    console.error('Schedule seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });