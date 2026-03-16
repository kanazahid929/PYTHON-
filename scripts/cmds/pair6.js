const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair6",
    author: "ɪᴍʀᴀɴ",
    role: 0,
    shortDescription: "Love Pair Photo Generator",
    longDescription: "Creates a random love match photo in the group",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    api.setMessageReaction("💝", event.messageID, () => {}, true);

    const cache = __dirname + "/cache";
    if (!fs.existsSync(cache)) fs.mkdirSync(cache);
    
    const pathImg = cache + "/pair_bg.png";
    const pathAvt1 = cache + "/avt1.png";
    const pathAvt2 = cache + "/avt2.png";

    const id1 = event.senderID;
    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;
    const botID = api.getCurrentUserID();

    let gender1;
    for (const u of all) if (u.id == id1) gender1 = u.gender;

    let candidates = all.filter(u =>
      u.id !== id1 &&
      u.id !== botID &&
      u.gender &&
      gender1 &&
      u.gender !== gender1
    );

    if (candidates.length === 0) {
      candidates = all.filter(u => u.id !== id1 && u.id !== botID);
      if (candidates.length === 0)
        return api.sendMessage("𝑺𝒐𝒓𝒓𝒚 𝑩𝒂𝒃𝒚 🧸 𝒏𝒐 𝒔𝒖𝒊𝒕𝒂𝒃𝒍𝒆 𝒑𝒆𝒓𝒔𝒐𝒏 𝒘𝒂𝒔 𝒇𝒐𝒖𝒏𝒅 𝒇𝒐𝒓 𝒑𝒂𝒊𝒓𝒊𝒏𝒈 🍬", event.threadID, event.messageID);
    }

    const id2 = candidates[Math.floor(Math.random() * candidates.length)].id;
    const name1 = all.find(u => u.id === id1)?.name || "Unknown User";
    const name2 = all.find(u => u.id === id2)?.name || "Unknown User";

    const bgUrl = "https://i.postimg.cc/cLzjPg8W/fdb70a57a84df74c5118d1ab5541d745.jpg";

    try {
      const avt1 = (await axios.get(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt1, Buffer.from(avt1, "utf-8"));

      const avt2 = (await axios.get(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt2, Buffer.from(avt2, "utf-8"));

      const bg = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));

      const baseImage = await loadImage(pathImg);
      const img1 = await loadImage(pathAvt1);
      const img2 = await loadImage(pathAvt2);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      function drawCircleImage(ctx, img, x, y, w, h) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      }

      drawCircleImage(ctx, img1, 138, 128, 143, 142);
      drawCircleImage(ctx, img2, 433, 130, 142, 142);

      ctx.font = "bold 35px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(name1, 207, 345);
      ctx.fillText(name2, 511, 345);

      const rate = Math.floor(Math.random() * 100);
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#ff7bbd";
      ctx.fillText(`Love Match: ${rate}%`, canvas.width / 2, 430);

      const finalBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, finalBuffer);

      await Promise.all([fs.remove(pathAvt1), fs.remove(pathAvt2)]);

      return api.sendMessage(
        {
          body: `𝑳𝒐𝒗𝒆 𝑷𝒂𝒊𝒓 𝑨𝒍𝒆𝒓𝒕 🎀\n\n𝑪𝒐𝒏𝒈𝒓𝒂𝒕𝒔 ✨ ${name1} 𝒂𝒏𝒅 ${name2} 🍭\n𝑳𝒐𝒗𝒆 𝒇𝒊𝒏𝒅𝒔 𝒊𝒕𝒔 𝒘𝒂𝒚 🧸 𝒂𝒏𝒅 𝒊𝒕 𝒋𝒖𝒔𝒕 𝒅𝒊𝒅 𝑩𝒂𝒃𝒚 🍼\n𝑶𝒖𝒓 𝒔𝒚𝒔𝒕𝒆𝒎 𝒔𝒂𝒚𝒔 𝒚𝒐𝒖 𝒂𝒓𝒆 ${rate}% 𝒎𝒂𝒅𝒆 𝒇𝒐𝒓 𝒆𝒂𝒄𝒉 𝒐𝒕𝒉𝒆𝒓 🧁`,
          mentions: [{ tag: name2, id: id2 }],
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("𝑨𝒏 𝒆𝒓𝒓𝒐𝒓 𝒐𝒄𝒄𝒖𝒓𝒓𝒆𝒅 𝒘𝒉𝒊𝒍𝒆 𝒎𝒂𝒌𝒊𝒏𝒈 𝒕𝒉𝒊𝒔 𝒄𝒖𝒕𝒆 𝒑𝒂𝒊𝒓 𝑩𝒂𝒃𝒚 🍭", event.threadID);
    }
  }
};
