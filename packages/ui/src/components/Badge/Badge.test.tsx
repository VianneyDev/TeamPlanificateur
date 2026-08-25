import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../../index";

describe("Badge", () => {
  it("shows its status label", () => {
    render(<Badge>Archivé</Badge>);

    expect(screen.getByText("Archivé")).toBeInTheDocument();
  });

  it.each(["default", "accent"] as const)(
    "keeps its label with variant %s",
    (variant) => {
      render(<Badge variant={variant}>Externe</Badge>);

      expect(screen.getByText("Externe")).toBeInTheDocument();
    },
  );

  it("forwards a ref to the native element", () => {
    const ref = createRef<HTMLSpanElement>();

    render(<Badge ref={ref}>Archivé</Badge>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveTextContent("Archivé");
  });
});
