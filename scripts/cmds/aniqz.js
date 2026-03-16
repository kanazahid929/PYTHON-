const axios = require("axios");

const formatText = (text) => {
  const mapping = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

const saif = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

const sessions = new Map();

module.exports = {
  config: {
    name: "aniqz",
    aliases: ["animequiz", "animeqz"],
    version: "3.2",
    author: "Saif+mahmud api",
    countDown: 10,
    role: 0,
    category: "anime",
    shortDescription: "Anime Quiz Game",
    guide: "{pn} [en/bn] | {pn} rank"
  },

  onStart: async function ({ api, event, usersData, args }) {
    const { threadID, messageID, senderID } = event;
    const name = await usersData.getName(senderID);

    let user = await usersData.get(senderID);
    if (!user.data) user.data = {};
    if (!user.data.aniqzStats) {
      user.data.aniqzStats = { won: 0, played: 0 };
      await usersData.set(senderID, { data: user.data });
    }

    if (args[0] === "rank") {
      const allUsers = await usersData.getAll();
      const rankList = allUsers
        .filter(u => u.data?.aniqzStats)
        .sort((a, b) => (b.data.aniqzStats.won || 0) - (a.data.aniqzStats.won || 0))
        .slice(0, 10);

      if (!rankList.length) return api.sendMessage(formatText("• No ranking data yet, Baby!"), threadID, messageID);

      let msg = `‎🎀\n > ${formatText("𝐀𝐍𝐈𝐐𝐙 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃")}\n\n`;
      rankList.forEach((u, i) => {
        msg += ` ${i + 1}. ${u.name} — ${u.data.aniqzStats.won} wins\n`;
      });
      return api.sendMessage(msg, threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, (err) => {}, true);
      const input = args[0]?.toLowerCase() || "bn";
      const category = input === "en" || input === "english" ? "english" : "bangla";

      const apiUrl = await saif();
      const res = await axios.get(`${apiUrl}/api/aniqz2?category=${category}`);
      const quiz = res.data?.data || res.data;

      const { question, correctAnswer, options } = quiz;

      const quizText = `‎🎀\n > ${name}\n\n` +
        `• ${formatText(question)}\n\n` +
        `𝐀) ${options.a}\n𝐁) ${options.b}\n𝐂) ${options.c}\n𝐃) ${options.d}\n\n` +
        formatText("• Reply with your answer, Baby!");

      api.sendMessage(quizText, threadID, (err, info) => {
        const timeoutId = setTimeout(() => {
          if (sessions.has(info.messageID)) {
            sessions.delete(info.messageID);
            api.editMessage(`‎🎀\n` + formatText(`⌛ Time's up Baby! Correct answer: ${correctAnswer}`), info.messageID);
          }
        }, 60000);

        sessions.set(info.messageID, { author: senderID, answer: correctAnswer.toLowerCase(), timeoutId });
        global.GoatBot.onReply.set(info.messageID, { commandName: "aniqz", messageID: info.messageID });
      }, messageID);

    } catch (e) {
      api.sendMessage(formatText("• API Error, try again Baby!"), threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { senderID, body } = event;
    const session = sessions.get(Reply.messageID);
    if (!session || senderID !== session.author) return;

    clearTimeout(session.timeoutId);
    sessions.delete(Reply.messageID);

    const userReply = body.trim().toLowerCase();
    const isCorrect = userReply === session.answer || userReply === session.answer[0];

    const userData = await usersData.get(senderID);
    const stats = userData.data.aniqzStats;
    const name = await usersData.getName(senderID);
    stats.played += 1;

    if (isCorrect) {
      stats.won += 1;
      const rewardCoins = 1000; // Updated to 1000, Baby!
      const rewardExp = 150;

      await usersData.set(senderID, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: { ...userData.data, aniqzStats: stats }
      });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      return api.editMessage(`‎🎀\n > ${name}\n\n` + formatText(`• Correct Answer Baby!`) + `\n` + formatText(`• Reward: ${rewardCoins} coins`) + `\n` + formatText(`• Total Wins: ${stats.won} Baby`), Reply.messageID);
    } else {
      await usersData.set(senderID, { data: { ...userData.data, aniqzStats: stats } });
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      return api.editMessage(`‎🎀\n > ${name}\n\n` + formatText(`• Wrong Answer Baby!`) + `\n` + formatText(`• Correct: ${session.answer.toUpperCase()}`) + `\n` + formatText(`• Total Wins: ${stats.won} Baby`), Reply.messageID);
    }
  }
};
