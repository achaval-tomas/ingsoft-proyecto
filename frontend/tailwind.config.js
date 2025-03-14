/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: colors.teal,
                surface: colors.zinc["800"],
                secondary: {
                    light: "#f7a13b",
                    DEFAULT: "#f6931e",
                    dark: "#b46507",
                },
                border: colors.zinc["700"],
            },
            transitionProperty: {
                "movement-card": "top, bottom, box-shadow, z-index",
            },
            animation: {
                highlight:
                    "highlight 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                selectable:
                    "selectable 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                highlight: {
                    "0%": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                    "50%": { backgroundColor: "rgba(0, 0, 0, 0.3)" },
                    "100%": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                },
                selectable: {
                    "0%": { border: "4px solid rgba(255, 255, 255, 1.0)" },
                    "50%": { border: "4px solid rgba(255, 255, 255, 0.4)" },
                    "100%": { border: "4px solid rgba(255, 255, 255, 1.0)" },
                },
            },
        },
    },
    plugins: [],
};
