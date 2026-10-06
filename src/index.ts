import { Bot } from "grammy";
import { config } from "./config.js";
import { registerHandlers } from "./bot/handlers.js";

const bot = new Bot(config.botToken);

registerHandlers(bot);

bot.catch((err) => console.error("Ошибка бота:", err));

bot.start();
console.log("Бот запущен");