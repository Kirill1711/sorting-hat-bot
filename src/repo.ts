import { pool } from "./db.js";
import type { RowDataPacket } from "mysql2";
import type { Scores } from "./game/scoring.js";


// Вызываем на /start: создаём пользователя (если нет) и новую сессию
export async function startSession(tgId: number, username?: string) {
  await pool.execute(
    `INSERT INTO users (tg_id, username) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE username = VALUES(username)`,
    [tgId, username ?? null]
  );
  await pool.execute(
    `INSERT INTO sessions (user_id, step)
     SELECT id, 'letter' FROM users WHERE tg_id = ?`,
    [tgId]
  );
}

// Обновляем шаг в последней незавершённой сессии
export async function setStep(tgId: number, step: string) {
  await pool.execute(
    `UPDATE sessions SET step = ?
     WHERE user_id = (SELECT id FROM users WHERE tg_id = ?)
       AND finished_at IS NULL
     ORDER BY id DESC LIMIT 1`,
    [step, tgId]
  );
}

export interface ActiveSession {
  id: number;
  currentQ: number;
  scores: Scores;
}

export async function getActiveSession(tgId: number): Promise<ActiveSession | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT s.id, s.current_q, s.scores_json
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE u.tg_id = ? AND s.finished_at IS NULL
     ORDER BY s.id DESC LIMIT 1`,
    [tgId]
  );
  const r = rows[0];
  if (!r) return null;
  const raw = r.scores_json;
  const scores: Scores = !raw ? {} : typeof raw === "string" ? JSON.parse(raw) : raw;
  return { id: r.id, currentQ: r.current_q, scores };
}

export async function saveProgress(
  sessionId: number,
  step: string,
  currentQ: number,
  scores: Scores
) {
  await pool.execute(
    `UPDATE sessions SET step = ?, current_q = ?, scores_json = ? WHERE id = ?`,
    [step, currentQ, JSON.stringify(scores), sessionId]
  );
}

// записываем итог и закрываем сессию
export async function finishSession(sessionId: number, faculty: string) {
  await pool.execute(
    `UPDATE sessions SET faculty = ?, finished_at = NOW() WHERE id = ?`,
    [faculty, sessionId]
  );
}

// общая статистика: сколько раз выпал каждый факультет
export async function getStats(): Promise<Record<string, number>> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT faculty, COUNT(*) AS cnt
     FROM sessions
     WHERE finished_at IS NOT NULL AND faculty IS NOT NULL
     GROUP BY faculty`
  );
  const result: Record<string, number> = {};
  for (const r of rows) result[r.faculty] = Number(r.cnt);
  return result;
}

// последний результат конкретного пользователя
export async function getMyFaculty(tgId: number): Promise<string | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT s.faculty
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE u.tg_id = ? AND s.faculty IS NOT NULL
     ORDER BY s.id DESC LIMIT 1`,
    [tgId]
  );
  return rows[0]?.faculty ?? null;
}