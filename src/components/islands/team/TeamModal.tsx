import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam } from "@/lib/api/team";
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
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setName("");
    },
  });

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
            onClick={() => mutation.mutate(name)}
            disabled={!name || mutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Création..." : "Créer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
