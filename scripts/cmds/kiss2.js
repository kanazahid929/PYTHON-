const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "kiss2",
    aliases: [],
    version: "1.3",
    author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
    role: 0,
    shortDescription: "😘 Send a kiss animation to someone",
    category: "fun",
    guide: "Reply to someone's message with: kiss2"
  },

  onStart: async function ({ api, event, message, usersData }) {
    try {
      if (!event.messageReply || !event.messageReply.senderID) {
        return message.reply("❌ You must reply to someone's message to kiss them 😘");
      }

      const uid1 = event.senderID;
      const uid2 = event.messageReply.senderID;

      const name1 = await usersData.getName(uid1);
      const name2 = await usersData.getName(uid2);

      const avatar1 = await getAvatar(uid1);
      const avatar2 = await getAvatar(uid2);

      const prompt = "two people kissing each other, romantic, realistic style";

      const waitMsg = await message.reply("⏳ Generating your kiss video...");

      const mergedImage = await mergeAvatars(avatar1, avatar2);
      const result = await imgToVideo(prompt, mergedImage);

      await message.reply({
        body: `😘 | ${name1} kissed ${name2}! 💋`,
        mentions: [
          { id: uid1, tag: name1 },
          { id: uid2, tag: name2 }
        ],
        attachment: await getStreamFromURL(result[0].video_url)
      });

      fs.unlinkSync(mergedImage);
    } catch (err) {
      console.error("kiss2 error:", err);
      message.reply("❌ Error while generating kiss video.");
    }
  }
};

// ===================== Helpers =====================

async function getStreamFromURL(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

function randomId(len = 16) {
  const chars = "abcdef0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function getBalance() {
  const pack = randomId();
  await axios.post(
    "https://api.getglam.app/rewards/claim/hdnu30r7auc4kve",
    null,
    {
      headers: {
        "User-Agent": "Glam/1.58.4 Android/32",
        "glam-user-id": pack,
        "user_id": pack,
        "glam-local-date": new Date().toISOString()
      }
    }
  );
  return pack;
}

async function uploadFile(pack, stream, prompt, duration) {
  const form = new FormData();
  form.append("package_id", pack);
  form.append("media_file", stream);
  form.append("media_type", "image");
  form.append("template_id", "community_img2vid");
  form.append("template_category", "20_coins_dur");
  form.append(
    "frames",
    JSON.stringify([
      {
        prompt,
        custom_prompt: prompt,
        start: 0,
        end: 0,
        timings_units: "frames",
        media_type: "image",
        style_id: "chained_falai_img2video",
        rate_modifiers: { duration: duration + "s" }
      }
    ])
  );

  const res = await axios.post(
    "https://android.getglam.app/v2/magic_video",
    form,
    { headers: { ...form.getHeaders(), "User-Agent": "Glam/1.58.4 Android/32" } }
  );

  return res.data.event_id;
}

async function getStatus(taskID, pack) {
  while (true) {
    const res = await axios.get(
      "https://android.getglam.app/v2/magic_video",
      {
        params: { package_id: pack, event_id: taskID },
        headers: { "User-Agent": "Glam/1.58.4 Android/32" }
      }
    );
    if (res.data.status === "READY") return [res.data];
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function imgToVideo(prompt, filePath, duration = 5) {
  const pack = await getBalance();
  const task = await uploadFile(pack, fs.createReadStream(filePath), prompt, duration);
  return await getStatus(task, pack);
}

// ===================== FB Avatar =====================
async function getAvatar(uid) {
  return `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
}

// ===================== Merge Avatars =====================
async function mergeAvatars(url1, url2) {
  const img1 = await loadImage(url1);
  const img2 = await loadImage(url2);

  const size = 512;
  const canvas = createCanvas(size * 2, size);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img1, 0, 0, size, size);
  ctx.drawImage(img2, size, 0, size, size);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const filePath = path.join(cacheDir, `kiss_${Date.now()}.png`);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

  return filePath;
}
