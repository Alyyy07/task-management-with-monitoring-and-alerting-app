import {
  PrismaClient,
  GlobalRole,
  Role,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  ProjectRole,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMembership.deleteMany();
  await prisma.project.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      globalRole: GlobalRole.SUPER_ADMIN,
      isEmailVerified: true,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: "member1@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      globalRole: GlobalRole.USER,
      isEmailVerified: true,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: "member2@example.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      globalRole: GlobalRole.USER,
      isEmailVerified: true,
    },
  });

  console.log("Users created.");

  // 2. Create Organizations
  const org1 = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
      description: "Leading provider of anvils and coyote traps.",
      createdById: admin.id,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Globex Corporation",
      slug: "globex",
      description: "We don't just provide services, we provide solutions.",
      createdById: admin.id,
    },
  });

  console.log("Organizations created.");

  // 3. Create Memberships
  await prisma.membership.createMany({
    data: [
      { userId: admin.id, organizationId: org1.id, role: Role.OWNER },
      { userId: member1.id, organizationId: org1.id, role: Role.ADMIN },
      { userId: member2.id, organizationId: org1.id, role: Role.MEMBER },
      { userId: admin.id, organizationId: org2.id, role: Role.OWNER },
      { userId: member1.id, organizationId: org2.id, role: Role.MEMBER },
    ],
  });

  console.log("Memberships created.");

  // 4. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: "Road Runner Catching",
      slug: "road-runner",
      description: "Project to finally catch that bird.",
      status: ProjectStatus.ACTIVE,
      organizationId: org1.id,
      createdById: admin.id,
      startDate: new Date(),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "World Domination",
      slug: "world-dom",
      description: "Expanding Globex influence globally.",
      status: ProjectStatus.PLANNING,
      organizationId: org2.id,
      createdById: admin.id,
    },
  });

  console.log("Projects created.");

  // 5. Create Project Memberships
  await prisma.projectMembership.createMany({
    data: [
      { projectId: project1.id, userId: admin.id, role: ProjectRole.OWNER },
      { projectId: project1.id, userId: member1.id, role: ProjectRole.ADMIN },
      { projectId: project1.id, userId: member2.id, role: ProjectRole.MEMBER },
    ],
  });

  console.log("Project Memberships created.");

  // 6. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Buy TNT",
      description: "Ordered 50 cases from Acme. Need to pick up.",
      priority: TaskPriority.URGENT,
      status: TaskStatus.TODO,
      projectId: project1.id,
      createdById: admin.id,
      assigneeId: member1.id,
      position: 1,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Set Giant Magnet Trap",
      description: "Place the magnet at the crossroads.",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      projectId: project1.id,
      createdById: member1.id,
      assigneeId: member2.id,
      position: 2,
    },
  });

  await prisma.task.create({
    data: {
      title: "Paint fake tunnel",
      description: "Use realistic high-gloss paint for the cliff wall.",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      projectId: project1.id,
      createdById: member1.id,
      position: 3,
    },
  });

  console.log("Tasks created.");

  // 7. Create Tags
  const tag1 = await prisma.tag.create({
    data: {
      name: "Urgent",
      color: "#FF0000",
      organizationId: org1.id,
      tasks: { connect: { id: task1.id } },
    },
  });

  const tag2 = await prisma.tag.create({
    data: {
      name: "Hardware",
      color: "#00FF00",
      organizationId: org1.id,
      tasks: { connect: { id: task1.id } },
    },
  });

  console.log("Tags created.");

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
