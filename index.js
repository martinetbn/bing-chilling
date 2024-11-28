require("./web.js");
require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 100,
  },
});

const history = require("./history.js");

const chat = model.startChat(history);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let cooldown = new Set();

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.mentions.has(client.user) && !msg.mentions.everyone) {
    if (cooldown.has(msg.author.id)) {
      msg.reply("banca pibe me estás matando.");
      return;
    } else {
      cooldown.add(msg.author.id);
      setTimeout(() => {
        cooldown.delete(msg.author.id);
      }, 15000);
    }
    await msg.channel.sendTyping();
    try {
      const message = msg.content.replace(`<@!${client.user.id}>`, "").trim();
      const result = await chat.sendMessage(
        msg.author.displayName + ": " + message
      );
      await msg.reply(result.response.text());
    } catch (err) {
      console.log(err);
    }
  }
});

client.login(process.env.TOKEN);