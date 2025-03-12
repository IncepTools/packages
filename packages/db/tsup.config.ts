import { defineConfig, type Options } from "tsup";
import { devDependencies } from "./package.json";

const baseConfig: Options = {
	format: ["cjs", "esm"],
	external: [...Object.keys(devDependencies)],
	tsconfig: "tsconfig.json",
};

export default defineConfig((options) => {
	return [
		{
			entry: ["src/adapters/index.ts"],
			outDir: "dist",
			...baseConfig,
		},
		{
			entry: ["src/adapters/sequelize/index.ts"],
			outDir: "dist/sequelize",
			...baseConfig,
		},
		{
			entry: ["src/adapters/mongodb/index.ts"],
			outDir: "dist/mongodb",
			...baseConfig,
		},
		{
			entry: ["src/adapters/redis/index.ts"],
			outDir: "dist/redis",
			...baseConfig,
		},
	];
});
