import { Keyboard } from "grammy";

export const mainMenu = new Keyboard()
  .text("🎩 Начать игру")
  .text("📊 Статистика")
  .resized()
  .persistent();