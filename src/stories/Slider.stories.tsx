import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

type SliderProps = React.ComponentProps<typeof Slider>;

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: { type: "object" },
    },
    max: {
      control: { type: "number" },
    },
    step: {
      control: { type: "number" },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ className, ...props }: SliderProps) => (
    <Slider
      defaultValue={[50]}
      max={100}
      step={1}
      className={cn("w-[60%]", className)}
      {...props}
    />
  ),
};

export const Range: Story = {
  render: () => (
    <Slider
      defaultValue={[25, 75]}
      max={100}
      step={1}
      className="w-[60%]"
    />
  ),
};

export const CustomStep: Story = {
  render: () => (
    <Slider
      defaultValue={[50]}
      max={100}
      step={10}
      className="w-[60%]"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Slider
      defaultValue={[50]}
      max={100}
      step={1}
      disabled
      className="w-[60%]"
    />
  ),
};
