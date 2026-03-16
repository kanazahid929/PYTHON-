const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "poli",
    author: "MahMUD",
    version: "2.0",
    cooldowns: 10,
    role: 2,
    category: "image",
    guide: { en: "{p}poli <prompt>" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const uid = event.senderID;

    // Get user data
    let userData = await usersData.get(uid);
    if (!userData) userData = { money: 0 };

    // Check balance
    if (userData.money < 500) {
      return message.reply(`❌ | Senpai, you need at least 500 coins to generate images baka!\n💰 Your balance: ${userData.money || 0} nya~`);
    }

    // Deduct balance
    userData.money -= 500;
    await usersData.set(uid, userData);

    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ | Onii-chan! You forgot to give a prompt baka~ 💦");

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    message.reply(`⌛ | Generating kawaii images senpai... nya~ 💖\n💸 500 coins deducted. Remaining balance: ${userData.money} 🐰`);

    try {
      const styles = ["ultra detailed", "anime style", "kawaii art", "digital painting"];
      const imagePaths = [];

      for (let i = 0; i < 4; i++) {
        const enhancedPrompt = `${prompt}, ${styles[i % styles.length]}, cute anime baka, senpai, nya~`;
        const response = await axios.post(`${await baseApiUrl()}/api/poli/generate`, { prompt: enhancedPrompt }, {
          responseType: "arraybuffer",
          headers: { "author": module.exports.config.author }
        });

        const filePath = path.join(cacheDir, `generated_${Date.now()}_${i}.png`);
        fs.writeFileSync(filePath, response.data);
        imagePaths.push(filePath);
      }

      const attachments = imagePaths.map(p => fs.createReadStream(p));
      message.reply({
        body: `✅ | Senpai, here are 4 kawaii images generated from: "${prompt}" baka~ 💕`,
        attachment: attachments
      }, () => imagePaths.forEach(p => fs.unlinkSync(p)));

    } catch (err) {
      console.error(err);
      message.reply("❌ | Nyaa~ Couldn't generate images senpai. Try again later baka 💦");
    }
  }
};
