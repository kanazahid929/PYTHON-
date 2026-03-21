const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "info",
    version: "5.5",
    author: "♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙",
    countDown: 5,
    role: 0,
    category: "system"
  },

  onStart: async function ({ message }) {
    // --- Configuration ---
    const ownerName = "𝐓𝐀𝐌𝐈𝐌";
    const status = "𝐒𝐈𝐍𝐆𝐋𝐄";
    const location = "𝐑𝐀𝐉𝐒𝐇𝐀𝐇𝐈, 𝐍𝐀𝐎𝐆𝐀𝐎𝐍";
    const videoUrl = "https://files.catbox.moe/stzcl2.mp4";
    
    // --- Social Links ---
    const fb = "facebook.com/its.x.tamim";
    const insta = "instagram.com/tamim__4047";
    const tg = "t.me/ISMETAMIM";

    // --- Stats ---
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const now = moment().tz("Asia/Dhaka");
    const date = now.format("DD/MM/YYYY");
    const day = now.format("dddd");
    const time = now.format("hh:mm:ss A");

    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    // --- Final Polished Design ---
    const design = `
╭━━━━━━━〔 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎 〕━━━━━━━╮

   🐥 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐎𝐅𝐈𝐋𝐄
  ━━━━━━━━━━━━━━━━━━━━
  ⌬ 𝐍𝐚𝐦𝐞   : ${ownerName}
  ⌬ 𝐒𝐭𝐚𝐭𝐮𝐬 : ${status}
  ⌬ 𝐋𝐨𝐜    : ${location}

  🌐 𝐒𝐎𝐂𝐈𝐀𝐋 𝐂𝐎𝐍𝐍𝐄𝐂𝐓
  ━━━━━━━━━━━━━━━━━━━━
  ⸙ 𝐅𝐁    : ${fb}
  ⸙ 𝐈𝐆    : ${insta}
  ⸙ 𝐓𝐆    : ${tg}

  🤖 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒
  ━━━━━━━━━━━━━━━━━━━━
  々𝐁𝐨𝐭 𝐍𝐚𝐦𝐞   : ${global.GoatBot.config.nickNameBot}
  々 𝐏𝐫𝐞𝐟𝐢𝐱 : ${global.GoatBot.config.prefix}
  々 𝐔𝐩𝐭𝐢𝐦𝐞 : ${d}𝐝 ${h}𝐡 ${m}𝐦 ${s}𝐬
  々 𝐑𝐀𝐌    : ${Math.round(usedMemory)}𝐌𝐁

  📅 𝐓𝐈𝐌𝐄 𝐙𝐎𝐍𝐄
  ━━━━━━━━━━━━━━━━━━━━
  ⧖ 𝐃𝐚𝐭𝐞   : ${date} (${day})
  ⧖ 𝐓𝐢𝐦𝐞   : ${time}

╰━━━━━━〔  —͟͞͞𝐓𝐀𝐌𝐈𝐌  〕━━━━━━╯
`;

    const cachePath = path.join(__dirname, "cache");
    const filePath = path.join(cachePath, `info_${Date.now()}.mp4`);

    try {
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

      const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data, "utf-8"));

      return message.reply({
        body: design,
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error("Info Error:", err.message);
      return message.reply(design);
    }
  }
};
