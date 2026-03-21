const { getTime } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "2.1",
    author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
    category: "events"
  },

  langs: {
    en: {
      session1: "🌅 morning",
      session2: "🌞 noon",
      session3: "🌇 afternoon",
      session4: "🌙 evening",
      leaveType1: "left",
      leaveType2: "was kicked from",
      defaultLeaveMessage: "{userNameTag} {type} the group \"{threadName}\" this {session} ⏰ ({time}:00)"
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, author, logMessageData } = event;
    const { leftParticipantFbId } = logMessageData;
    if (leftParticipantFbId === api.getCurrentUserID()) return;

    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.sendLeaveMessage) return;

    const hours = Number(getTime("HH"));
    const session =
      hours <= 10 ? getLang("session1")
        : hours <= 12 ? getLang("session2")
          : hours <= 18 ? getLang("session3")
            : getLang("session4");

    const threadName = threadData.threadName || "this group";
    const userName = await usersData.getName(leftParticipantFbId);
    const leaveType = leftParticipantFbId === author ? getLang("leaveType1") : getLang("leaveType2");

    let leaveMessage = threadData.data.leaveMessage || getLang("defaultLeaveMessage");

    // 🧠 Replace placeholders
    leaveMessage = leaveMessage
      .replace(/\{userName\}/g, userName)
      .replace(/\{userNameTag\}/g, userName)
      .replace(/\{type\}/g, leaveType)
      .replace(/\{threadName\}|\{boxName\}/g, threadName)
      .replace(/\{time\}/g, hours)
      .replace(/\{session\}/g, session);

    const form = {
      body: leaveMessage,
      mentions: leaveMessage.includes(userName)
        ? [{ id: leftParticipantFbId, tag: userName }]
        : []
    };

    // 💬 Send only message (no photo/video)
    return message.send(form);
  }
};
