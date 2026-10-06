export interface Scene {
  text: string;
  image: string;   // имя файла из assets/
  button: string;
  next: string;
}
  
  export const intro: Record<string, Scene> = {
    letter: {
      text: "✉️ Тебе пришло письмо.\nНа конверте зелёными чернилами написан твой адрес.",
      image: "letter.jpg",
      button: "Открыть письмо",
      next: "hogwarts",
    },
    hogwarts: {
      text: "🏰 Ты прибыл в Хогвартс.\nЗамок встречает тебя огнями окон.",
      image: "hogwarts.jpg",
      button: "Продолжить",
      next: "hall",
    },
    hall: {
      text: "🕯️ Большой зал.\nСвечи парят под потолком, все взгляды обращены на тебя.\n\n🎩 На табурете лежит Распределяющая шляпа.",
      image: "hall.jpg",
      button: "Сесть на табурет",
      next: "q1", // пока заглушка, на шаге 3 заменим на вопросы
    },
  };