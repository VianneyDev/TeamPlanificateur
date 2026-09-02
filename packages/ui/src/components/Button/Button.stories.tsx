import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Button",
  component: Button,
  argTypes: {
    intent: {
      control: "select",
      options: ["neutral", "danger"],
    },
    emphasis: {
      control: "select",
      options: ["filled", "ghost", "outline"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "Enregistrer",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { intent: "neutral", emphasis: "filled" },
};

export const Ghost: Story = {
  args: { intent: "neutral", emphasis: "ghost", children: "Annuler" },
};

export const Outline: Story = {
  args: { intent: "neutral", emphasis: "outline", children: "Modifier" },
};

export const Danger: Story = {
  args: { intent: "danger", emphasis: "filled", children: "Archiver" },
};
