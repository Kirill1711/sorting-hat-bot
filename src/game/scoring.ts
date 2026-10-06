import type { Faculty } from "./questions.js";

export type Scores = Partial<Record<Faculty, number>>;

export function addScore(scores: Scores, faculty: Faculty): Scores {
  return { ...scores, [faculty]: (scores[faculty] ?? 0) + 1 };
}

export function getWinner(scores: Scores): Faculty {
  const all: Faculty[] = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
  const max = Math.max(...all.map((f) => scores[f] ?? 0));
  const leaders = all.filter((f) => (scores[f] ?? 0) === max);
  // при равенстве выбираем случайно
  return leaders[Math.floor(Math.random() * leaders.length)];
}