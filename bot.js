const dotenv = require('dotenv');
dotenv.config();

const { setupDb, addReminder, getReminders, removeReminder, addStarredMessage, isMessageOnStarboard } = require('./database');
const { generateReminderDate } = require('./utils/remindMeUtils');

const token = process.env.TOKEN;
const { Client, MessageEmbed } = require('discord.js-selfbot-v13');
const client = new Client();

client.once('ready', async () => {
  console.log('Ready!');
  // await setupDb();
  checkReminders()
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
  if (message.author.bot) {
    return;
  }

  if (message.content.toLowerCase().startsWith('!remindme')) {
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
    return;
  }

  if (message.content.toLowerCase().includes('patriarchat')) {
    message.reply({
      content: `https://cdn.discordapp.com/attachments/895595804276961301/1196458167748534332/image.webp?ex=65c0ee00&is=65ae7900&hm=eccca85fd3491ad49e460b3bc67bb1bc9c7c37f3c3b16cff4ee477cca26c1111&`,
      allowedMentions: { repliedUser: false }
    });
    return;
  }

  // if (message.content.toLowerCase().includes('polityka') || message.content.toLowerCase().includes('polityczny') || message.content.toLowerCase().includes('politycznie') || message.content.toLowerCase().includes('polityk')) {
  //   message.reply({
  //     content: `<#1165755063256494082>`,
  //     allowedMentions: { repliedUser: false }
  //   });
  //   return;
  // }

  if (message.content.toLowerCase().startsWith('.ktopytal')) {
    message.reply({
      content: `https://cdn.discordapp.com/attachments/895385698981543999/1200552760811192461/xv8AmU7.png?ex=65c698e3&is=65b423e3&hm=1955da13b205bf858b385b75d30768f72dcb98331d2fb37768e531bca2cfea31&`,
      allowedMentions: { repliedUser: false }
    });
    return;
  }

  if (message.content.toLowerCase().startsWith('.definicja')) {
    message.reply({
      content: `https://i.imgur.com/dCSkN2I.png`,
      allowedMentions: { repliedUser: false }
    });
    return;
  }

  // if (message.content.toLowerCase().includes('zbawić')) {
  //   message.reply({
  //     content: `Zniszczyć fandom`,
  //     allowedMentions: { repliedUser: false }
  //   });
  //   return;
  // }

  if (message.content.toLowerCase().includes('konwent rogera') || message.content.toLowerCase().includes('konwent rodzera') || message.content.toLowerCase().includes('konwent rodżera') || message.content.toLowerCase().includes('konwent rodgera')) {
    message.reply({
      content: `już nigdy się nie pozbiera`,
      allowedMentions: { repliedUser: false }
    });
    return;
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  // Check if the reaction is not from a bot
  if (user.bot) return;

  // Fetch the message if not cached
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Fetching message failed:', error);
      return;
    }
  }

  const { message } = reaction;
  if (message.channelId === '901928246231314472' || message.channelId === '902594330932432947' || message.channelId === '915604394031079465') return;
  const starboardChannelID = "895593116109799434";
  const specialReactionID = "906592134545690664";

  // Check for 10 reactions of any kind or the specific reaction
  if (reaction.count >= 10 || reaction.emoji.id === specialReactionID) {
    const { message } = reaction;

    // Check if the message has already been starred
    const starboardMessage = await isMessageOnStarboard(message.id)
    if (starboardMessage.length !== 0) return;

    const authorID = message.author.id;
    const authorAvatar = message.author.displayAvatarURL();
    const messageLink = message.url;
    const messageContent = message.content;

    // // Create the embed
    // const embed = new MessageEmbed()
    //   .setAuthor({ name: authorName, iconURL: authorAvatar })
    //   .setDescription(messageContent)
    //   .setColor('#FFAC33');

    // // Attach all message attachments as image links
    // message.attachments.forEach((attachment) => {
    //   embed.setImage(attachment.url);
    // });

    // Preparing 'similar to embed' message content with markdown
    let simulatedEmbedContent = `:sparkles: <${authorID}> ➤ ${messageLink}\n\n>>> ${messageContent}`;

    // Include attachments if any
    if (messageContent) {
      message.attachments.forEach((attachment) => {
        simulatedEmbedContent += `\n\n${attachment.url}\n`;
      });
    } else {
      message.attachments.forEach((attachment) => {
        simulatedEmbedContent += `${attachment.url}\n`;
      });
    }


    // Preparing 'similar to embed' message content with markdown
    let simulatedEmbedContentFinal = `:sparkles: <@${authorID}> ➤ ${messageLink}\n\n>>> ${messageContent}`;

    // Include attachments if any
    if (messageContent) {
      message.attachments.forEach((attachment) => {
        simulatedEmbedContentFinal += `\n\n${attachment.url}\n`;
      });
    } else {
      message.attachments.forEach((attachment) => {
        simulatedEmbedContentFinal += `${attachment.url}\n`;
      });
    }

    // Send to the starboard channel as a regular message
    const starboardChannel = await client.channels.fetch(starboardChannelID);
    if (starboardChannel) {
      let message = await starboardChannel.send(simulatedEmbedContent);
      await message.edit(simulatedEmbedContentFinal)
    }
    // Insert into database as starred
    await addStarredMessage(message.id, message.channelId, true);
  }
});

function main() {
  client.login(token);
}

main();
