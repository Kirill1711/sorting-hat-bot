import { InputFile, type Context, type InlineKeyboard } from "grammy";

// имя файла -> file_id, который выдал Telegram
const fileIds = new Map<string, string>();

// если file_id уже есть, отдаём его, иначе загружаем файл с диска
const img = (name: string) => fileIds.get(name) ?? new InputFile(`assets/${name}`);

// новое сообщение с картинкой (для /start)
export async function sendScene(
  ctx: Context,
  image: string,
  caption: string,
  kb?: InlineKeyboard
) {
  const msg = await ctx.replyWithPhoto(img(image), {
    caption,
    reply_markup: kb,
  });
  // запоминаем file_id самого большого размера
  const photo = msg.photo[msg.photo.length - 1];
  fileIds.set(image, photo.file_id);
}

// заменить картинку и подпись в текущем сообщении
export async function editScene(
  ctx: Context,
  image: string,
  caption: string,
  kb?: InlineKeyboard
) {
  const res = await ctx.editMessageMedia(
    { type: "photo", media: img(image), caption },
    { reply_markup: kb }
  );
  // в ответе приходит сообщение (а не true), если это не inline-сообщение
  if (res !== true && "photo" in res && res.photo) {
    fileIds.set(image, res.photo[res.photo.length - 1].file_id);
  }
}

// поменять только подпись, картинка остаётся
export async function editCaption(
  ctx: Context,
  caption: string,
  kb?: InlineKeyboard
) {
  await ctx.editMessageCaption({ caption, reply_markup: kb });
}

