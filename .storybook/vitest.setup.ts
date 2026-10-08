import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/nextjs-vite";
import * as projectAnnotations from "./preview";

// Applies Storybook preview and addon annotations to story tests.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
