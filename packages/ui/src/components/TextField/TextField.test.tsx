import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TextField } from "../../index";

describe("TextField", () => {
  it("exposes a textbox named from its accessible name", () => {
    render(<TextField aria-label="Nom" />);

    expect(screen.getByRole("textbox", { name: "Nom" })).toBeInTheDocument();
  });

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup();

    render(<TextField aria-label="Nom" disabled />);

    const field = screen.getByRole("textbox", { name: "Nom" });
    expect(field).toBeDisabled();

    await user.type(field, "Ada");
    expect(field).toHaveValue("");
  });

  it("accepts keyboard input when enabled", async () => {
    const user = userEvent.setup();

    render(<TextField aria-label="Nom" />);

    const field = screen.getByRole("textbox", { name: "Nom" });
    await user.type(field, "Ada");

    expect(field).toHaveValue("Ada");
  });

  it("forwards a ref to the native input", () => {
    const ref = createRef<HTMLInputElement>();

    render(<TextField ref={ref} aria-label="Nom" />);

    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Nom" }));
  });
});
