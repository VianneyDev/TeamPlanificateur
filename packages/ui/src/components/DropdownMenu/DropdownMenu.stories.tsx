import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";

function DropdownMenuPreview({
  variant = "default",
}: {
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Membre</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Modifier</DropdownMenuItem>
        <DropdownMenuItem variant={variant}>
          {variant === "destructive" ? "Se déconnecter" : "Archiver"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

DropdownMenuPreview.displayName = "DropdownMenu";

const meta = {
  title: "DropdownMenu",
  component: DropdownMenuPreview,
  subcomponents: {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
  args: {
    variant: "default",
  },
} satisfies Meta<typeof DropdownMenuPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
};

export const Destructive: Story = {
  args: { variant: "destructive" },
};
