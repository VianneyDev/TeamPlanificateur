import { useState } from "react";
import { Plus } from "lucide-react";

import {
   Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/islands/ui/dialog";

export default function TeamModal() {
  const [name, setName] = useState("");

  async function submit() {
    await fetch("/api/teams", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

   //  window.location.reload();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
         <Plus />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle équipe</DialogTitle>
          <DialogDescription>
            Entrez le nom de la nouvelle équipe&nbsp;:
          </DialogDescription>
        </DialogHeader>
        <input
          className="w-full border rounded px-3 py-2 my-2"
          placeholder="Nom de l’équipe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <DialogFooter>
          <button
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Créer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
