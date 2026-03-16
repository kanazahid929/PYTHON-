const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

const fancy = (text) => {
  const map = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

const fetchAvatar = async (uid) => {
  try {
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to fetch avatar: ${error.message}`);
  }
};

module.exports = {
  config: {
    name: 'dim',
    aliases: ['egg', 'anda'],
    version: '3.1',
    author: 'abrar / Saif',
    role: 0,
    category: 'fun',
    countDown: 10,
    shortDescription: 'Turn someone into an egg with 500 coins'
  },

  onStart: async function ({ event, api, message, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy(`• Baby, You need ${COST} coins to use this command! Use daily /quiz to earn more, Baby!`));
      }

      let targetID;
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const participants = threadInfo.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
        if (participants.length === 0) return message.reply(fancy("• No one else is here to egg, Baby!"));
        targetID = participants[Math.floor(Math.random() * participants.length)];
      }

      if (targetID === senderID) return message.reply(fancy("• You can't make yourself an egg, Baby!"));

      api.setMessageReaction("🥚", event.messageID, () => {}, true);

      const avatarBuffer = await fetchAvatar(targetID);
      const avatar = await loadImage(avatarBuffer);
      const bg = await loadImage('https://i.postimg.cc/Wbt5GLY7/5674fba3a393f7578a73919569b5147f.jpg');

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bg, 0, 0);

      const size = 150, x = 100, y = 60;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, x, y, size, size);
      ctx.restore();

      const output = path.join(__dirname, 'cache', `dim_${targetID}.png`);
      await fs.ensureDir(path.join(__dirname, 'cache'));
      await fs.writeFile(output, canvas.toBuffer());

      // DEDUCT COINS Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      const targetName = await usersData.getName(targetID);
      const successMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + fancy(`${targetName} is now a DIM LEVEL MAX!`) + `\n` +
        `• ` + fancy(`Deducted: ${COST} Coins`) + `\n` +
        `• ` + fancy(`Remaining: ${remaining} Baby`);

      await message.reply({
        body: successMsg,
        mentions: [{ tag: targetName, id: targetID }],
        attachment: fs.createReadStream(output)
      }, () => {
        if (fs.existsSync(output)) fs.unlinkSync(output);
      });

    } catch (e) {
      console.error(e);
      message.reply(fancy("• Failed to create egg, Baby!"));
    }
  }
};
