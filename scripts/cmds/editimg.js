const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "editimg",
    aliases: ["e2"],
    version: "1.0.1",
    role: 0,
    credits: "IMRAN | Updated by MAHABUB",
    description: "AI image editing using prompt + image or link",
    prefix: true,
    category: "Image Generator",
    usage: "editimg [prompt] | [imageUrl]",
    cooldown: 5
  },

  onStart: async function ({ api, event, args }) {
    let imageUrl = event.messageReply?.attachments?.[0]?.url || null;
    const prompt = args.join(" ").split("|")[0]?.trim();

    // If link provided after pipe
    if (!imageUrl && args.join(" ").includes("|")) {
      imageUrl = args.join(" ").split("|")[1]?.trim();
    }

    // Validate
    if (!imageUrl || !prompt) {
      return api.sendMessage(
        "📸 𝙀𝘿𝙄𝙏•𝙄𝙈𝙂\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "⛔ You must provide both a prompt and an image!\n\n" +
        "✨ Example:\n" +
        "▶ editimg add cute girlfriend |\n\n" +
        "🖼 Or reply to an image:\n" +
        "▶ editimg add cute girlfriend",
        event.threadID,
        event.messageID
      );
    }

    imageUrl = imageUrl.replace(/\s/g, "");
    if (!/^https?:\/\//.test(imageUrl)) {
      return api.sendMessage(
        "⚠ Invalid image URL!\n" +
        "🔗 Must start with http:// or https://",
        event.threadID,
        event.messageID
      );
    }

    // 🔥 NEW API (JSON first)
    const apiUrl = `https://mahabub-apis.onrender.com/mahabub/editimg?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

    const waitMsg = await api.sendMessage("⏳ Processing image, please wait...", event.threadID);

    try {
      // 1️⃣ Request JSON
      const apiRes = await axios.get(apiUrl);

      if (!apiRes.data || !apiRes.data.result) {
        return api.sendMessage("❌ API returned no result.", event.threadID, event.messageID);
      }

      const finalImageUrl = apiRes.data.result;
      const tempPath = path.join(__dirname, "cache", `edited_${event.senderID}.png`);

      // 2️⃣ Download final image
      const imgRes = await axios({
        method: "GET",
        url: finalImageUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(tempPath);
      imgRes.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: `🔍 Prompt: "${prompt}"\n🖼 AI Image Generated Successfully! ✔️`,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => {
            fs.unlinkSync(tempPath);
            api.unsendMessage(waitMsg.messageID);
          },
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error(err);
        api.sendMessage("❌ Failed to save image file.", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error while generating image.", event.threadID, event.messageID);
    }
  }
};
