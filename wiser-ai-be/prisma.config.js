require('dotenv/config');
const { defineConfig } = require('prisma/config');

console.error('DEBUG: Loaded prisma.config.js');
console.error('DEBUG: DATABASE_URL is:', process.env.DATABASE_URL);

module.exports = defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        provider: "postgresql",
        url: process.env.DATABASE_URL,
    },
});
