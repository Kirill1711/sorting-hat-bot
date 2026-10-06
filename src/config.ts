import "dotenv/config";

export const config = {
  botToken: process.env.BOT_TOKEN ?? "",
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "hp_quiz",
  },
};

if (!config.botToken) {
  throw new Error("BOT_TOKEN не задан в .env");
}