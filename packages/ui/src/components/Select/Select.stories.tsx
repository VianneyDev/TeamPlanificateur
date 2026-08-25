import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Label } from "../Label/Label";

function SelectPreview({
  size = "default",
  disabled = false,
}: {
  size?: "sm" | "default";
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        minWidth: "16rem",
      }}
    >
      <Label htmlFor="team">Équipe</Label>
      <Select disabled={disabled}>
        <SelectTrigger id="team" size={size}>
          <SelectValue placeholder="Choisir une équipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alpha">Alpha</SelectItem>
          <SelectItem value="beta">Beta</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

SelectPreview.displayName = "Select";

const meta = {
  title: "Select",
  component: SelectPreview,
  subcomponents: {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    size: "default",
    disabled: false,
  },
} satisfies Meta<typeof SelectPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { size: "default" },
};

export const Small: Story = {
  args: { size: "sm" },
};
