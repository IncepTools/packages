import reactConfig from "./react.mjs";
import nextPlugin from "@next/eslint-plugin-next";

export default [
    ...reactConfig,
    {
        plugins: {
            next: nextPlugin,
        },
        rules: {
            "next/no-html-link-for-pages": "off", // Example rule; customize as needed
        },
    },
];
