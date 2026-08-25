import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "accent"],
    },
    children: { control: "text" },
  },
  args: {
    children: "Archivé",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
};

export const Accent: Story = {
  args: { variant: "accent", children: "Externe" },
};
