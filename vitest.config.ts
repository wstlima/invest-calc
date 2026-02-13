import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		setupFiles: ["./tests/setup.ts"],
		testTimeout: 30_000,
		coverage: {
			provider: "v8",
			enabled: true,
		},
	},
});
