import nextVitals from "eslint-config-next/core-web-vitals";

// Uses the standard Next.js rules. Nothing custom.
const config = [...nextVitals, { ignores: [".next/**", "node_modules/**", "screenshots/**"] }];

export default config;
