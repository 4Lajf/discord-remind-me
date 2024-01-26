const dotenv = require('dotenv');
dotenv.config();

const { setupDb, addReminder, getReminders, removeReminder } = require('./database');
const { generateReminderDate } = require('./utils/remindMeUtils');

const token = process.env.TOKEN;
const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

client.once('ready', async () => {
  console.log('Ready!');
  // await setupDb();
  setInterval(checkReminders, 60000); // check reminders every minute
});

async function checkReminders() {
  const reminders = await getReminders();
  reminders.forEach(async reminder => {
    try {
      const user = await client.users.fetch(reminder.userId);
      if (reminder.message) {
        await user.send(`Hejka! Przypominam ci o: ${reminder.message}`);
      } else {
        await user.send(`Hejka! Prosiłeś mnie żebym ci o czymś przypomniał :)`);
      }
      await removeReminder(reminder.id);
      console.log(`Reminder for user ${reminder.userId} has been sent and removed from the database.`);
    } catch (error) {
      console.error(`Error sending reminder to user ${reminder.userId}:`, error);
    }
  });
}

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!remindme') || message.author.bot) return;

  const args = message.content.slice('!remindme'.length).trim().split(/ +/);
  if (args[0] && (!args[0].match(/^(\d+)(d|h|m)$/) && args[0] !== "jutro" && args.length === 1)) {
    message.reply({
      content: "Użycie: `!remindme <czas> <wiadomość>`\n" +
        "Format czasu: `[liczba][d/h/m]` lub `jutro`.\n" +
        "Przykład: `!remindme jutro Shippo nie ma racji!`\n" +
        "`wiadomość` jest opcjonalna, `czas` również (domyślnie `1d`)",
      allowedMentions: { repliedUser: false }
    });
    return;
  }

  let durationArg = '1d'; // Default duration
  let remindMessage = null; // Default reminder message

  if (args[0].match(/^(\d+)(d|h|m)$/) || args[0] === "jutro") {
    durationArg = args.shift(); // Use the supplied duration and remove it from args
  }

  if (args.length > 0) {
    remindMessage = args.join(' ');
  }

  const remindDate = generateReminderDate(durationArg);

  await addReminder(message.author.id, remindDate.toISOString(), remindMessage);

  if (remindMessage) {
    message.reply({
      content: `Jasne! Przypomnę ci o "${remindMessage}" za ${durationArg}.`,
      allowedMentions: { repliedUser: false }
    });
  } else {
    message.reply({
      content: `Jasne! Przypomnę ci o tym za ${durationArg}.`,
      allowedMentions: { repliedUser: false }
    });
  }
});

function main() {
  client.login(token);
}

main();
