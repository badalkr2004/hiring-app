import { PrismaClient } from '@prisma/client';
import logger from '@/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('📦 Connected to MongoDB successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info('📦 Disconnected from MongoDB');
  } catch (error) {
    logger.error('❌ Error disconnecting from MongoDB:', error);
  }
};

export default prisma;