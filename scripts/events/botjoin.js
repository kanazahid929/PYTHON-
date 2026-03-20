const axios = require("axios");
const { getTime, getStreamFromURL } = global.utils;

const ownerInfo = {
  name: "—͟͞͞𝐓𝐀𝐌𝐈𝐌",
  facebook: "https://facebook.com/its.x.tamim",
  telegram: "@ITSMETAMIM404",
  supportGroup: "https://m.me/j/AbYhrDx5QWRQ54or/?send_source=gc%3Acopy_invite_link_c"
};

module.exports = {
  config: {
    name: "botjoin",
    version: "3.0",
    author: "♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙",
    category: "events"
  },

  langs: {
    en: {
      session1: "𝐆𝐨𝐨𝐝 𝐌𝐨𝐫𝐧𝐢𝐧𝐠 ☕",
      session2: "𝐆𝐨𝐨𝐝 𝐍𝐨𝐨𝐧 ☀️",
      session3: "𝐆𝐨𝐨𝐝 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 🌤️",
      session4: "𝐆𝐨𝐨𝐝 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 🌆",
      session5: "𝐆𝐨𝐨𝐝 𝐍𝐢𝐠𝐡𝐭 🌙"
    }
  },

  onStart: async ({ message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const addedParticipants = event.logMessageData?.addedParticipants || [];
    const botID = String(api.getCurrentUserID());
    const { nickNameBot } = global.GoatBot.config;

    const isBotAdded = addedParticipants.some(u => String(u.userFbId) === botID);
    if (!isBotAdded) return;

    const prefix = global.utils.getPrefix(threadID);

    if (nickNameBot) {
      await api.changeNickname(nickNameBot, threadID, botID).catch(() => {});
    }

    const threadInfo = await api.getThreadInfo(threadID).catch(() => null);
    if (!threadInfo) return;

    const hours = parseInt(getTime("HH"));
    const session =
      hours <= 10 ? getLang("session1") :
      hours <= 12 ? getLang("session2") :
      hours <= 18 ? getLang("session3") :
      hours <= 20 ? getLang("session4") :
      getLang("session5");

    const botJoinMedia = await getStreamFromURL("https://files.catbox.moe/78mgm1.mp4").catch(() => null);

    return message.send({
      body:
`⌈—❖ ${B("𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃")} ❖—⌋
————————————————————
  ┈➤ ${B("𝐆𝐫𝐞𝐞𝐭𝐢𝐧𝐠")} : 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐀𝐥𝐚𝐢𝐤𝐮𝐦
  ┈➤ ${B("𝐒𝐞𝐬𝐬𝐢𝐨𝐧")}  : ${session}
  ┈➤ ${B("𝐆𝐫𝐨𝐮𝐩")}    : ${threadInfo.threadName}
  ┈➤ ${B("𝐌𝐞𝐦𝐛𝐞𝐫𝐬")}  : ${threadInfo.participantIDs.length}
————————————————————
  ┈➤ ${B("𝐏𝐫𝐞𝐟𝐢𝐱")}   : [ ${prefix} ]
  ┈➤ ${B("𝐂𝐨𝐦𝐦𝐚𝐧𝐝")} : ${prefix}help
————————————————————
  ┈➤ ${B("𝐎𝐰𝐧𝐞𝐫")}    : ${ownerInfo.name}
  ┈➤ ${B("𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤")} : ${ownerInfo.facebook}
  ┈➤ ${B("𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦")} : ${ownerInfo.telegram}
  ┈➤ ${B("𝐒𝐮𝐩𝐩𝐨𝐫𝐭")}  : ${ownerInfo.supportGroup}
————————————————————
⌊—✧ ${B("𝐓𝐇𝐀𝐍𝐊𝐒 𝐅𝐎𝐑 𝐀𝐃𝐃𝐈𝐍𝐆")} ✧—⌋`,
      attachment: botJoinMedia ? [botJoinMedia] : []
    });
  }
};

function B(text) {
  const m = {
    a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠",
    h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧",
    o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮",
    v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
    A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆",
    H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍",
    O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔",
    V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
    0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒",
    5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗"
  };
  return String(text).split("").map(c => m[c] || c).join("");
}
