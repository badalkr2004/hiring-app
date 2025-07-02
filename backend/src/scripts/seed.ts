import { PrismaClient, UserRole, JobType, JobStatus, ApplicationStatus } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jobflow.com' },
    update: {},
    create: {
      email: 'admin@jobflow.com',
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true
    }
  });

  // Create company user
  const companyPassword = await hashPassword('company123');
  const companyUser = await prisma.user.upsert({
    where: { email: 'company@techflow.com' },
    update: {},
    create: {
      email: 'company@techflow.com',
      password: companyPassword,
      firstName: 'Tech',
      lastName: 'Flow',
      role: UserRole.COMPANY,
      isActive: true,
      isVerified: true,
      company: {
        create: {
          name: 'TechFlow Inc.',
          description: 'Leading technology company focused on innovation and cutting-edge solutions.',
          website: 'https://techflow.com',
          size: '50-200',
          industry: 'Technology',
          location: 'San Francisco, CA',
          foundedYear: 2020,
          verified: true
        }
      }
    },
    include: {
      company: true
    }
  });

  // Create regular user
  const userPassword = await hashPassword('user123');
  const regularUser = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      location: 'New York, NY',
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      experience: '5 years',
      isActive: true,
      isVerified: true
    }
  });

  // Create sample jobs
  const jobs = [
    {
      title: 'Senior Frontend Developer',
      description: 'We are looking for a passionate Senior Frontend Developer to join our growing team. You will be responsible for building amazing user experiences using modern web technologies.',
      requirements: [
        '5+ years of React experience',
        'Strong TypeScript knowledge',
        'Experience with modern build tools',
        'Understanding of web performance optimization'
      ],
      benefits: [
        'Health, dental, and vision insurance',
        'Flexible working hours',
        'Remote work options',
        '$5,000 learning budget'
      ],
      location: 'San Francisco, CA',
      type: JobType.FULL_TIME,
      category: 'Engineering',
      salary: '$120,000 - $160,000',
      featured: true
    },
    {
      title: 'Product Manager',
      description: 'Lead product strategy and execution for our cutting-edge SaaS platform. Work closely with engineering and design teams to deliver exceptional user experiences.',
      requirements: [
        '3+ years product management experience',
        'Strong analytical skills',
        'Experience with agile methodologies',
        'Excellent communication skills'
      ],
      benefits: [
        'Equity package',
        'Unlimited PTO',
        'Company-sponsored events',
        'Professional development budget'
      ],
      location: 'San Francisco, CA',
      type: JobType.FULL_TIME,
      category: 'Product',
      salary: '$110,000 - $140,000',
      featured: false
    },
    {
      title: 'DevOps Engineer',
      description: 'Help us build scalable infrastructure and improve our deployment processes. Work with cutting-edge cloud technologies and automation tools.',
      requirements: [
        'Experience with AWS/Azure/GCP',
        'Knowledge of Docker and Kubernetes',
        'Infrastructure as Code (Terraform)',
        'CI/CD pipeline experience'
      ],
      benefits: [
        'Stock options',
        '401k matching',
        'Tech conference budget',
        'Gym membership'
      ],
      location: 'Remote',
      type: JobType.REMOTE,
      category: 'Engineering',
      salary: '$95,000 - $125,000',
      featured: false
    }
  ];

  for (const jobData of jobs) {
    await prisma.job.create({
      data: {
        ...jobData,
        companyId: companyUser.company!.id,
        status: JobStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
  }

  // Create sample application
  const job = await prisma.job.findFirst({
    where: { companyId: companyUser.company!.id }
  });

  if (job) {
    await prisma.application.create({
      data: {
        userId: regularUser.id,
        jobId: job.id,
        status: ApplicationStatus.PENDING,
        coverLetter: 'I am very interested in this position and believe my skills align perfectly with your requirements.'
      }
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Demo Credentials:');
  console.log('Admin: admin@jobflow.com / admin123');
  console.log('Company: company@techflow.com / company123');
  console.log('User: john@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });