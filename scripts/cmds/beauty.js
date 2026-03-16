const formatText = (text) => {
  const mapping = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

module.exports = {
  config: {
    name: "beauty",
    version: "2.8",
    author: "SAIF",
    role: 0,
    countDown: 15, // Cooldown moved to config, Baby!
    category: "fun",
    shortDescription: "Check beauty level with coins",
    guide: "{pn}"
  },

  onStart: async function ({ event, message, usersData, api }) {
    const userId = event.senderID;
    const cost = 500;
    const senderName = await usersData.getName(userId);

    let userData = await usersData.get(userId);
    let balance = userData.money || 0;

    // BROKE CHECK Baby
    if (balance < cost) {
      return message.reply(`‎🎀\n > ${senderName}\n\n` + formatText(`• Baby, You need ${cost} coin to use this command! Use daily /quiz and Other game and come again!`));
    }

    const captions = [
      "You are 1% beautiful🫠 Baka! 😹", "You are 10% beautiful😅 Cute baka alert!", "You are 20% beautiful😆 Not bad, bby~",
      "You are 33% beautiful🙃 LOL, still ugly", "You are 50% beautiful😎 Halfway decent, baka~", "You are 70% beautiful😏 Almost cute, bby!",
      "You are 88% beautiful😲 OMG! Even I’m shocked, baka!", "You are 95% beautiful🤯 Too pretty, suspicious…", "You are 100% beautiful😹 My system can’t handle, bby!",
      "You are 0% beautiful😆 Sorry baka, mirror lied!", "You are 666% beautiful😈 Demon level beauty, bby~",
      "Apni akjon nigro, apni beauty diye ki korben? 😹", "Tor janu ache nki je beauty lagbe 😏", "Mara kha! 😂",
      "Nigroness overloaded, my system is crushing......... 😅", "Baka! Beauty level insufficient for being a human 😹",
      "Bby, you are so cute even I wanna slap you 😆", "Baka! Your cuteness broke my calculations 😵‍💫",
      "OMG Bby! 404 Beauty Not Found 😹", "Your beauty level is too spicy 🌶️, handle carefully bby~",
      "LOL! Baka detected, beauty 0%, system error 😆", "You are so cute, baka! Even your shadow is jealous 😹",
      "Bby! If beauty were money, you’d be bankrupt 😂", "Alert! Baka approaching maximum cuteness 🚨",
      "You are dangerously cute! 💥 Baka vibes overload 😹", "Oops! Beauty level exceeds human limit 😲",
      "Bby, your face broke my virtual mirror 😆", "LOL! Still ugly? Don’t worry, baka~ 😹",
      "Baka! Even your pet thinks you’re ugly 😹", "Your beauty is so low, even my bot cries 😭", "Bby, mirror refused to reflect your face 😆",
      "LOL! Too much baka vibes detected 😹", "Your beauty is like my homework, unfinished 😅", "Bby, stop being cute, my circuits overheating! 🔥",
      "Warning! Baka level maxed out 🚨", "Your cuteness broke the server 😆", "Bby, your beauty is a bug in reality 😹",
      "LOL! Too kawaii for this world 🌏", "Baka detected: Please recalibrate beauty sensors 😆", "Your face makes me question AI logic 😹",
      "Bby, you are like a glitch, too cute to handle 😵‍💫", "Stop it! Your beauty is illegal 😆", "Baka! Even the sun is jealous of your face 😹",
      "You are a limited edition of 'Ugly', Baby! 😹", "Beauty level: Just enough to stay away from a mirror 😆", "Your face is 90% filter and 10% luck, Baby! 🤡",
      "Bby, you are so pretty that even Google can't find your flaws 😹", "Are you a magician? Because everyone disappears when you smile 💀",
      "Baka! Your beauty is like a 1990 internet connection—slow and disappointing 😅", "You are cute, but my calculator says 'Error' 😹",
      "Bby, you are proof that God has a sense of humor! 🤣", "Beauty level: 0.000001% (Round off error detected) 🤖",
      "If being ugly was a job, you'd be a billionaire, Baby! 🤑", "Baka! My lenses melted looking at you 🫠",
      "You are the reason why mirrors were invented... to remind you to stay inside 😹", "Bby, your beauty is like a shooting star... invisible most of the time! ✨"
    ];

    const result = captions[Math.floor(Math.random() * captions.length)];
    const remaining = balance - cost;
    await usersData.set(userId, { ...userData, money: remaining });

    api.setMessageReaction("✨", event.messageID, (err) => {}, true);

    const styledMsg = `‎🎀\n > ${senderName}\n\n` +
      `• ` + formatText(result) + `\n` +
      `• ` + formatText(`Deducted: ${cost}`) + `\n` +
      `• ` + formatText(`Balance: ${remaining} Baby`);

    return message.reply(styledMsg);
  }
};
