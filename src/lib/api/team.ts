export async function fetchTeams() {
   const response = await fetch("/api/teams");

   if (!response.ok) {
      throw new Error("Failed to fetch teams");
   }

   return response.json();
}

export async function createTeam(name: string) {
   const response = await fetch("/api/teams", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
   });

   if (!response.ok) {
      throw new Error("Failed to create team");
   }

   return response.json();
}