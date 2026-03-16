const axios = require('axios');
const jimp = require("jimp");
const { createCanvas, loadImage } = require('canvas');
const fs = require("fs");

module.exports = {
  config: {
    name: "rizz",
    aliases: [],
    version: "2.1",
    author: "Vex_Kshitiz / Gemini",
    countDown: 10,
    role: 0,
    shortDescription: "rizz the girls",
    longDescription: "rizz the girls in diff way",
    category: "love",
    guide: {
      en: "{p}rizz [@mention | reply | random]",
    }
  },
  onStart: async function ({ message, args, api, event }) {
    let one, two, mentionName;
    const { mentions, messageReply, senderID, participantIDs } = event;

    // Determine the target (two) and the rizzler (one)
    if (Object.keys(mentions).length > 0) {
      // Case 1: Mentioned someone
      one = senderID;
      two = Object.keys(mentions)[0];
      mentionName = mentions[two].split(' ')[0].replace('@', '');
    } else if (messageReply) {
      // Case 2: Replied to a message
      one = senderID;
      two = messageReply.senderID;
      mentionName = "Target"; // Fallback name or you can fetch via API
    } else {
      // Case 3: Random member
      one = senderID;
      const filteredParticipants = participantIDs.filter(id => id !== api.getCurrentUserID() && id !== senderID);
      two = filteredParticipants[Math.floor(Math.random() * filteredParticipants.length)];
      mentionName = "Stranger"; 
    }

    try {
      const ptth = await kshitiz(one, two, mentionName);
      return message.reply({ body: "Check out this rizz, Baby!", attachment: fs.createReadStream(ptth) });
    } catch (err) {
      return message.reply("Failed to generate the rizz image.");
    }
  }
};

async function kshitiz(one, two, mentionName) {
  try {
    const pickupLine = await fetchPickupLine();
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext('2d');

    const background = await loadImage("https://i.ibb.co/F0ckScv/Blade-Runner-2049-Color-Palette.jpg");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avOne = await loadAndRoundImage(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    const avTwo = await loadAndRoundImage(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

    ctx.drawImage(avOne, 340, 30, 60, 60);
    ctx.drawImage(avTwo, 180, 70, 50, 50);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${mentionName}, ${pickupLine}`, 30, 280);

    const imagePath = __dirname + `/cache/rizz_${two}.png`;
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    await new Promise((resolve, reject) => {
      out.on('finish', resolve);
      out.on('error', reject);
    });

    return imagePath;
  } catch (error) {
    throw error;
  }
}

async function loadAndRoundImage(url) {
  try {
    const avatar = await jimp.read(url);
    avatar.circle();
    const buffer = await avatar.getBufferAsync(jimp.MIME_PNG);
    return await loadImage(buffer);
  } catch (e) {
    // Fallback if avatar fails to load
    const placeholder = createCanvas(100, 100);
    return placeholder;
  }
}

async function fetchPickupLine() {
  try {
    const response = await axios.get('https://vinuxd.vercel.app/api/pickup');
    return response.data.pickup;
  } catch (error) {
    return "Are you a keyboard? Because you're just my type.";
  }
}
