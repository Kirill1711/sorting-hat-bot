import { Bot, InlineKeyboard, type Context } from "grammy";
import { intro } from "./scenes.js";
import { mainMenu } from "./menu.js";
import { addScore, getWinner } from "../game/scoring.js";
import { sleep } from "../utils/sleep.js";
import { facultyInfo } from "../game/finale.js";
import { sendScene, editScene, editCaption} from "./media.js";
import {
  startSession,
  setStep,
  getActiveSession,
  saveProgress,
  finishSession,
  getMyFaculty,
  getStats,
} from "../repo.js";
import { buildQuiz, type Question, type Faculty } from "../game/questions.js";

async function startGame(ctx: Context) {
  if (!ctx.from) return;
  await startSession(ctx.from.id, ctx.from.username);
  await sendScene(ctx, intro.letter.image, intro.letter.text, keyboardFor("letter"));
}

function keyboardFor(sceneId: string): InlineKeyboard {
  const scene = intro[sceneId];
  return new InlineKeyboard().text(scene.button, scene.next);
}

function questionText(quiz: Question[], n: number): string {
  return `🎩 Вопрос ${n} / ${quiz.length}\n\n${quiz[n - 1].text}`;
}

function questionKeyboard(quiz: Question[], n: number): InlineKeyboard {
  const kb = new InlineKeyboard();
  quiz[n - 1].options.forEach((o, i) => {
    kb.text(o.text, `a:${n}:${i}`).row();
  });
  return kb;
}

export function registerHandlers(bot: Bot) {
  // /start показывает первую сцену
  bot.command("start", async (ctx) => {
    await ctx.reply("🎩 Добро пожаловать! Кнопка запуска игры всегда внизу.", {
      reply_markup: mainMenu,
    });
    await startGame(ctx);
  });

  bot.hears("🎩 Начать игру", startGame);

  bot.hears("📊 Статистика", async (ctx) => {
    if (!ctx.from) return;
    const stats = await getStats();
    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    if (total === 0) {
      await ctx.reply("Пока никто не прошёл квиз. Будь первым!");
      return;
    }

    const order: Faculty[] = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
    const lines = order.map((f) => {
      const cnt = stats[f] ?? 0;
      const pct = Math.round((cnt / total) * 100);
      const info = facultyInfo[f];
      return `${info.emoji} ${info.title}: ${pct}% (${cnt})`;
    });

    const mine = await getMyFaculty(ctx.from.id);
    const mineLine = mine
      ? `\n\nТвой факультет: ${facultyInfo[mine as Faculty].emoji} ${facultyInfo[mine as Faculty].title}`
      : "\n\nТы ещё не проходил квиз до конца.";

    await ctx.reply(`📊 Прошли квиз: ${total}\n\n${lines.join("\n")}${mineLine}`);
  });


  // кнопка, ведущая в сцену из intro (hogwarts, hall)
  bot.callbackQuery(["hogwarts", "hall"], async (ctx) => {
    const id = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();
    await setStep(ctx.from.id, id);
    await editScene(ctx, intro[id].image, intro[id].text, keyboardFor(id));
  });

  // начало вопросов
  bot.callbackQuery("q1", async (ctx) => {
    await ctx.answerCallbackQuery();
    const s = await getActiveSession(ctx.from.id);
    if (!s) return;
    const quiz = buildQuiz(s.id);
    await saveProgress(s.id, "q1", 1, {});
    await editScene(ctx, "hat.jpg", questionText(quiz, 1), questionKeyboard(quiz, 1));
  });

  // ответ на вопрос: "a:<номер вопроса>:<номер варианта>"
  bot.callbackQuery(/^a:(\d+):(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const qNum = Number(ctx.match[1]);
    const optIdx = Number(ctx.match[2]);

    const s = await getActiveSession(ctx.from.id);
    // защита от двойных нажатий и старых кнопок
    if (!s || s.currentQ !== qNum) return;

    const quiz = buildQuiz(s.id);
    const option = quiz[qNum - 1]?.options[optIdx];
    if (!option) return;

    const scores = addScore(s.scores, option.faculty);

    if (qNum < quiz.length) {
      await saveProgress(s.id, `q${qNum + 1}`, qNum + 1, scores);
      await editCaption(ctx, questionText(quiz, qNum + 1), questionKeyboard(quiz, qNum + 1));
    } else {
      await saveProgress(s.id, "finish", qNum + 1, scores);
      const winner = getWinner(scores);
      const info = facultyInfo[winner];

      await finishSession(s.id, winner);

      await editCaption(ctx, "🎬 Шляпа опускается тебе на голову...");
      await sleep(2000);
      await editCaption(ctx, "🎩 «Хм-м-м...»");
      await sleep(2500);
      await editCaption(ctx, `🎩 «${info.line}»`);
      await sleep(2500);
      await editScene(ctx, `${winner}.jpg`, `${info.emoji} ${info.title}!`);
    }
  });
}