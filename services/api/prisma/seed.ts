import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criar admin
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bilheteriatech.local' },
    update: {},
    create: {
      email: 'admin@bilheteriatech.local',
      name: 'Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin criado:', admin.email);

  // Criar eventos iniciais
  const events = [
    {
      title: 'Show de Rock',
      description: 'Uma noite inesquecível com as maiores bandas de rock',
      date: new Date('2026-03-15T20:00:00Z'),
      priceCents: 5000, // R$ 50,00
      totalTickets: 1000,
    },
    {
      title: 'Festival de Jazz',
      description: 'Melhores artistas de jazz do mundo',
      date: new Date('2026-04-20T19:00:00Z'),
      priceCents: 7500, // R$ 75,00
      totalTickets: 500,
    },
    {
      title: 'Teatro Clássico',
      description: 'Peça teatral clássica',
      date: new Date('2026-05-10T18:00:00Z'),
      priceCents: 3000, // R$ 30,00
      totalTickets: 200,
    },
  ];

  const existingEventsCount = await prisma.event.count();

  if (existingEventsCount === 0) {
    for (const event of events) {
      await prisma.event.create({
        data: event,
      });
    }
  }

  console.log(existingEventsCount === 0 ? `${events.length} eventos criados` : 'Eventos já existentes, seed ignorado para eventos');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
