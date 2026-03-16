const axios = require("axios");

const sessions = new Map();
const cooldowns = new Map();
const QUIZ_URL = "https://raw.githubusercontent.com/SAIFUL-404-ST/quiz-api/main/quizzes.json";

const fancy = (text) => {
  const map = {
    'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉', 'i': '𝒊', 'j': '𝒋',
    'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑', 'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕',
    'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙', 'y': '𝒚', 'z': '𝒛',
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯', 'I': '𝑰', 'J': '𝑱',
    'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷', 'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻',
    'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿', 'Y': '𝒀', 'Z': '𝒁',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "22.1",
    author: "Saif & Gemini",
    countDown: 5,
    role: 0,
    category: "game",
    description: "𝑺𝑻𝒀𝑳𝑰𝑺𝑯 𝑸𝑼𝑰𝒁 𝑾𝑰𝑻𝑯 𝑨𝑳𝑳 𝑷𝑳𝑨𝒀𝑬𝑹 𝑹𝑨𝑵𝑲𝑰𝑵𝑮 𝑩𝑨𝑩𝒀"
  },

  onStart: async function ({ api, event, usersData, args }) {
    const { threadID, messageID, senderID } = event;
    const now = Date.now();

    let user = await usersData.get(senderID);
    if (!user.data) user.data = {};
    if (!user.data.quizStats) user.data.quizStats = { won: 0, played: 0, dailyUsage: 0, lastDate: "" };

    const today = new Date().toLocaleDateString();
    if (user.data.quizStats.lastDate !== today) {
      user.data.quizStats.dailyUsage = 0;
      user.data.quizStats.lastDate = today;
    }

    if (args[0] === "rank") {
      const allUsers = await usersData.getAll();
      // Filter anyone who has played at least once and sort by wins
      const rankList = allUsers
        .filter(u => u.data && u.data.quizStats && u.data.quizStats.played > 0)
        .sort((a, b) => (b.data.quizStats.won || 0) - (a.data.quizStats.won || 0));

      if (rankList.length === 0) return api.sendMessage(fancy("𝑵𝒐 𝒐𝒏𝒆 𝒉𝒂𝒔 𝒑𝒍𝒂𝒚𝒆𝒅 𝒚𝒆𝒕, 𝑩𝒂𝒃𝒚!"), threadID, messageID);

      let rankMsg = `╭───━━━━🌟━━━━───╮\n      ${fancy("𝑨𝑳𝑳 𝑷𝑳𝑨𝒀𝑬𝑹 𝑹𝑨𝑵𝑲𝑰𝑵𝑮")}\n━━━━━━━━━━━━━━━━━━\n`;
      rankList.forEach((u, i) => {
        rankMsg += ` ${i + 1}. ${fancy(u.name)} — ${fancy(u.data.quizStats.won)} 𝑾𝒊𝒏𝒔\n`;
      });
      rankMsg += `━━━━━━━━━━━━━━━━━━\n   𝑻𝒐𝒕𝒂𝒍 𝑷𝒍𝒂𝒚𝒆𝒓𝒔: ${fancy(rankList.length)}\n╰───━━━━🌟━━━━───╯`;
      return api.sendMessage(rankMsg, threadID, messageID);
    }

    if (user.data.quizStats.dailyUsage >= 20) {
      return api.sendMessage(`⚠️ 𝑳𝒊𝒎𝒊𝒕 𝑹𝒆𝒂𝒄𝒉𝒆𝒅\n━━━━━━━━━━━━━━━━━━\n𝑩𝒂𝒃𝒚, 𝒚𝒐𝒖'𝒗𝒆 𝒖𝒔𝒆𝒅 𝒚𝒐𝒖𝒓 𝟐𝟎 𝒕𝒖𝒓𝒏𝒔 𝒕𝒐𝒅𝒂𝒚. 𝑪𝒐𝒎𝒆 𝒃𝒂𝒄𝒌 𝒕𝒐𝒎𝒐𝒓𝒓𝒐𝒘!`, threadID, messageID);
    }

    if (cooldowns.has(senderID) && now - cooldowns.get(senderID) < 5000) return;
    cooldowns.set(senderID, now);

    try {
      const res = await axios.get(QUIZ_URL);
      const questions = res.data[0].questions;
      const q = questions[Math.floor(Math.random() * questions.length)];

      let optionsMsg = '';
      ['a', 'b', 'c', 'd'].forEach(l => {
        if (q.options[l]) optionsMsg += `  ${fancy(l.toUpperCase())} ❯ ${q.options[l]}\n`;
      });

      const quizContent = `╭───━━━━🌟━━━━───╮\n  ${q.text}\n━━━━━━━━━━━━━━━━━━\n${optionsMsg}╰───━━━━🌟━━━━───╯\n𝑩𝒂𝒃𝒚, 𝒓𝒆𝒑𝒍𝒚 𝒘𝒊𝒕𝒉 𝒕𝒉𝒆 𝒐𝒑𝒕𝒊𝒐𝒏!`;

      api.sendMessage(quizContent, threadID, (err, info) => {
        if (err) return;
        user.data.quizStats.dailyUsage += 1;
        usersData.set(senderID, { data: user.data });

        const timeoutId = setTimeout(() => {
          if (sessions.has(info.messageID)) {
            sessions.delete(info.messageID);
            api.editMessage(`⌛ 𝑻𝒊𝒎𝒆'𝒔 𝑼𝒑 𝑩𝒂𝒃𝒚!\n━━━━━━━━━━━━━━━━━━\n𝑻𝒉𝒆 𝒄𝒐𝒓𝒓𝒆𝒄𝒕 𝒐𝒏𝒆 𝒘𝒂𝒔: ${fancy(q.answer.toUpperCase())}`, info.messageID);
          }
        }, 60000);

        sessions.set(info.messageID, { answer: q.answer.toLowerCase().trim(), author: senderID, timeoutId });
        global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: senderID, sessionId: info.messageID });
      }, messageID);
    } catch (e) { return api.sendMessage(fancy("❌ 𝑭𝒂𝒊𝒍𝒆𝒅 𝒕𝒐 𝒍𝒐𝒂𝒅 𝒒𝒖𝒊𝒛 𝒃𝒂𝒃𝒚."), threadID, messageID); }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { senderID, body, threadID, messageID } = event;
    const session = sessions.get(Reply.sessionId);
    if (!session || senderID !== session.author) return;

    clearTimeout(session.timeoutId);
    sessions.delete(Reply.sessionId);
    try { await api.unsendMessage(event.messageID); } catch(e) {}

    const isCorrect = body.trim().toLowerCase() === session.answer;
    let userData = await usersData.get(senderID);
    let quizStats = userData.data.quizStats;
    quizStats.played += 1;

    let status = "";
    let finalMoney = userData.money || 0;

    if (isCorrect) {
      quizStats.won += 1;
      const reward = 1000;
      finalMoney += reward;
      status = `✨ 𝒀𝒐𝒖'𝒓𝒆 𝑩𝒓𝒊𝒍𝒍𝒊𝒂𝒏𝒕 𝑩𝒂𝒃𝒚! ✨\n━━━━━━━━━━━━━━━━━━\n💰 𝑪𝒐𝒊𝒏𝒔: +${fancy(reward)}\n🏆 𝑻𝒐𝒕𝒂𝒍 𝑾𝒊𝒏𝒔: ${fancy(quizStats.won)}`;
    } else {
      status = `💔 𝑶𝒐𝒑𝒔, 𝑾𝒓𝒐𝒏𝒈 𝑩𝒂𝒃𝒚! 💔\n━━━━━━━━━━━━━━━━━━\n✅ 𝑨𝒏𝒔𝒘𝒆𝒓: ${fancy(session.answer.toUpperCase())}\n🏆 𝑾𝒊𝒏𝒔: ${fancy(quizStats.won)}`;
    }

    await usersData.set(senderID, { 
      money: finalMoney, 
      data: { ...userData.data, quizStats: quizStats } 
    });

    const resultMsg = `╭───━━━━🌟━━━━───╮\n      𝑸𝑼𝑰𝒁 𝑹𝑬𝑺𝑼𝑳𝑻\n━━━━━━━━━━━━━━━━━━\n${status}\n✨ 𝑩𝒂𝒍𝒂𝒏𝒄𝒆: ${fancy(finalMoney.toLocaleString())}\n╰───━━━━🌟━━━━───╯`;
    return api.editMessage(resultMsg, Reply.sessionId);
  }
};
