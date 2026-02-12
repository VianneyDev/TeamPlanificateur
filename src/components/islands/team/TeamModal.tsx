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
import { useCreateTeam } from "@/hooks/teams/useCreateTeam";

export default function TeamModal() {
  const { mutate: createTeam, isPending } = useCreateTeam();

  const [name, setName] = useState("");

  const handleSubmit = () => {
    createTeam({ name });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="p-2 rounded-md hover:bg-slate-800">
          <Plus size={18} />
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
            onClick={handleSubmit}
            disabled={!name || isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Création..." : "Créer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
