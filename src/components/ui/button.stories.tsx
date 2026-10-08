import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Plus, RefreshCw, Settings } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@/components/ui/button";

const variants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const textSizes = ["xs", "sm", "default", "lg"] as const;
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;
const textSizeLabels = {
  xs: "Extra-small button",
  sm: "Small button",
  default: "Default button",
  lg: "Large button",
} as const;
const iconSizeLabels = {
  "icon-xs": "Open settings, extra small",
  "icon-sm": "Open settings, small",
  icon: "Open settings",
  "icon-lg": "Open settings, large",
} as const;
const onDisabledExampleClick = fn();

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Continue",
    size: "default",
    variant: "default",
  },
  argTypes: {
    children: { control: "text" },
    size: {
      control: "select",
      options: [...textSizes, ...iconSizes],
    },
    variant: {
      control: "select",
      options: variants,
    },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Shared button styles for primary, secondary, low-emphasis, destructive, and link-like actions. Choose the variant by action hierarchy and use icon sizes only with an accessible label.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: "Continue" });

    await expect(button).toBeEnabled();
    await expect(button).toHaveAttribute("type", "button");
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant === "default"
            ? "Default"
            : `${variant.charAt(0).toUpperCase()}${variant.slice(1)}`}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of [
      "Default",
      "Secondary",
      "Outline",
      "Ghost",
      "Destructive",
      "Link",
    ]) {
      await expect(canvas.getByRole("button", { name })).toBeVisible();
    }
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        {textSizes.map((size) => (
          <Button key={size} size={size} variant="outline">
            {textSizeLabels[size]}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {iconSizes.map((size) => (
          <Button
            key={size}
            aria-label={iconSizeLabels[size]}
            size={size}
            variant="outline"
          >
            <Settings />
          </Button>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("button")).toHaveLength(8);
    for (const size of iconSizes) {
      await expect(
        canvas.getByRole("button", {
          name: iconSizeLabels[size],
        }),
      ).toBeVisible();
    }
  },
};

export const IconPlacement: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline">Add goal</Button>
      <Button variant="outline">
        <Plus data-icon="inline-start" />
        Add goal
      </Button>
      <Button variant="outline">
        Continue
        <ArrowRight data-icon="inline-end" />
      </Button>
      <Button aria-label="Refresh data" size="icon" variant="outline">
        <RefreshCw />
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getAllByRole("button", { name: "Add goal" }),
    ).toHaveLength(2);
    await expect(
      canvas.getByRole("button", { name: "Continue" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Refresh data" }),
    ).toBeVisible();
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={onDisabledExampleClick}>Enabled action</Button>
      <Button disabled onClick={onDisabledExampleClick}>
        Disabled action
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const enabledButton = canvas.getByRole("button", {
      name: "Enabled action",
    });
    const disabledButton = canvas.getByRole("button", {
      name: "Disabled action",
    });

    onDisabledExampleClick.mockClear();
    await expect(enabledButton).toBeEnabled();
    await expect(disabledButton).toBeDisabled();
    disabledButton.click();
    await expect(onDisabledExampleClick).not.toHaveBeenCalled();
    await userEvent.click(enabledButton);
    await expect(onDisabledExampleClick).toHaveBeenCalledOnce();
  },
};
