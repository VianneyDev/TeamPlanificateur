import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../index";

describe("Button", () => {
  it("exposes a button role named from its children", () => {
    render(<Button>Enregistrer</Button>);

    expect(
      screen.getByRole("button", { name: "Enregistrer" }),
    ).toBeInTheDocument();
  });

  it("does not activate when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Enregistrer
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Enregistrer" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("activates from the keyboard when focused", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Enregistrer</Button>);

    const button = screen.getByRole("button", { name: "Enregistrer" });
    button.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("defaults to type button so it does not submit a form", () => {
    render(<Button>Annuler</Button>);

    expect(screen.getByRole("button", { name: "Annuler" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("can be a submit control", () => {
    render(<Button type="submit">Créer</Button>);

    expect(screen.getByRole("button", { name: "Créer" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it.each(["default", "ghost", "outline", "danger"] as const)(
    "keeps its accessible name with mixed variant %s",
    (variant) => {
      render(<Button variant={variant}>Action</Button>);

      expect(
        screen.getByRole("button", { name: "Action" }),
      ).not.toHaveAttribute("variant");
    },
  );

  it("forwards a ref to the native button", () => {
    const ref = createRef<HTMLButtonElement>();

    render(<Button ref={ref}>Go</Button>);

    expect(ref.current).toBe(screen.getByRole("button", { name: "Go" }));
  });
});
