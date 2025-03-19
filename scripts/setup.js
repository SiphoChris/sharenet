import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up the database...');

  // Create some example sessions
  const sessionsData = [
    {
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), 
      capacity: 20,
      location: 'Room 101'
    },
    {
      title: 'Advanced React Techniques',
      description: 'Deep dive into React hooks and patterns',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), 
      capacity: 15,
      location: 'Room 202'
    },
    {
      title: 'Database Design Fundamentals',
      description: 'Learn how to structure databases for performance and scalability',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 
      startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), 
      capacity: 25,
      location: 'Room 105'
    }
  ];

  for (const sessionData of sessionsData) {
    await prisma.session.create({
      data: sessionData
    });
  }

  console.log('Sample sessions created successfully!');
}

main()
  .catch((e) => {
    console.error('Error setting up the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });