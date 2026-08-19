import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label, TextField } from "../../index";

describe("Label", () => {
  it("names a text field through htmlFor", () => {
    render(
      <>
        <Label htmlFor="member-name">Nom</Label>
        <TextField id="member-name" />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "Nom" })).toBeInTheDocument();
  });

  it("forwards a ref to the native label", () => {
    const ref = createRef<HTMLLabelElement>();

    render(
      <Label ref={ref} htmlFor="member-name">
        Nom
      </Label>,
    );

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(ref.current).toHaveTextContent("Nom");
  });
});
