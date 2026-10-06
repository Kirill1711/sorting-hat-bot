import type { Faculty } from "./questions.js";

export const facultyInfo: Record<Faculty, { title: string; emoji: string; line: string }> = {
  gryffindor: {
    title: "ГРИФФИНДОР",
    emoji: "🦁",
    line: "Вижу в тебе отвагу и горячее сердце. Тебе путь к храбрецам!",
  },
  slytherin: {
    title: "СЛИЗЕРИН",
    emoji: "🐍",
    line: "Амбиций у тебя хоть отбавляй, и хитрости тоже. Тебе путь к великим!",
  },
  ravenclaw: {
    title: "КОГТЕВРАН",
    emoji: "🦅",
    line: "Какой острый ум! Знания для тебя дороже золота.",
  },
  hufflepuff: {
    title: "ПУФФЕНДУЙ",
    emoji: "🦡",
    line: "Верность, доброта и честность. Таких людей ценят больше всего!",
  },
};