const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair7",
    author: "ɪᴍʀᴀɴ",
    role: 0,
    shortDescription: "Love pair photo generator",
    longDescription: "Creates a love match with mention, reply, or random partner.",
    category: "love",
    guide: "{pn} [@mention or reply or none]"
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("💝", event.messageID, () => {}, true);

    const pathImg = __dirname + "/cache/love_match.png";
    const pathAvt1 = __dirname + "/cache/avt1.png";
    const pathAvt2 = __dirname + "/cache/avt2.png";

    const id1 = event.senderID;
    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;
    const botID = api.getCurrentUserID();

    let id2;
    if (Object.keys(event.mentions).length > 0) {
      id2 = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      id2 = event.messageReply.senderID;
    } else {
      let gender1;
      for (const u of all) if (u.id == id1) gender1 = u.gender;

      const candidates = all.filter(u =>
        u.id !== id1 &&
        u.id !== botID &&
        u.gender &&
        gender1 &&
        u.gender !== gender1
      );

      if (candidates.length === 0)
        return api.sendMessage("𝑺𝒐𝒓𝒓𝒚 𝑩𝒂𝒃𝒚 🧸 𝒏𝒐 𝒔𝒖𝒊𝒕𝒂𝒃𝒍𝒆 𝒑𝒆𝒓𝒔𝒐𝒏 𝒘𝒂𝒔 𝒇𝒐𝒖𝒏𝒅 𝒇𝒐𝒓 𝒑𝒂𝒊𝒓𝒊𝒏𝒈 🍬", event.threadID, event.messageID);

      id2 = candidates[Math.floor(Math.random() * candidates.length)].id;
    }

    const name1 = all.find(u => u.id === id1)?.name || "User One";
    const name2 = all.find(u => u.id === id2)?.name || "User Two";
    const bgUrl = "https://files.catbox.moe/lshthw.jpg";

    try {
      const getAvt1 = (await axios.get(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt1, Buffer.from(getAvt1, "utf-8"));

      const getAvt2 = (await axios.get(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt2, Buffer.from(getAvt2, "utf-8"));

      const getBackground = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(getBackground, "utf-8"));

      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);
      const baseAvt2 = await loadImage(pathAvt2);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 15;
      ctx.drawImage(baseAvt1, 717, 202, 303, 303);
      ctx.drawImage(baseAvt2, 1103, 510, 300, 303);

      const finalBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, finalBuffer);

      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      const percent = Math.floor(Math.random() * 100);

      // Changed the line structure for a more beautiful look, Baby
      const bodyText = `𝑳𝒐𝒗𝒆 𝑷𝒂𝒊𝒓 𝑨𝒍𝒆𝒓𝒕 🎀\n\n` +
                       `𝑪𝒐𝒏𝒈𝒓𝒂𝒕𝒔 ✨ ${name1}\n` +
                       `𝒀𝒐𝒖 𝒂𝒓𝒆 𝒑𝒂𝒊𝒓𝒆𝒅 𝒘𝒊𝒕𝒉 ✨ ${name2} 🍭\n\n` +
                       `𝑳𝒐𝒗𝒆 𝒇𝒊𝒏𝒅𝒔 𝒊𝒕𝒔 𝒘𝒂𝒚 🧸 𝒂𝒏𝒅 𝒊𝒕 𝒋𝒖𝒔𝒕 𝒅𝒊𝒅 𝑩𝒂𝒃𝒚 🍼\n` +
                       `𝑪𝒐𝒏𝒏𝒆𝒄𝒕𝒊𝒐𝒏 𝑺𝒄𝒐𝒓𝒆 𝒊𝒔 ${percent}% 🧁`;

      return api.sendMessage(
        {
          body: bodyText,
          mentions: [
            { tag: name1, id: id1 },
            { tag: name2, id: id2 }
          ],
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("𝑨𝒏 𝒆𝒓𝒓𝒐𝒓 𝒐𝒄𝒄𝒖𝒓𝒓𝒆𝒅 𝒘𝒉𝒊𝒍𝒆 𝒎𝒂𝒌𝒊𝒏𝒈 𝒕𝒉𝒊𝒔 𝒄𝒖𝒕𝒆 𝒑𝒂𝒊𝒓 𝑩𝒂𝒃𝒚 😿", event.threadID);
    }
  }
};
