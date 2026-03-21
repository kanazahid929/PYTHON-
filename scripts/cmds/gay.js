const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const DIG = require("discord-image-generation");

module.exports = {
  config: {
    name: "gay",
    aliases: ["rainbow", "lgbt", "lesbian", "lsbn"],
    version: "3.0",
    author: "SIFAT & Tamim",
    countDown: 5,
    role: 0,
    shortDescription: "Find who's gay 😆 (Cost: 700 coins)",
    longDescription: "Applies a rainbow gay filter to the mentioned or replied user's avatar (700 coin cost)",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to a message"
    }
  },

  onStart: async function ({ api, event, message, usersData }) {
    try {
      const senderID = event.senderID;

      // 💰 Coin Check
      const userData = await usersData.get(senderID);
      const balance = userData.money || 0;

      if (balance < 700) {
        return message.reply("❌ | 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 700 𝐜𝐨𝐢𝐧𝐬 𝐭𝐨 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐛𝐚𝐛𝐲!");
      }

      let targetID;

      const mentions = Object.keys(event.mentions || {});
      if (mentions.length > 0) {
        targetID = mentions[0];
      }

      if (!targetID && event.messageReply && event.messageReply.senderID) {
        targetID = event.messageReply.senderID;
      }

      if (!targetID) {
        targetID = senderID;
      }

      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID].name;

      const imagePath = await applyGayFilter(avatarUrl);

      // 💸 Deduct 700 coins
      await usersData.set(senderID, {
        money: balance - 700
      });

      const attachment = fs.createReadStream(imagePath);
      await message.reply({
        body: `🏳️‍🌈 Look! I found a gay: ${name} 😜\n💸 700 coins deducted!`,
        attachment
      });

      fs.unlinkSync(imagePath);

    } catch (error) {
      console.error(error);
      message.reply("❌ Something went wrong while processing the image.");
    }
  }
};

// 🏳️‍🌈 Function to apply gay filter
async function applyGayFilter(avatarUrl) {
  try {
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "utf-8"); 

    const gayFilter = new DIG.Gay();
    const filteredImage = await gayFilter.getImage(imageBuffer);

    const outputDir = path.join(__dirname, "cache");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const outputFile = path.join(outputDir, `gay_${Date.now()}.png`);
    fs.writeFileSync(outputFile, filteredImage);

    return outputFile;
  } catch (err) {
    throw new Error(err);
  }
}
