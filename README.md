# Sorting Hat Bot

Telegram-квиз «Распределяющая шляпа». Пользователь проходит интро, отвечает на 12 случайных вопросов и получает факультет Хогвартса.

## Стек
Node.js 20, TypeScript, grammY, MySQL (mysql2)

## Возможности
- Интро с картинками и inline-кнопками
- Банк вопросов, на каждую игру выбираются 12 случайных, варианты перемешаны
- Прогресс хранится в БД, бот переживает перезапуск
- Статистика по факультетам

## Запуск локально
```bash
npm install
cp .env.example .env   # заполните значения
npm run dev
```

## База данных
Создайте базу `hp_quiz` (utf8mb4) и таблицы `users` и `sessions`. SQL лежит в `db/schema.sql`.

## Переменные окружения
| Переменная | Описание |
|---|---|
| BOT_TOKEN | токен от @BotFather |
| DB_HOST, DB_PORT | адрес MySQL |
| DB_USER, DB_PASSWORD | пользователь БД |
| DB_NAME | имя базы (hp_quiz) |

## Продакшен
```bash
npm ci
npm run build
pm2 start dist/index.js --name sorting-hat-bot
pm2 save
```

## Структура
- `src/bot/` обработчики, сцены, отправка медиа
- `src/game/` вопросы, подсчёт, тексты финала
- `src/repo.ts` запросы к БД
- `assets/` картинки сцен