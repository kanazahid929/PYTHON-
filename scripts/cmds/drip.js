const axios = require("axios");

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
    name: "drip",
    aliases: ["rich"],
    version: "2.0",
    author: "kshitiz / Saif",
    countDown: 10,
    role: 0,
    category: "fun",
    guide: "{pn} [@mention | reply | blank for random]"
  },

  async onStart({ api, event, usersData, message }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // BROKE CHECK Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy(`• Baby, You need ${COST} coins to show off your richness! Use /quiz to earn more, Baby!`));
      }

      // Determine target Baby
      let targetID;
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const participants = threadInfo.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
        if (participants.length === 0) targetID = senderID;
        else targetID = participants[Math.floor(Math.random() * participants.length)];
      }

      api.setMessageReaction("🤑", event.messageID, () => {}, true);

      const targetName = await usersData.getName(targetID);
      const avatarURL = await usersData.getAvatarUrl(targetID);
      const gifURL = `https://api.popcat.xyz/drip?image=${encodeURIComponent(avatarURL)}`;

      // Deduct coins Baby
      const remaining = balance - COST;
      await usersData.set(senderID, { ...userData, money: remaining });

      const successMsg = `‎🎀\n > ${senderName}\n\n` +
        `• ` + fancy(`Baby, you can't handle @${targetName}'s richness!`) + `\n` +
        `• ` + fancy(`Deducted: ${COST} Coins`) + `\n` +
        `• ` + fancy(`Balance: ${remaining} Baby`);

      await message.reply({
        body: successMsg,
        mentions: [{ tag: `@${targetName}`, id: targetID }],
        attachment: [await global.utils.getStreamFromURL(gifURL)]
      });

    } catch (err) {
      console.error(err);
      api.sendMessage(fancy("• Failed to get the drip, Baby!"), event.threadID);
    }
  }
};