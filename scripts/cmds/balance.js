const axios = require("axios");

function parseAmount(str) {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const map = {
    k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15, qd: 1e18, qi: 1e21, sx: 1e24, sp: 1e27, 
    oc: 1e30, no: 1e33, dc: 1e36, udc: 1e39, ddc: 1e42, tdc: 1e45, qdc: 1e48, qid: 1e51, 
    sxd: 1e54, spd: 1e57, ocd: 1e60, nod: 1e63, vg: 1e66, ntg: 1e93, ct: 1e303
  };
  const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (let key of sortedKeys) {
    if (str.endsWith(key)) {
      let num = parseFloat(str.slice(0, -key.length));
      return isNaN(num) ? NaN : num * map[key];
    }
  }
  return parseFloat(str);
}

function fancy(text) {
  const map = {
    'a': '𝐚','b': '𝐛','c': '𝐜','d': '𝐝','e': '𝐞','f': '𝐟','g': '𝐠','h': '𝐡','i': '𝐢','j': '𝐣','k': '𝐤','l': '𝐥','m': '𝐦','n': '𝐧','o': '𝐨','p': '𝐩','q': '𝐪','r': '𝐫','s': '𝐬','t': '𝐭','u': '𝐮','v': '𝐯','w': '𝐰','x': '𝐱','y': '𝐲','z': '𝐳',
    'A': '𝐀','B': '𝐁','C': '𝐂','D': '𝐃','E': '𝐄','F': '𝐅','G': '𝐆','H': '𝐇','I': '𝐈','J': '𝐉','K': '𝐊','L': '𝐋','M': '𝐌','N': '𝐍','O': '𝐎','P': '𝐏','Q': '𝐐','R': '𝐑','S': '𝐒','T': '𝐓','U': '𝐔','V': '𝐕','W': '𝐖','X': '𝐗','Y': '𝐘','Z': '𝐙',
    '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗', ':': ':', '.': '.', '$': '$', '#': '#'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
}

function formatMoney(amount) {
  if (amount === Infinity) return fancy("Infinity");
  const units = [
    { v: 1e303, s: "𝐂𝐭" }, { v: 1e93, s: "𝐍𝐭𝐠" }, { v: 1e66, s: "𝐕𝐠" },
    { v: 1e36, s: "𝐃𝐜" }, { v: 1e21, s: "𝐐𝐢" }, { v: 1e12, s: "𝐓" },
    { v: 1e9,  s: "𝐁" }, { v: 1e6,  s: "𝐌" }, { v: 1e3,  s: "𝐊" }
  ];
  for (let u of units) {
    if (Math.abs(amount) >= u.v) return fancy((amount / u.v).toFixed(2)) + u.s;
  }
  return fancy(Math.floor(amount).toLocaleString());
}

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "20.0",
    author: "Saif & Gemini",
    countDown: 5,
    role: 0,
    category: "bank",
    description: "𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐁𝐚𝐧𝐤 𝐒𝐲𝐬𝐭𝐞𝐦 𝐁𝐚𝐛𝐲"
  },

  onStart: async function ({ api, usersData, event, args }) {
    const { senderID, threadID, messageID, messageReply, mentions } = event;
    const adminIDs = ["100081317798618"];

    // SMART TARGET LOGIC: Tag > UID in Args > Reply > Self Baby
    let targetID = senderID;
    let amountArgIndex = 1;

    if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
    } else if (args[1] && !isNaN(args[1]) && args[1].length > 10) {
        targetID = args[1]; // Direct UID Baby
        amountArgIndex = 2; // Shift amount index if UID is provided
    } else if (messageReply) {
        targetID = messageReply.senderID;
    } else if (args[0] && !isNaN(args[0]) && args[0].length > 10) {
        targetID = args[0]; // Case for just "bal <uid>" Baby
    }

    const targetData = await usersData.get(targetID);
    if (!targetData) return api.sendMessage(fancy("❌ User not found Baby."), threadID, messageID);

    // ---------------------- ADMIN SYSTEM ----------------------
    if (["add", "set"].includes(args[0]) && adminIDs.includes(senderID)) {
        const amount = parseAmount(args[amountArgIndex] || args[1]);
        if (isNaN(amount)) return api.sendMessage(fancy("❌ Valid amount Baby."), threadID, messageID);
        if (args[0] === "add") targetData.money += amount;
        else targetData.money = amount;
        await usersData.set(targetID, targetData);
        return api.sendMessage(fancy(`✅ ${args[0]}ed $${formatMoney(amount)} to ${targetData.name} Baby.`), threadID, messageID);
    }

    // ---------------------- TRANSFER (t / transfer) ----------------------
    if (["t", "transfer"].includes(args[0])) {
      if (targetID === senderID) return api.sendMessage(fancy("❌ Target a user Baby."), threadID, messageID);
      const senderData = await usersData.get(senderID);
      const amount = parseAmount(args[amountArgIndex] || args[1]);
      if (isNaN(amount) || amount <= 0) return api.sendMessage(fancy("❌ Enter amount Baby."), threadID, messageID);
      if (senderData.money < amount) return api.sendMessage(fancy("⚠️ No money Baby."), threadID, messageID);

      senderData.money -= amount;
      targetData.money += amount;
      await usersData.set(senderID, senderData);
      await usersData.set(targetID, targetData);
      return api.sendMessage(fancy(`✅ Sent $${formatMoney(amount)} to ${targetData.name} Baby.`), threadID, messageID);
    }

    // ---------------------- REQUEST (r / request) ----------------------
    if (["r", "request"].includes(args[0])) {
      if (targetID === senderID) return api.sendMessage(fancy("❌ Target a user Baby."), threadID, messageID);
      const senderData = await usersData.get(senderID);
      return api.sendMessage({
        body: fancy(`🙏 ${senderData.name} is asking for money. ${targetData.name}, reply with amount Baby.`),
        mentions: [{ tag: senderData.name, id: senderID }, { tag: targetData.name, id: targetID }]
      }, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: targetID, 
          requesterID: senderID,
          type: "request_payment"
        });
      }, messageID);
    }

    // ---------------------- BALANCE DISPLAY ----------------------
    const allUsers = await usersData.getAll();
    const sortedUsers = allUsers.filter(u => u.money !== undefined).sort((a, b) => b.money - a.money);
    const globalRank = sortedUsers.findIndex(u => (u.userID || u.id) == targetID) + 1;

    const resultMsg = `🎀\n > ${fancy("𝐇𝐞𝐲")} "${fancy(targetData.name)}" \n• ${fancy("𝐁𝐚𝐥𝐚𝐧𝐜𝐞")} : ${formatMoney(targetData.money)}\n• ${fancy("𝐑𝐚𝐧𝐤")} : ${fancy(globalRank > 0 ? globalRank : "𝐍𝐀")}`;

    return api.sendMessage({ body: resultMsg, mentions: [{ tag: targetData.name, id: targetID }] }, threadID, messageID);
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { senderID, body, threadID, messageID } = event;
    if (Reply.type === "request_payment" && senderID === Reply.author) {
      const amount = parseAmount(body);
      if (isNaN(amount) || amount <= 0) return api.sendMessage(fancy("❌ Invalid Baby."), threadID, messageID);
      const giverData = await usersData.get(senderID);
      const requesterData = await usersData.get(Reply.requesterID);
      if (giverData.money < amount) return api.sendMessage(fancy("⚠️ No funds Baby."), threadID, messageID);

      giverData.money -= amount;
      requesterData.money += amount;
      await usersData.set(senderID, giverData);
      await usersData.set(Reply.requesterID, requesterData);
      return api.sendMessage(fancy(`✅ Sent $${formatMoney(amount)} Baby.`), threadID, messageID);
    }
  }
};
