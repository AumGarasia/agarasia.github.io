/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{ts,tsx,js,jsx}"],
    important: true,              // <-- utilities beat plain CSS selectors
    theme: { extend: {} },
    plugins: [],
};
