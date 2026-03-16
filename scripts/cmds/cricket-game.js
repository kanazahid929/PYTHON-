const axios = require("axios");

const fancy = (text) => {
  const map = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "cricketgame",
    aliases: ["cricket", "cg"],
    version: "3.2",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: "{pn} or {pn} rank"
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { cricketNames, author, messageID } = Reply;
    const REWARD = 1000;

    if (event.senderID !== author) {
      return api.sendMessage(fancy("• This is not your game, Baby! >🐸"), event.threadID, event.messageID);
    }

    const reply = event.body.trim().toLowerCase();
    const isCorrect = cricketNames.some(name => name.toLowerCase() === reply);
    const userData = await usersData.get(event.senderID);
    const senderName = await usersData.getName(event.senderID);

    if (!userData.data) userData.data = {};
    if (!userData.data.cricketStats) userData.data.cricketStats = { won: 0, played: 0 };

    api.unsendMessage(messageID);
    userData.data.cricketStats.played += 1;

    if (isCorrect) {
      userData.data.cricketStats.won += 1;
      const newBalance = (userData.money || 0) + REWARD;
      await usersData.set(event.senderID, { ...userData, money: newBalance });

      return api.sendMessage(
        `‎🎀\n > ${senderName}\n\n` +
        `• ` + fancy(`Correct Answer Baby!`) + `\n` +
        `• ` + fancy(`Reward: +${REWARD} Coins`) + `\n` +
        `• ` + fancy(`Wins: ${userData.data.cricketStats.won}`) + `\n` +
        `• ` + fancy(`Balance: ${newBalance.toLocaleString()} Baby`),
        event.threadID, event.messageID
      );
    } else {
      await usersData.set(event.senderID, { ...userData });
      return api.sendMessage(
        `‎🎀\n > ${senderName}\n\n` +
        `• ` + fancy(`Wrong Answer Baby!`) + `\n` +
        `• ` + fancy(`Answer: ${cricketNames[0]}`) + `\n` +
        `• ` + fancy(`Total Wins: ${userData.data.cricketStats.won}`),
        event.threadID, event.messageID
      );
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    const { threadID, messageID, senderID } = event;
    const senderName = await usersData.getName(senderID);

    if (args[0] === "rank") {
      const allUsers = await usersData.getAll();
      const rankList = allUsers
        .filter(u => u.data && u.data.cricketStats && u.data.cricketStats.played > 0)
        .sort((a, b) => (b.data.cricketStats.won || 0) - (a.data.cricketStats.won || 0));

      if (rankList.length === 0) return api.sendMessage(fancy("• No one has played yet, Baby!"), threadID, messageID);

      let rankMsg = `‎🎀 ${fancy("𝐀𝐋𝐋 𝐏𝐋𝐀𝐘𝐄𝐑 𝐑𝐀𝐍𝐊𝐈𝐍𝐆")} 🎀\n\n`;
      rankList.slice(0, 15).forEach((u, i) => {
        rankMsg += `${i + 1}. ${fancy(u.name)} — ${fancy(u.data.cricketStats.won)} ${fancy("𝐖𝐢𝐧𝐬")}\n`;
      });
      rankMsg += `\n• ` + fancy(`Total Players: ${rankList.length} Baby`);
      return api.sendMessage(rankMsg, threadID, messageID);
    }

    try {
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/cricket`);
      const { name, imgurLink } = response.data.cricket;
      const cricketNames = Array.isArray(name) ? name : [name];

      const imageStream = await axios({
        url: imgurLink,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage(
        {
          body: `‎🎀\n > ${senderName}\n\n` + fancy(`• A famous cricketer has appeared! Guess their name to win 1000 coins, Baby!`),
          attachment: imageStream.data
        },
        threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: senderID,
            cricketNames
          });

          setTimeout(() => { api.unsendMessage(info.messageID); }, 40000);
        },
        messageID
      );
    } catch (error) {
      api.sendMessage(fancy("• API error, try again later Baby!"), threadID, messageID);
    }
  }
};
