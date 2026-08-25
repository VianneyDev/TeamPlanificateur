import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../index";

function TeamSelect({
  disabled,
  defaultValue,
}: {
  disabled?: boolean;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <>
      <Label htmlFor="team">Équipe</Label>
      <Select value={value} onValueChange={setValue} disabled={disabled}>
        <SelectTrigger id="team">
          <SelectValue placeholder="Choisir une équipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alpha">Alpha</SelectItem>
          <SelectItem value="beta">Beta</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

describe("Select", () => {
  it("exposes a combobox named from its label", () => {
    render(<TeamSelect />);

    expect(
      screen.getByRole("combobox", { name: "Équipe" }),
    ).toBeInTheDocument();
  });

  it("shows the placeholder before a value is chosen", () => {
    render(<TeamSelect />);

    expect(screen.getByRole("combobox", { name: "Équipe" })).toHaveTextContent(
      "Choisir une équipe",
    );
  });

  it("lists options and records the chosen value", async () => {
    const user = userEvent.setup();

    render(<TeamSelect />);

    await user.click(screen.getByRole("combobox", { name: "Équipe" }));
    await user.click(await screen.findByRole("option", { name: "Alpha" }));

    expect(screen.getByRole("combobox", { name: "Équipe" })).toHaveTextContent(
      "Alpha",
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("moves through options with the keyboard", async () => {
    const user = userEvent.setup();

    render(<TeamSelect />);

    const combobox = screen.getByRole("combobox", { name: "Équipe" });
    combobox.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(combobox).toHaveTextContent("Beta");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();

    render(<TeamSelect disabled />);

    const combobox = screen.getByRole("combobox", { name: "Équipe" });
    expect(combobox).toBeDisabled();

    await user.click(combobox);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("forwards a ref to the combobox", () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <Select>
        <SelectTrigger ref={ref} aria-label="Équipe">
          <SelectValue placeholder="Choisir une équipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alpha">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(ref.current).toBe(screen.getByRole("combobox", { name: "Équipe" }));
  });
});
