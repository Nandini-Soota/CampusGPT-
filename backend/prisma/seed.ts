import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'CampusGPT@123';

async function main() {
  console.log('🌱 Starting CampusGPT database seed...');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --------------------------------------------------
  // 1. Clear existing mock data
  // --------------------------------------------------

  await prisma.campusLocation.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing users and campus locations cleared.');

  // --------------------------------------------------
  // 2. Create Users
  // --------------------------------------------------

  const users = [
    // ---------------- STUDENTS ----------------
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 2,
      phone: '9876501001',
    },
    {
      name: 'Ananya Verma',
      email: 'ananya.verma@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 3,
      phone: '9876501002',
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ECE',
      year: 2,
      phone: '9876501003',
    },
    {
      name: 'Priya Singh',
      email: 'priya.singh@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ECE',
      year: 3,
      phone: '9876501004',
    },
    {
      name: 'Aditya Patel',
      email: 'aditya.patel@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ME',
      year: 1,
      phone: '9876501005',
    },
    {
      name: 'Ishita Gupta',
      email: 'ishita.gupta@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ME',
      year: 2,
      phone: '9876501006',
    },
    {
      name: 'Karan Malhotra',
      email: 'karan.malhotra@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CE',
      year: 4,
      phone: '9876501007',
    },
    {
      name: 'Sneha Joshi',
      email: 'sneha.joshi@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 1,
      phone: '9876501008',
    },
    {
      name: 'Vivek Nair',
      email: 'vivek.nair@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ECE',
      year: 4,
      phone: '9876501009',
    },
    {
      name: 'Meera Kapoor',
      email: 'meera.kapoor@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 2,
      phone: '9876501010',
    },
    {
      name: 'Rahul Yadav',
      email: 'rahul.yadav@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CE',
      year: 3,
      phone: '9876501011',
    },
    {
      name: 'Diya Shah',
      email: 'diya.shah@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ME',
      year: 4,
      phone: '9876501012',
    },
    {
      name: 'Arjun Rao',
      email: 'arjun.rao@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 4,
      phone: '9876501013',
    },
    {
      name: 'Kavya Iyer',
      email: 'kavya.iyer@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ECE',
      year: 1,
      phone: '9876501014',
    },
    {
      name: 'Manav Jain',
      email: 'manav.jain@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 3,
      phone: '9876501015',
    },
    {
      name: 'Tanya Bansal',
      email: 'tanya.bansal@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CE',
      year: 2,
      phone: '9876501016',
    },
    {
      name: 'Yash Thakur',
      email: 'yash.thakur@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ME',
      year: 3,
      phone: '9876501017',
    },
    {
      name: 'Nisha Agarwal',
      email: 'nisha.agarwal@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 1,
      phone: '9876501018',
    },
    {
      name: 'Dev Mishra',
      email: 'dev.mishra@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ECE',
      year: 2,
      phone: '9876501019',
    },
    {
      name: 'Simran Kaur',
      email: 'simran.kaur@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 3,
      phone: '9876501020',
    },
    {
      name: 'Harsh Vardhan',
      email: 'harsh.vardhan@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CE',
      year: 4,
      phone: '9876501021',
    },
    {
      name: 'Pooja Soni',
      email: 'pooja.soni@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ME',
      year: 2,
      phone: '9876501022',
    },
    {
      name: 'Akash Verma',
      email: 'akash.verma@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'CSE',
      year: 4,
      phone: '9876501023',
    },
    {
      name: 'Riya Choudhary',
      email: 'riya.choudhary@campusgpt.com',
      role: 'STUDENT' as const,
      branch: 'ECE',
      year: 3,
      phone: '9876501024',
    },

    // ---------------- PROCTORS ----------------
    {
      name: 'Dr. Amit Kulkarni',
      email: 'amit.kulkarni@campusgpt.com',
      role: 'PROCTOR' as const,
      branch: 'CSE',
      year: undefined,
      phone: '9876502001',
    },
    {
      name: 'Dr. Neha Kapoor',
      email: 'neha.kapoor@campusgpt.com',
      role: 'PROCTOR' as const,
      branch: 'ECE',
      year: undefined,
      phone: '9876502002',
    },
    {
      name: 'Dr. Suresh Menon',
      email: 'suresh.menon@campusgpt.com',
      role: 'PROCTOR' as const,
      branch: 'ME',
      year: undefined,
      phone: '9876502003',
    },

    // ---------------- CLUB ADMINS ----------------
    {
      name: 'Vikram Desai',
      email: 'vikram.desai@campusgpt.com',
      role: 'CLUB_ADMIN' as const,
      branch: 'CSE',
      year: 4,
      phone: '9876503001',
    },
    {
      name: 'Shreya Patel',
      email: 'shreya.patel@campusgpt.com',
      role: 'CLUB_ADMIN' as const,
      branch: 'ECE',
      year: 3,
      phone: '9876503002',
    },
    {
      name: 'Mohit Arora',
      email: 'mohit.arora@campusgpt.com',
      role: 'CLUB_ADMIN' as const,
      branch: 'CSE',
      year: 4,
      phone: '9876503003',
    },

    // ---------------- ADMINS ----------------
    {
      name: 'Campus Administrator',
      email: 'admin@campusgpt.com',
      role: 'ADMIN' as const,
      branch: undefined,
      year: undefined,
      phone: '9876504001',
    },
    {
      name: 'System Administrator',
      email: 'system.admin@campusgpt.com',
      role: 'ADMIN' as const,
      branch: undefined,
      year: undefined,
      phone: '9876504002',
    },
  ];

  await prisma.user.createMany({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });

  console.log(`👥 Created ${users.length} users.`);

  // --------------------------------------------------
  // 3. Create Campus Locations
  // --------------------------------------------------

  const locations = [
    {
      name: 'Main Academic Block',
      type: 'BUILDING' as const,
      description: 'Main academic building containing classrooms, laboratories and departments.',
      building: 'AB1',
      floor: 'Ground Floor',
      roomNumber: '001',
      contact: '0755-1234567',
      email: 'info@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Computer Science and Engineering Department',
      type: 'DEPARTMENT' as const,
      description: 'Department office for Computer Science and Engineering.',
      building: 'AB1',
      floor: 'Second Floor',
      roomNumber: '201',
      contact: '0755-1234568',
      email: 'cse@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'CSE Faculty Cabin - 205',
      type: 'FACULTY_CABIN' as const,
      description: 'Faculty cabin area for CSE department faculty members.',
      building: 'AB1',
      floor: 'Second Floor',
      roomNumber: '205',
      email: 'faculty@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Student Help Desk',
      type: 'SERVICE' as const,
      description: 'General student support and information desk.',
      building: 'AB1',
      floor: 'First Floor',
      roomNumber: '101',
      contact: '0755-1234569',
      email: 'helpdesk@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Student Administration Office',
      type: 'OFFICE' as const,
      description: 'Handles student records, certificates and administrative requests.',
      building: 'AB1',
      floor: 'First Floor',
      roomNumber: '110',
      contact: '0755-1234570',
      email: 'adminoffice@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Electronics and Communication Department',
      type: 'DEPARTMENT' as const,
      description: 'Department office for Electronics and Communication Engineering.',
      building: 'AB2',
      floor: 'Second Floor',
      roomNumber: '202',
      contact: '0755-1234571',
      email: 'ece@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Mechanical Engineering Department',
      type: 'DEPARTMENT' as const,
      description: 'Department office for Mechanical Engineering.',
      building: 'AB2',
      floor: 'Third Floor',
      roomNumber: '301',
      contact: '0755-1234572',
      email: 'me@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Central Library',
      type: 'SERVICE' as const,
      description: 'Central library with study spaces, books and digital resources.',
      building: 'LIB1',
      floor: 'Ground Floor',
      roomNumber: '001',
      contact: '0755-1234573',
      email: 'library@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Examination Cell',
      type: 'OFFICE' as const,
      description: 'Office responsible for examinations, schedules and academic records.',
      building: 'AB1',
      floor: 'First Floor',
      roomNumber: '115',
      contact: '0755-1234574',
      email: 'examcell@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Training and Placement Office',
      type: 'OFFICE' as const,
      description: 'Career guidance, internships and placement support.',
      building: 'AB3',
      floor: 'First Floor',
      roomNumber: '105',
      contact: '0755-1234575',
      email: 'tpo@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Innovation and Incubation Centre',
      type: 'SERVICE' as const,
      description: 'Student innovation, startup and incubation support centre.',
      building: 'AB3',
      floor: 'Ground Floor',
      roomNumber: '010',
      contact: '0755-1234576',
      email: 'innovation@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Student Welfare Office',
      type: 'OFFICE' as const,
      description: 'Student welfare, counselling coordination and student support services.',
      building: 'AB3',
      floor: 'Second Floor',
      roomNumber: '205',
      contact: '0755-1234577',
      email: 'welfare@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Seminar Hall',
      type: 'SERVICE' as const,
      description: 'Large hall used for seminars, workshops and campus events.',
      building: 'AB2',
      floor: 'Ground Floor',
      roomNumber: '015',
      contact: '0755-1234578',
      email: 'seminar@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Innovation Lab',
      type: 'OTHER' as const,
      description: 'Collaborative laboratory for student projects and technical activities.',
      building: 'AB3',
      floor: 'Third Floor',
      roomNumber: '305',
      contact: '0755-1234579',
      email: 'lab@campusgpt.com',
      isVerified: true,
    },
    {
      name: 'Medical Centre',
      type: 'SERVICE' as const,
      description: 'Basic medical assistance and first-aid services for students and staff.',
      building: 'SERV1',
      floor: 'Ground Floor',
      roomNumber: '005',
      contact: '0755-1234580',
      email: 'medical@campusgpt.com',
      isVerified: true,
    },
  ];

  await prisma.campusLocation.createMany({
    data: locations,
  });

  console.log(`📍 Created ${locations.length} campus locations.`);

  console.log('');
  console.log('✅ CampusGPT seed completed successfully!');
  console.log('');
  console.log(`🔑 Demo password: ${DEMO_PASSWORD}`);
  console.log('📧 Admin login: admin@campusgpt.com');
  console.log('📧 Student login: aarav.sharma@campusgpt.com');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });