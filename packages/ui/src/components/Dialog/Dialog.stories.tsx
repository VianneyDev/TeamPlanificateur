import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import { Button } from "../Button/Button";
import { Label } from "../Label/Label";
import { TextField } from "../TextField/TextField";

function DialogPreview({
  showCloseButton = true,
}: {
  showCloseButton?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger>Ouvrir</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Nouveau membre</DialogTitle>
          <DialogDescription>
            Rattachez le membre à au moins une équipe.
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="dialog-member-name">Nom</Label>
        <TextField id="dialog-member-name" />
        <DialogFooter>
          <Button variant="ghost">Annuler</Button>
          <Button>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
DialogPreview.displayName = "Dialog";

const meta = {
  title: "Dialog",
  component: DialogPreview,
  subcomponents: {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
  },
  argTypes: {
    showCloseButton: { control: "boolean" },
  },
  args: {
    showCloseButton: true,
  },
} satisfies Meta<typeof DialogPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { showCloseButton: true },
};

export const WithoutCloseButton: Story = {
  args: { showCloseButton: false },
};
