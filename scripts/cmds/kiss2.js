const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "kiss2",
    aliases: ["ummmah", "kiss2"],
    version: "2.3",
    author: "Efat",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss with a custom image",
    longDescription: "Kiss someone by reply, mention, or randomly.",
    category: "love",
    guide: "{pn} @mention | reply | random"
  },

  onStart: async function ({ api, message, event, usersData }) {
    let targetID;
    const senderID = event.senderID;

    // 🔁 Reply priority
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }
    // 🔔 Mention
    else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }
    // 🎲 Random user
    else {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(
        id => id !== senderID
      );
      if (members.length === 0)
        return message.reply("❗ No one found to kiss.");

      targetID = members[Math.floor(Math.random() * members.length)];
    }

    try {
      // 🖼️ Avatars
      const avatarTarget =
        (await usersData.getAvatarUrl(targetID)) ||
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512`;

      const avatarSender =
        (await usersData.getAvatarUrl(senderID)) ||
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;

      // 📥 Load images
      const [targetImg, senderImg] = await Promise.all([
        Canvas.loadImage(avatarTarget),
        Canvas.loadImage(avatarSender)
      ]);

      // 🌄 Background
      const bgUrl = "https://bit.ly/44bRRQG";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      const bg = await Canvas.loadImage(bgRes.data);

      // 🎨 Canvas
      const canvasWidth = 900;
      const canvasHeight = 600;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

      // 👥 Positions
      const avatarSize = 230;
      const y = canvasHeight / 2 - avatarSize - 90;

      // 🟣 Target (left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        150 + avatarSize / 2,
        y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(targetImg, 150, y, avatarSize, avatarSize);
      ctx.restore();

      // 🔵 Sender (right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvasWidth - 150 - avatarSize / 2,
        y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(
        senderImg,
        canvasWidth - 150 - avatarSize,
        y,
        avatarSize,
        avatarSize
      );
      ctx.restore();

      // 💾 Save
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const imgPath = path.join(tmpDir, `${senderID}_${targetID}_kiss.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      // 💬 Text
      const text =
        senderID === targetID
          ? "Kissing yourself? Interesting choice 😳💋"
          : "Muuuaaaah 💋❤️";

      // ✉️ Send
      await message.reply(
        {
          body: text,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlink(imgPath).catch(() => {})
      );

      canvas.width = canvas.height = 0;
      global.gc && global.gc();

    } catch (err) {
      console.error("Error in kiss command:", err);
      message.reply("⚠️ Failed to generate the kiss image.");
    }
  }
};