const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const fancy = (text) => {
  const map = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

module.exports = {
  config: {
    name: "edit2",
    aliases: ["imgedit2", "e2"],
    version: "1.1.0",
    role: 0,
    author: "IMRAN | Saif",
    description: "AI image editing v2 for 1000 coins",
    category: "image",
    countDown: 15,
    guide: "{pn} [prompt] | [link] or reply to photo"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const COST = 1000;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return api.sendMessage(`‎🎀\n > ${senderName}\n\n` + fancy(`• Baby, You need ${COST} coins to use this AI tool! Use daily /quiz and other games to earn more and come back, Baby!`), event.threadID);
      }

      let imageUrl = event.messageReply?.attachments?.[0]?.url || null;
      const prompt = args.join(" ").split("|")[0]?.trim();

      if (!imageUrl && args.join(" ").includes("|")) {
        imageUrl = args.join(" ").split("|")[1]?.trim();
      }

      if (!imageUrl || !prompt) {
        return api.sendMessage(`‎🎀\n > ${senderName}\n\n` + fancy("• Please provide both a prompt and an image (link or reply), Baby!"), event.threadID);
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const apiUrl = `https://mahabub-apis.onrender.com/mahabub/editimg?url=${encodeURIComponent(imageUrl.replace(/\s/g, ""))}&prompt=${encodeURIComponent(prompt)}`;

      const apiRes = await axios.get(apiUrl);
      if (!apiRes.data || !apiRes.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage(fancy("• API error, try again later Baby!"), event.threadID);
      }

      const finalImageUrl = apiRes.data.result;
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const tempPath = path.join(cacheDir, `edit2_${senderID}.png`);

      const imgRes = await axios({
        method: "GET",
        url: finalImageUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(tempPath);
      imgRes.data.pipe(writer);

      writer.on("finish", async () => {
        // DEDUCT COINS Baby
        const remaining = balance - COST;
        await usersData.set(senderID, { ...userData, money: remaining });

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        const successMsg = `‎🎀\n > ${senderName}\n\n` +
          `• ` + fancy(`Image edited successfully with V2!`) + `\n` +
          `• ` + fancy(`Deducted: ${COST} Coins`) + `\n` +
          `• ` + fancy(`Balance: ${remaining} Baby`);

        api.sendMessage(
          {
            body: successMsg,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          },
          event.messageID
        );
      });

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(fancy("• Something went wrong during editing, Baby!"), event.threadID);
    }
  }
};
