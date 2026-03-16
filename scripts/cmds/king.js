const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "king",
    aliases: ["kong", "queen"],
    version: "14.0",
    author: "saif",
    countDown: 5,
    role: 0,
    shortDescription: "Make someone the Buff Doge King",
    longDescription: "Fits profile picture perfectly into the black face area",
    category: "fun",
    guide: { en: "{pn} @tag | reply | random" }
  },

  onStart: async function ({ event, message, usersData, threadsData }) {
    try {
      let targetUID = event.messageReply?.senderID || Object.keys(event.mentions || {})[0] || event.senderID;

      if (event.body.split(/\s+/)[1]?.toLowerCase() === "random") {
        const info = await threadsData.get(event.threadID);
        const members = (info.members || []).map(m => m.userID).filter(id => id !== event.senderID);
        if (members.length) targetUID = members[Math.floor(Math.random() * members.length)];
      }

      const avatarURL = `https://graph.facebook.com/${targetUID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const bgURL = "https://files.catbox.moe/fsy1pi.jpg"; 

      const [avatarImg, bgImg] = await Promise.all([
        loadImage(avatarURL),
        loadImage(bgURL)
      ]);

      const canvas = createCanvas(976, 1200);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, 976, 1200);

      // --- 👑 THE 4 PIXEL RIGHT MOVE BABY 👑 ---
      const size = 188;   
      const x = 364;      // Baby, ৪ পিক্সেল ডানে সরালাম (৩৬০ থেকে ৩৬৪)
      const y = 395;      

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(avatarImg, x, y, size, size);
      ctx.restore();

      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpPath = path.join(tmpDir, `king_${targetUID}.png`);
      
      fs.writeFileSync(tmpPath, canvas.toBuffer());
      const targetName = await usersData.getName(targetUID);
      
      return message.reply({
        body: `• 𝐁𝐞𝐡𝐨𝐥𝐝 𝐭𝐡𝐞 𝐍𝐞𝐰 𝐊𝐢𝐧𝐠! 👑\n• 𝐁𝐚𝐛𝐲, 𝐭𝐡𝐞 𝐜𝐫𝐨𝐰𝐧 𝐟𝐢𝐭𝐬 ${targetName} 𝐩𝐞𝐫𝐟𝐞𝐜𝐭𝐥𝐲! 😼🔥`,
        attachment: fs.createReadStream(tmpPath)
      }, () => {
          try { fs.unlinkSync(tmpPath); } catch (e) {}
      });

    } catch (err) {
      console.error(err);
      message.reply("Something went wrong, Baby!");
    }
  }
};
