import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../index";

function CreateMemberDialog({
  showCloseButton,
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
        <label>
          Nom
          <input />
        </label>
        <DialogFooter>
          <button type="button">Annuler</button>
          <button type="submit">Créer</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens a dialog named from its title", async () => {
    const user = userEvent.setup();

    render(<CreateMemberDialog />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ouvrir" }));

    const dialog = await screen.findByRole("dialog", { name: "Nouveau membre" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleDescription(
      "Rattachez le membre à au moins une équipe.",
    );
  });

  it("closes from the keyboard with Escape", async () => {
    const user = userEvent.setup();

    render(<CreateMemberDialog />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    await screen.findByRole("dialog", { name: "Nouveau membre" });

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes from the Fermer control", async () => {
    const user = userEvent.setup();

    render(<CreateMemberDialog />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    const dialog = await screen.findByRole("dialog", { name: "Nouveau membre" });

    await user.click(within(dialog).getByRole("button", { name: "Fermer" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves keyboard focus into the dialog when it opens", async () => {
    const user = userEvent.setup();

    render(<CreateMemberDialog />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));

    const dialog = await screen.findByRole("dialog", { name: "Nouveau membre" });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("keeps Tab inside the open dialog", async () => {
    const user = userEvent.setup();

    render(<CreateMemberDialog />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    const dialog = await screen.findByRole("dialog", { name: "Nouveau membre" });

    for (let i = 0; i < 8; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("can hide the Fermer control", async () => {
    const user = userEvent.setup();

    render(<CreateMemberDialog showCloseButton={false} />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    const dialog = await screen.findByRole("dialog", { name: "Nouveau membre" });

    expect(
      within(dialog).queryByRole("button", { name: "Fermer" }),
    ).not.toBeInTheDocument();
  });

  it("forwards a ref to the trigger button", () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <Dialog>
        <DialogTrigger ref={ref}>Ouvrir</DialogTrigger>
        <DialogContent>
          <DialogTitle>Nouveau membre</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(ref.current).toBe(screen.getByRole("button", { name: "Ouvrir" }));
  });

  it("shows when open is controlled by the caller", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Nouveau membre</DialogTitle>
          <DialogDescription>
            Rattachez le membre à au moins une équipe.
          </DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(
      screen.getByRole("dialog", { name: "Nouveau membre" }),
    ).toBeInTheDocument();
  });
});
