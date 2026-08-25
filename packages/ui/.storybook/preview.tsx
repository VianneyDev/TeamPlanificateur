import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    a11y: {
      test: "error",
    },
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Thème",
      toolbar: {
        items: [
          { value: "light", title: "Clair" },
          { value: "dark", title: "Sombre" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      document.documentElement.lang = "fr";
      document.body.style.background = "var(--color-surface-canvas)";
      document.body.style.color = "var(--color-text-primary)";
      document.body.style.fontFamily = "var(--font-sans)";
      document.body.style.margin = "0";
      return <Story />;
    },
  ],
};

export default preview;
