import baseConfig from "./base.mjs";
import reactPlugin from "eslint-plugin-react";

export default [
	...baseConfig,
	{
		files: ["**/*.jsx", "**/*.tsx", "**/*.js", "**/*.ts"],
		plugins: {
			react: reactPlugin,
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			"react/jsx-uses-react": "off",
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
		},
	},
];
