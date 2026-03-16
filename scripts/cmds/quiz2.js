const axios = require("axios");

const sessions = new Map();
const QUIZ_API_URL = "https://saif-quiz.onrender.com/api/quiz";

const fancy = (text) => {
  const map = {
    'a': '𝗔', 'b': '𝗕', 'c': '𝗖', 'd': '𝗗', 'e': '𝗘', 'f': '𝗙', 'g': '𝗚', 'h': '𝗛', 'i': '𝗜', 'j': '𝗝',
    'k': '𝗞', 'l': '𝗟', 'm': '𝗠', 'n': '𝗡', 'o': '𝗢', 'p': '𝗣', 'q': '𝗤', 'r': '𝗥', 's': '𝗦', 't': '𝗧',
    'u': '𝗨', 'v': '𝗩', 'w': '𝗪', 'x': '𝗫', 'y': '𝗬', 'z': '𝗭',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

module.exports = {
  config: {
    name: "quiz2",
    aliases: ["qz2"],
    version: "33.0",
    author: "Saif",
    countDown: 10,
    role: 0,
    category: "game",
    description: "𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝑸𝒖𝒊𝒛 𝑾𝒊𝒕𝒉 𝑷𝒓𝒐𝒕𝒆𝒄𝒕𝒊𝒐𝒏"
  },

  onStart: async function ({ api, event, usersData, args }) {
    const { threadID, messageID, senderID } = event;

    let user = await usersData.get(senderID);
    if (!user.data) user.data = {};
    if (!user.data.quiz2Stats) user.data.quiz2Stats = { won: 0, played: 0, exp: 0, dailyUsage: 0, lastDate: "" };

    const today = new Date().toLocaleDateString();
    if (user.data.quiz2Stats.lastDate !== today) {
      user.data.quiz2Stats.dailyUsage = 0;
      user.data.quiz2Stats.lastDate = today;
    }

    if (user.data.quiz2Stats.dailyUsage >= 20 && args[0] !== "stats" && args[0] !== "rank") {
      return api.sendMessage(`⚠️ 𝑳𝒊𝒎𝒊𝒕 𝑬𝒙𝒉𝒂𝒖𝒔𝒕𝒆𝒅\n━━━━━━━━━━━━━━━━━━\n𝑩𝒂𝒃𝒚, 𝒚𝒐𝒖'𝒗𝒆 𝒇𝒊𝒏𝒊𝒔𝒉𝒆𝒅 𝒚𝒐𝒖𝒓 𝟐𝟎 𝒕𝒖𝒓𝒏𝒔 𝒇𝒐𝒓 𝒕𝒐𝒅𝒂𝒚!`, threadID, messageID);
    }

    if (args[0] === "rank") {
      const allUsers = await usersData.getAll();
      const rankList = allUsers
        .filter(u => u.data && u.data.quiz2Stats)
        .sort((a, b) => (b.data.quiz2Stats.won || 0) - (a.data.quiz2Stats.won || 0))
        .slice(0, 10);

      let rankMsg = `🏆 𝑸𝑼𝑰𝒁 𝑳𝑬𝑨𝑫𝑬𝑹𝑩𝑶𝑨𝑹𝑫\n━━━━━━━━━━━━━━━━━━\n`;
      rankList.forEach((u, i) => {
        rankMsg += ` ${i + 1}. ${u.name} — ${fancy(u.data.quiz2Stats.won)}\n`;
      });
      return api.sendMessage(rankMsg, threadID, messageID);
    }

    if (args[0] === "stats") {
      const s = user.data.quiz2Stats;
      const statsMsg = `👤 𝑷𝑳𝑨𝒀𝑬𝑹 𝑰𝑵𝑭𝑶\n━━━━━━━━━━━━━━━━━━\n𝑵𝒂𝒎𝒆: ${user.name}\n𝑾𝒊𝒏𝒔: ${fancy(s.won)}\n𝑷𝒍𝒂𝒚𝒆𝒅: ${fancy(s.played)}\n𝑬𝑿𝑷: ${fancy(s.exp || 0)}\n𝑼𝒔𝒂𝒈𝒆: ${fancy(s.dailyUsage)}/𝟐𝟎\n━━━━━━━━━━━━━━━━━━`;
      return api.sendMessage(statsMsg, threadID, messageID);
    }

    try {
      const res = await axios.get(QUIZ_API_URL);
      const questions = res.data[0].questions;
      const q = questions[Math.floor(Math.random() * questions.length)];

      let optionsMsg = '';
      ['a', 'b', 'c', 'd'].forEach(l => {
        if (q.options[l]) optionsMsg += `  ${fancy(l.toUpperCase())} ❯ ${q.options[l]}\n`;
      });

      const quizContent = `╭───━━━━🌟━━━━───╮\n  ${q.text}\n━━━━━━━━━━━━━━━━━━\n${optionsMsg}╰───━━━━🌟━━━━───╯\n𝑩𝒂𝒃𝒚, 𝒓𝒆𝒑𝒍𝒚 𝒘𝒊𝒕𝒉 𝒕𝒉𝒆 𝒄𝒐𝒓𝒓𝒆𝒄𝒕 𝒐𝒑𝒕𝒊𝒐𝒏!`;

      api.sendMessage(quizContent, threadID, (err, info) => {
        if (err) return;
        user.data.quiz2Stats.dailyUsage += 1;
        usersData.set(senderID, { data: user.data });

        const timeoutId = setTimeout(() => {
          if (sessions.has(info.messageID)) {
            sessions.delete(info.messageID);
            api.editMessage(`⌛ 𝑻𝒊𝒎𝒆'𝒔 𝑼𝒑 𝑩𝒂𝒃𝒚!\n━━━━━━━━━━━━━━━━━━\n𝑻𝒉𝒆 𝒄𝒐𝒓𝒓𝒆𝒄𝒕 𝒐𝒏𝒆 𝒘𝒂𝒔: ${fancy(q.answer.toUpperCase())}`, info.messageID);
          }
        }, 60000);

        sessions.set(info.messageID, { answer: q.answer, author: senderID, timeoutId });
        global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: senderID, sessionId: info.messageID });
      }, messageID);
    } catch (e) { return api.sendMessage("❌ 𝑬𝒓𝒓𝒐𝒓 𝒍𝒐𝒂𝒅𝒊𝒏𝒈 𝒒𝒖𝒆𝒔𝒕𝒊𝒐𝒏, 𝑩𝒂𝒃𝒚!", threadID, messageID); }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { senderID, body, threadID, messageID } = event;
    const session = sessions.get(Reply.sessionId);
    if (!session) return;

    // Baby, check if the person replying is the actual player
    if (senderID !== session.author) {
      return api.sendMessage(`🐸 𝑵𝒐𝒕 𝒚𝒐𝒖𝒓 𝒒𝒖𝒊𝒛 𝑩𝒂𝒃𝒚! 𝑷𝒍𝒆𝒂𝒔𝒆 𝒔𝒕𝒂𝒓𝒕 𝒚𝒐𝒖𝒓 𝒐𝒘𝒏.`, threadID, messageID);
    }

    clearTimeout(session.timeoutId);
    sessions.delete(Reply.sessionId);
    try { await api.unsendMessage(messageID); } catch(e) {}

    const isCorrect = body.trim().toLowerCase() === session.answer.toLowerCase();
    
    let userData = await usersData.get(senderID);
    let quizStats = userData.data.quiz2Stats || { won: 0, played: 0, exp: 0, dailyUsage: 0 };
    quizStats.played += 1;

    let status = "";
    if (isCorrect) {
      quizStats.won += 1;
      const expGain = 143;
      const coinGain = 1000;
      quizStats.exp = (quizStats.exp || 0) + expGain;
      
      await usersData.set(senderID, { 
        money: (userData.money || 0) + coinGain, 
        data: { ...userData.data, quiz2Stats: quizStats } 
      });

      status = `✨ 𝒀𝒐𝒖'𝒓𝒆 𝑩𝒓𝒊𝒍𝒍𝒊𝒂𝒏𝒕 𝑩𝒂𝒃𝒚! ✨\n━━━━━━━━━━━━━━━━━━\n💰 𝑪𝒐𝒊𝒏𝒔: +${fancy(coinGain)}\n🔥 𝑬𝑿𝑷: +${fancy(expGain)}\n🏆 𝑻𝒐𝒕𝒂𝒍 𝑾𝒊𝒏𝒔: ${fancy(quizStats.won)}`;
    } else {
      await usersData.set(senderID, { 
        data: { ...userData.data, quiz2Stats: quizStats } 
      });
      status = `💔 𝑶𝒐𝒑𝒔, 𝑾𝒓𝒐𝒏𝒈 𝑩𝒂𝒃𝒚! 💔\n━━━━━━━━━━━━━━━━━━\n✅ 𝑨𝒏𝒔𝒘𝒆𝒓: ${fancy(session.answer.toUpperCase())}\n🏆 𝑾𝒊𝒏𝒔: ${fancy(quizStats.won)}\n𝑩𝒆𝒕𝒕𝒆𝒓 𝒍𝒖𝒄𝒌 𝒏𝒆𝒙𝒕 𝒕𝒊𝒎𝒆!`;
    }

    const resultMsg = `╭───━━━━🌟━━━━───╮\n      𝑸𝑼𝑰𝒁 𝑹𝑬𝑺𝑼𝑳𝑻\n━━━━━━━━━━━━━━━━━━\n${status}\n╰───━━━━🌟━━━━───╯`;
    return api.editMessage(resultMsg, Reply.sessionId);
  }
};
