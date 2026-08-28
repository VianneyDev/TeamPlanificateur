import { db } from "../src/lib/db";
import { populateDemoDataset } from "../src/lib/demo-reset";

async function main() {
  const existingTeams = await db.team.count();
  if (existingTeams > 0) {
    console.log("Données déjà présentes, skip du seed");
    return;
  }

  const counts = await db.$transaction((tx) => populateDemoDataset(tx));
  console.log(
    `Seed terminé : ${counts.teams} équipes, ${counts.members} membres, ${counts.leaveRequests} demandes de congé`,
  );
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
