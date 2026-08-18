import { db } from "../src/lib/db";

async function main() {
  // Vérifier si des données existent déjà
  const existingTeams = await db.team.findMany();
  if (existingTeams.length > 0) {
    console.log("Données déjà présentes, skip du seed");
    return;
  }

  // Créer des équipes
  const team1 = await db.team.create({
    data: { name: "Équipe Développement" },
  });
  const team2 = await db.team.create({ data: { name: "Équipe Design" } });
  const team3 = await db.team.create({ data: { name: "Équipe Marketing" } });

  // Créer des membres (internes et externes)
  await db.member.create({
    data: {
      name: "Alice Martin",
      role: "member",
      isExternal: false,
      teams: { connect: [{ id: team1.id }] },
    },
  });
  await db.member.create({
    data: {
      name: "Bob Dupont",
      role: "member",
      isExternal: false,
      teams: { connect: [{ id: team1.id }] },
    },
  });
  await db.member.create({
    data: {
      name: "Charlie Bernard",
      role: "manager",
      isExternal: false,
      teams: { connect: [{ id: team1.id }] },
    },
  });
  await db.member.create({
    data: {
      name: "Diana Leroy",
      role: "member",
      isExternal: true,
      teams: { connect: [{ id: team2.id }] },
    },
  });
  await db.member.create({
    data: {
      name: "Eve Moreau",
      role: "member",
      isExternal: true,
      teams: { connect: [{ id: team2.id }] },
    },
  });
  await db.member.create({
    data: {
      name: "Frank Petit",
      role: "manager",
      isExternal: false,
      teams: { connect: [{ id: team2.id }] },
    },
  });
  await db.member.create({
    data: {
      name: "Grace Dubois",
      role: "member",
      isExternal: false,
      teams: { connect: [{ id: team3.id }] },
    },
  });

  console.log("✅ Seed terminé : 3 équipes et 7 membres créés");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
