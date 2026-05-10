import prisma from "../src/config/prisma.js";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import { TaskStatus, TaskPriority, Role } from "@prisma/client";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";
const TASK_COUNT = 50;

async function main() {
  console.log("🌱 Starting seed...\n");

  console.log("👤 Creating users...");
  
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const hashedTestPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      name: "Admin User",
      role: Role.ADMIN,
    },
  });
  console.log(`  ✓ Admin created: ${adminUser.email} (${adminUser.role})`);

  const testUser = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: {},
    create: {
      email: TEST_EMAIL,
      password: hashedTestPassword,
      name: "Test User",
      role: Role.USER,
    },
  });
  console.log(`  ✓ Test user created: ${testUser.email} (${testUser.role})`);

  console.log("\n📝 Creating tasks...");
  
  const existingTasks = await prisma.task.count({ where: { userId: testUser.id } });
  if (existingTasks > 0) {
    console.log(`  ⚠ ${existingTasks} tasks already exist for test user, skipping task creation`);
  } else {
    const taskTitles = [
      "Fix login bug",
      "Add user profile page",
      "Implement dark mode",
      "Write API documentation",
      "Optimize database queries",
      "Add unit tests",
      "Refactor authentication",
      "Create dashboard UI",
      "Add email notifications",
      "Implement search feature",
      "Fix memory leak",
      "Add file upload feature",
      "Create backup system",
      "Add loading states",
      "Improve error handling",
      "Add pagination to list",
      "Implement caching",
      "Add keyboard shortcuts",
      "Create onboarding flow",
      "Add analytics tracking",
    ];

    const statuses: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    const priorities: TaskPriority[] = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];

    const tasksToCreate = [];
    for (let i = 0; i < TASK_COUNT; i++) {
      tasksToCreate.push({
        title: taskTitles[i % taskTitles.length] + (i >= taskTitles.length ? ` #${Math.floor(i / taskTitles.length) + 1}` : ""),
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(statuses),
        priority: faker.helpers.arrayElement(priorities),
        userId: testUser.id,
      });
    }

    await prisma.task.createMany({ data: tasksToCreate });
    console.log(`  ✓ Created ${TASK_COUNT} tasks for ${testUser.email}`);
  }

  const taskCount = await prisma.task.count({ where: { userId: testUser.id } });
  console.log(`\n✅ Seed completed!`);
  console.log(`   Users: 2 | Tasks: ${taskCount}`);
  console.log(`\n📋 Test Credentials:`);
  console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`   User:  ${TEST_EMAIL} / ${TEST_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });