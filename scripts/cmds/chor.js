const fs = require("fs-extra");
const Canvas = require("canvas");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "chor",
    version: "3.1",
    author: "♡—͟͞͞Tꫝᴍɪᴍ ⸙ (fixed by Gemini)",
    countDown: 5,
    role: 0,
    shortDescription: "Scooby Doo meme",
    longDescription: "Profile pic দিয়ে Scooby Doo meme generate করে",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone"
    }
  },

  onStart: async function ({ message, event }) {
    const cacheDir = path.join(__dirname, "cache");
    const outputPath = path.join(cacheDir, `chor_${event.senderID}.png`);

    try {
      // Ensure cache directory exists
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      // Target selection: Mentions > Reply > Self
      let mentionId =
        Object.keys(event.mentions)[0] ||
        (event.messageReply ? event.messageReply.senderID : event.senderID);

      // Canvas setup matching the Scooby Doo template
      const canvas = Canvas.createCanvas(500, 670);
      const ctx = canvas.getContext("2d");

      // Load background
      const background = await Canvas.loadImage("https://i.imgur.com/ES28alv.png");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Fetch avatar using FB Graph API with token
      const fbToken = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const avatarURL = `https://graph.facebook.com/${mentionId}/picture?width=512&height=512&access_token=${fbToken}`;
      
      const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
      const avatarImg = await Canvas.loadImage(Buffer.from(response.data));

      // Draw Circular Avatar using Canvas (Faster than Jimp)
      const x = 48, y = 410, size = 111;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, size, size);
      ctx.restore();

      // Save and Send
      const buffer = canvas.toBuffer();
      fs.writeFileSync(outputPath, buffer);

      await message.reply({
        body: "মুরগির ডিম চুরি করতে গিয়ে ধরা খাইছে 🐸😂",
        attachment: fs.createReadStream(outputPath)
      });

    } catch (e) {
      console.error(e);
      message.reply("❌ Error generating meme. Please try again!");
    } finally {
      // Cleanup
      if (fs.existsSync(outputPath)) {
        setTimeout(() => fs.unlinkSync(outputPath), 5000);
      }
    }
  }
};