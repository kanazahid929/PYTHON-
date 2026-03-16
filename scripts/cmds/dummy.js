const fs = require("fs-extra");
const path = require("path");
const https = require("https");

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
    name: "dummy",
    version: "1.6",
    author: "Chitron / Saif",
    countDown: 10,
    role: 0,
    category: "fun",
    guide: "{pn} text [color]"
  },

  onStart: async function ({ message, args, event, usersData }) {
    const COST = 500;
    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);

    try {
      let userData = await usersData.get(senderID);
      let balance = userData.money || 0;

      // UPDATED BROKE MESSAGE Baby
      if (balance < COST) {
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy(`• Baby, You need ${COST} coins to use this command! Use daily /quiz and other games to earn more and come back, Baby!`));
      }

      if (args.length === 0)
        return message.reply(`‎🎀\n > ${senderName}\n\n` + fancy("• Please provide text for the image, Baby!"));

      let bgColor = "000000"; 
      let textArgs = args;
      const lastArg = args[args.length - 1].toLowerCase();
      const hexMatch = lastArg.match(/^#?([0-9a-f]{6})$/i);
      const colorNames = ["black","white","red","green","blue","yellow","gray","grey","orange","purple","pink","brown","cyan","magenta"];

      if (hexMatch) {
        bgColor = hexMatch[1];
        textArgs = args.slice(0, -1);
      } else if (colorNames.includes(lastArg)) {
        bgColor = lastArg;
        textArgs = args.slice(0, -1);
      }

      if (textArgs.length === 0)
        return message.reply(fancy("• Please provide text before the background color, Baby!"));

      const text = encodeURIComponent(textArgs.join(" "));
      const imageUrl = `https://dummyimage.com/600x300/${bgColor}/fff&text=${text}`;
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `dummy_${Date.now()}.png`);

      const writer = fs.createWriteStream(filePath);
      https.get(imageUrl, (res) => {
        res.pipe(writer);
        writer.on("finish", async () => {
          
          const remaining = balance - COST;
          await usersData.set(senderID, { ...userData, money: remaining });

          const successMsg = `‎🎀\n > ${senderName}\n\n` +
            `• ` + fancy(`Dummy image generated!`) + `\n` +
            `• ` + fancy(`Deducted: ${COST} Coins`) + `\n` +
            `• ` + fancy(`Balance: ${remaining} Baby`);

          message.reply({
            body: successMsg,
            attachment: fs.createReadStream(filePath)
          }, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          });
        });
      });

    } catch (e) {
      console.error(e);
      message.reply(fancy("• Failed to generate image, Baby!"));
    }
  }
};
