import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../index";

function MemberActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Membre</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Modifier</DropdownMenuItem>
        <DropdownMenuItem>Archiver</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens a menu of named actions from the trigger", async () => {
    const user = userEvent.setup();

    render(<MemberActionsMenu />);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Modifier" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Archiver" }),
    ).toBeInTheDocument();
  });

  it("closes from the keyboard with Escape", async () => {
    const user = userEvent.setup();

    render(<MemberActionsMenu />);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("returns keyboard focus to the trigger when it closes", async () => {
    const user = userEvent.setup();

    render(<MemberActionsMenu />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    await user.click(trigger);
    await screen.findByRole("menu");

    await user.keyboard("{Escape}");

    expect(trigger).toHaveFocus();
  });

  it("activates a chosen action and closes", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onEdit}>Modifier</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Modifier" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not activate a disabled action", async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onArchive}>
            Archiver
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));
    const archive = await screen.findByRole("menuitem", { name: "Archiver" });
    expect(archive).toHaveAttribute("aria-disabled", "true");

    await user.click(archive);
    expect(onArchive).not.toHaveBeenCalled();
  });

  it("moves through actions with the keyboard", async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Modifier</DropdownMenuItem>
          <DropdownMenuItem onSelect={onArchive}>Archiver</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onArchive).toHaveBeenCalledTimes(1);
  });

  it("keeps the action name with the destructive variant", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Compte</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Compte" }));

    expect(
      await screen.findByRole("menuitem", { name: "Se déconnecter" }),
    ).toBeInTheDocument();
  });

  it("forwards a ref to the trigger button", () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger ref={ref}>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Modifier</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(ref.current).toBe(screen.getByRole("button", { name: "Actions" }));
  });
});
