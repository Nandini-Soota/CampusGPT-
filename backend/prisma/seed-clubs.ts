
import 'dotenv/config';
import { PrismaClient, ClubCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const clubs = [
  {
    name: 'AI & Machine Learning Club',
    description:
      'Explore artificial intelligence, machine learning, deep learning, and real-world AI projects through workshops, competitions, and collaborative learning.',
    category: ClubCategory.TECHNICAL,
    email: 'aiml@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
  {
    name: 'Android Development Club',
    description:
      'Build Android applications, learn Kotlin and modern mobile development, and participate in app-building challenges.',
    category: ClubCategory.TECHNICAL,
    email: 'android@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
  {
    name: 'Blockchain & Web3 Club',
    description:
      'Learn blockchain fundamentals, smart contracts, decentralized applications, and emerging Web3 technologies.',
    category: ClubCategory.TECHNICAL,
    email: 'blockchain@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
  {
    name: 'Robotics & Innovation Club',
    description:
      'Design, build, and program robots through hands-on electronics, embedded systems, automation, and innovation projects.',
    category: ClubCategory.TECHNICAL,
    email: 'robotics@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
  {
    name: 'Cultural & Performing Arts Club',
    description:
      'Celebrate creativity through music, dance, theatre, cultural festivals, and performances across campus.',
    category: ClubCategory.CULTURAL,
    email: 'cultural@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
  {
    name: 'Literary & Debate Society',
    description:
      'Develop communication, public speaking, writing, debating, and critical thinking through discussions and competitions.',
    category: ClubCategory.LITERARY,
    email: 'literary@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
  {
    name: 'Campus Sports Club',
    description:
      'Bring students together through sports tournaments, fitness activities, team events, and recreational games.',
    category: ClubCategory.SPORTS,
    email: 'sports@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
  {
    name: 'Entrepreneurship & Startup Club',
    description:
      'Turn ideas into ventures through startup sessions, business model workshops, pitching events, and mentorship activities.',
    category: ClubCategory.ENTREPRENEURSHIP,
    email: 'startup@campusgpt.com',
    instagram: 'https://instagram.com/',
  },
];

async function main() {
  console.log('Starting CampusGPT clubs seed...');

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { name: club.name },
      update: {
        description: club.description,
        category: club.category,
        email: club.email,
        instagram: club.instagram,
        isActive: true,
      },
      create: {
        ...club,
        isVerified: true,
        isActive: true,
      },
    });

    console.log(`Processed: ${club.name}`);
  }

  const total = await prisma.club.count();

  console.log(`Clubs seed completed. Total clubs in database: ${total}`);
}

main()
  .catch((error) => {
    console.error('Clubs seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
