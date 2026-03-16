const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "biye",
    aliases: ["marry", "biya", "engage"],
    version: "3.7",
    author: "siyuu",
    countDown: 5,
    role: 0,
    shortDescription: "Propose with a custom image",
    longDescription: "Generate a proposal image with both users’ avatars perfectly placed.",
    category: "fun",
    guide: "{pn} @mention OR reply to a message"
  },

  onStart: async function ({ message, event, usersData }) {
    let targetID;

    // ✅ Reply support
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions);
      if (mention.length === 0) {
        return message.reply("❗ Please mention someone or reply to their message.");
      }
      targetID = mention[0];
    }

    const senderID = event.senderID;

    try {
      // 👤 Get names
      const nameSender = await usersData.getName(senderID);
      const nameTarget = await usersData.getName(targetID);

      // 🖼️ Avatar URLs
      const avatarSender =
        (await usersData.getAvatarUrl(senderID)) ||
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;

      const avatarTarget =
        (await usersData.getAvatarUrl(targetID)) ||
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512`;

      // 📥 Load images
      const [senderImg, targetImg, bg] = await Promise.all([
        Canvas.loadImage(avatarSender),
        Canvas.loadImage(avatarTarget),
        Canvas.loadImage("https://i.postimg.cc/VvjW9DwJ/images-8.jpg")
      ]);

      // 🎨 Canvas setup
      const size = 1280;
      const canvas = Canvas.createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, size, size);

      // 👥 Avatar positions
      const avatarSize = Math.floor(size * 0.11);
      const left = { x: 470, y: 310 };
      const right = { x: 690, y: 200 };

      // 🟣 Target avatar (left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        left.x + avatarSize / 2,
        left.y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(targetImg, left.x, left.y, avatarSize, avatarSize);
      ctx.restore();

      // 🔵 Sender avatar (right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        right.x + avatarSize / 2,
        right.y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(senderImg, right.x, right.y, avatarSize, avatarSize);
      ctx.restore();

      // 💾 Save image
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const imgPath = path.join(tmpDir, `${senderID}_${targetID}_proposal.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      // 💬 Message text
      const text =
        senderID === targetID
          ? "Did you just propose to yourself? 😂💍"
          : `💍 ${nameSender} just proposed to ${nameTarget}! ❤️🥰`;

      // ✉️ Send
      await message.reply(
        {
          body: text,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlink(imgPath).catch(() => {})
      );

      // 🧹 Cleanup
      canvas.width = canvas.height = 0;
      global.gc && global.gc();

    } catch (err) {
      console.error("Error in biye command:", err);
      message.reply(`⚠️ Something went wrong!\n${err.message}`);
    }
  }
};