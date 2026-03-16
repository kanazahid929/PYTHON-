const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const FB_APP_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
const tempDir = path.join(__dirname, "temp");
fs.ensureDirSync(tempDir);

module.exports = {
  config: {
    name: "count",
    aliases: ["msgcount", "mc", "c", "h"],
    version: "9.0",
    author: "Saif / Gemini Fix",
    countDown: 5,
    role: 0,
    category: "box chat",
    description: "Premium message count - Fixed PP & Token"
  },

  onStart: async function({ args, threadsData, message, event, api }) {
    try {
      const { threadID, senderID, mentions, messageReply, type } = event;
      const threadData = await threadsData.get(threadID);
      const members = threadData.members || [];
      const threadInfo = await api.getThreadInfo(threadID);
      const usersInGroup = threadInfo.participantIDs;

      let arraySort = [];
      for (const user of members) {
        if (!usersInGroup.includes(user.userID)) continue;
        arraySort.push({ 
          name: user.name || "Facebook User", 
          count: parseInt(user.count) || 0, 
          uid: user.userID 
        });
      }

      arraySort.sort((a, b) => b.count - a.count);
      arraySort.forEach((item, index) => item.stt = index + 1);

      let targetUsers = [];
      if (args[0]?.toLowerCase() === "all") {
        targetUsers = arraySort.slice(0, 15); 
      } else if (type === "message_reply") {
        const f = arraySort.find(i => i.uid == messageReply.senderID);
        if (f) targetUsers.push(f);
      } else if (Object.keys(mentions).length > 0) {
        for (const id in mentions) {
          const f = arraySort.find(i => i.uid == id);
          if (f) targetUsers.push(f);
        }
      } else {
        const selfUser = arraySort.find(i => i.uid == senderID);
        if (selfUser) targetUsers.push(selfUser);
      }

      if (targetUsers.length === 0) return message.reply("❌ Baby, I couldn't find anyone!");

      const processingMsg = await message.reply("⏳ Drawing your leaderboard, Baby...");

      const filePath = await drawLeaderboard(targetUsers, arraySort.length);
      
      if (processingMsg && processingMsg.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

      await message.reply({
        body: `📊 ${args[0] === "all" ? "Group Leaderboard" : "User Statistics"}`,
        attachment: fs.createReadStream(filePath)
      });
      
      setTimeout(() => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath) }, 15000);
      
    } catch (err) {
      console.error(err);
      return message.reply(`❌ Error: ${err.message}, Baby.`);
    }
  },

  onChat: async function({ threadsData, event, usersData }) {
    const { senderID, threadID } = event;
    if (!senderID || !threadID || senderID == threadID) return;

    const threadData = await threadsData.get(threadID) || {};
    let members = threadData.members || [];
    const index = members.findIndex(u => u.userID == senderID);

    if (index === -1) {
      const name = await usersData.getName(senderID) || "Facebook User";
      members.push({ userID: senderID, name: name, count: 1 });
    } else {
      members[index].count = (parseInt(members[index].count) || 0) + 1;
    }
    await threadsData.set(threadID, members, "members");
  }
};

async function drawLeaderboard(users, total) {
  const itemHeight = 150;
  const width = 800;
  const height = (users.length * itemHeight) + 100;
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0f0f1e";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 45px Arial";
  ctx.textAlign = "center";
  ctx.fillText("MESSAGE RANKING", width / 2, 65);

  ctx.textAlign = "left";
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const y = 100 + (i * itemHeight);

    ctx.fillStyle = "#16213e";
    const r = 15, x = 20, w = width - 40, h = itemHeight - 20;
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 40px Arial";
    ctx.fillText(`#${user.stt}`, 50, y + 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.fillText(user.name.substring(0, 18), 140, y + 65);
    
    ctx.fillStyle = "#00d1ff";
    ctx.font = "28px Arial";
    ctx.fillText(`Messages: ${user.count.toLocaleString()}`, 140, y + 105);

    try {
      // Using your token again Baby!
      const avatarUrl = `https://graph.facebook.com/${user.uid}/picture?width=512&height=512&access_token=${FB_APP_TOKEN}`;
      const res = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 8000 });
      const img = await Canvas.loadImage(Buffer.from(res.data));
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(700, y + 65, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 650, y + 15, 100, 100);
      ctx.restore();
    } catch (e) {
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(700, y + 65, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 45px Arial";
      ctx.textAlign = "center";
      ctx.fillText(user.name.charAt(0).toUpperCase(), 700, y + 80);
      ctx.textAlign = "left";
    }
  }

  const filePath = path.join(tempDir, `board_${Date.now()}.png`);
  fs.writeFileSync(filePath, canvas.toBuffer());
  return filePath;
}
