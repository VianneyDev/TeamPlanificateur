import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./Label";
import { TextField } from "../TextField/TextField";

const meta = {
  title: "Label",
  component: Label,
  argTypes: {
    children: { control: "text" },
  },
  args: {
    children: "Nom",
    htmlFor: "member-name",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", minWidth: "16rem" }}>
      <Label {...args} />
      <TextField id="member-name" />
    </div>
  ),
};
