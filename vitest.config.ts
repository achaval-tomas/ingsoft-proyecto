import { coverageConfigDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/setupTests.ts",
        coverage: {
            exclude: [...coverageConfigDefaults.exclude, "*.config.*"],
        },
    },
});
