import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

async function seed() {
  await mongoose.connect("mongodb://localhost:27017/activity-tracker");

  const now = Date.now();
  const userA = '665f1c2e4b3a2d0012ab34cd';
  const userB = '665f1c2e4b3a2d0012ab34ef';
  const userC = '665f1c2e4b3a2d0012ab3512';

  const docs = [];

  for (let i = 0; i < 25; i++) {
    docs.push({
      userId: userA,
      action: 'click',
      ipAddress: '192.168.1.1',
      createdAt: new Date(now - i * 1000)
    });
  }

  const ips = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];
  ips.forEach((ip, i) => {
    docs.push({
      userId: userB,
      action: 'login',
      ipAddress: ip,
      createdAt: new Date(now - i * 60 * 1000)
    });
  });

  for (let i = 0; i < 3; i++) {
    docs.push({
      userId: userC,
      action: 'view',
      ipAddress: '172.16.0.1',
      createdAt: new Date(now - i * 10000)
    });
  }

  await ActivityLog.insertMany(docs);
  console.log('Seeded', docs.length, 'activity logs');
  process.exit(0);
}

seed();