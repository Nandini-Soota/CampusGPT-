import 'dotenv/config';
import { PrismaClient, EventCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const events = [
  {
    title: 'Campus Tech Fest 2026',
    description:
      'A campus technology festival featuring coding challenges, project showcases, and technical activities.',
    category: EventCategory.TECHNICAL,
    venue: 'Main Auditorium',
    startsAt: new Date('2026-11-12T09:00:00+05:30'),
    endsAt: new Date('2026-11-12T17:00:00+05:30'),
    capacity: 200,
    isPublished: true,
  },
  {
    title: 'AI and Machine Learning Workshop',
    description:
      'An introductory hands-on workshop covering artificial intelligence and machine learning concepts.',
    category: EventCategory.WORKSHOP,
    venue: 'Computer Lab 2',
    startsAt: new Date('2026-11-20T10:00:00+05:30'),
    endsAt: new Date('2026-11-20T13:00:00+05:30'),
    capacity: 60,
    isPublished: true,
  },
  {
    title: 'Cultural Night 2026',
    description:
      'An evening of music, dance, performances, and student creativity.',
    category: EventCategory.CULTURAL,
    venue: 'Open Air Theatre',
    startsAt: new Date('2026-12-04T17:00:00+05:30'),
    endsAt: new Date('2026-12-04T21:00:00+05:30'),
    capacity: 300,
    isPublished: true,
  },
];

async function main() {
  for (const event of events) {
    const existing = await prisma.event.findFirst({
      where: { title: event.title },
    });

    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: event,
      });

      console.log(`Updated: ${event.title}`);
    } else {
      await prisma.event.create({
        data: event,
      });

      console.log(`Created: ${event.title}`);
    }
  }

  console.log('Event demo data is ready!');
}

main()
  .catch((error) => {
    console.error('Event seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });