import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "ghost", "outline", "danger"],
    },
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
  args: { variant: "default" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Annuler" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Modifier" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Archiver" },
};
