import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		include: ["src/react-app/**/*.test.{ts,tsx}"],
		environment: "jsdom",
		setupFiles: ["./src/react-app/test/setup.ts"],
		globals: true,
	},
});
