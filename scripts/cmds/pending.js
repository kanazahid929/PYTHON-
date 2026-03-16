const fs = require("fs");

// Math Bold Italic Font Mapping
const formatText = (text) => {
  const map = {
    'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉', 'i': '𝒊', 'j': '𝒋',
    'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑', 'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕',
    'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙', 'y': '𝒚', 'z': '𝒛',
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯', 'I': '𝑰', 'J': '𝑱',
    'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷', 'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻',
    'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿', 'Y': '𝒀', 'Z': '𝒁',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
    '!': '!', '?': '?', '.': '.', ',': ',', ':': ':', ';': ';', '-': '-', '_': '_', '(': '(', ')': ')',
    '[': '[', ']': ']', '{': '{', '}': '}', '<': '<', '>': '>', '/': '/', '\\': '\\', '|': '|', '@': '@',
    '#': '#', '$': '$', '%': '%', '^': '^', '&': '&', '*': '*', '+': '+', '=': '=', '~': '~', '`': '`',
    '"': '"', "'": "'", ' ': ' '
  };
  
  return text.split('').map(char => map[char] || char).join('');
};

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pend", "pe"],
    version: "2.2",
    author: formatText("♡ SAIF ♡"),
    countDown: 5,
    role: 1,
    shortDescription: formatText("Handle pending requests"),
    longDescription: formatText("Approve or reject pending users/groups"),
    category: "utility"
  },

  onReply: async function ({ message, api, event, Reply }) {
    const { author, pending, messageID } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const { body, threadID } = event;

    if (body.trim().toLowerCase() === "c") {
      try {
        await api.unsendMessage(messageID);
        await api.sendMessage(formatText("❌ Operation cancelled! 🐇"), threadID);
      } catch {
        return;
      }
      return;
    }

    const indexes = body.split(/\s+/).map(Number);

    if (isNaN(indexes[0])) {
      try {
        await api.editMessage(
          formatText("⚠ Invalid input! Try again 🦋"),
          messageID
        );
      } catch {
        await api.sendMessage(formatText("⚠ Invalid input! Try again 🦋"), threadID);
      }
      return;
    }

    let count = 0;
    let processingMsg = formatText("⏳ Processing your request... 🐇");

    try {
      // Edit original message to show processing
      await api.editMessage(processingMsg, messageID);
    } catch {
      // If edit fails, send new message
      processingMsg = await api.sendMessage(processingMsg, threadID);
    }

    for (const idx of indexes) {
      if (idx <= 0 || idx > pending.length) continue;
      const group = pending[idx - 1];

      try {
        await api.sendMessage(
          formatText("✅ Group approved by Senpai! 🐇💌\n✨ Enjoy your new adventure! 🦄"),
          group.threadID
        );

        await api.changeNickname(
          formatText(`${global.GoatBot.config.nickNameBot || "🦋SAIF✨"}`),
          group.threadID,
          api.getCurrentUserID()
        );

        count++;
      } catch {
        count++;
      }
    }

    for (const idx of indexes.sort((a, b) => b - a)) {
      if (idx > 0 && idx <= pending.length) {
        pending.splice(idx - 1, 1);
      }
    }

    // Edit the processing message with result
    const resultMsg = formatText(`🎉 Successfully approved ${count} group(s)/user(s)! 🐇💖`);
    try {
      await api.editMessage(resultMsg, messageID);
    } catch {
      await api.sendMessage(resultMsg, threadID);
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID } = event;
    const adminBot = global.GoatBot.config.adminBot;

    if (!adminBot.includes(event.senderID)) {
      return api.sendMessage(formatText("⚠ No permission baka! 🐇"), threadID, messageID);
    }

    try {
      const spam = (await api.getThreadList(100, null, ["OTHER"])) || [];
      const pending = (await api.getThreadList(100, null, ["PENDING"])) || [];
      const allList = [...spam, ...pending];

      if (allList.length === 0) {
        return api.sendMessage(
          formatText("📭 PENDING LIST\n\n") +
          formatText("No pending requests found! 🥹\n") +
          formatText("Everything is clean! 🎀"),
          threadID, messageID
        );
      }

      let msg = formatText("📭 PENDING LIST\n\n");
      let index = 1;
      
      for (const single of allList) {
        const name = single.name || (await usersData.getName(single.threadID)) || formatText("Unknown");
        const type = single.isGroup ? formatText("👥 Group") : formatText("👤 User");
        msg += formatText(`[${index}] ${type} - ${name}\n`);
        index++;
      }

      msg += formatText(`\n🎀 Total: ${allList.length} pending\n`);
      msg += formatText(`✨ Reply with number(s) to approve 🐇\n`);
      msg += formatText(`❌ Reply "c" to cancel, senpai 💌`);

      const sentMsg = await api.sendMessage(
        msg,
        threadID,
        (error, info) => {
          if (error) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            pending: allList,
          });
        },
        messageID
      );

      // যদি API-তে editMessage সুপোর্ট করে
      setTimeout(async () => {
        try {
          // Update message with some animation or status
          const updatedMsg = msg + formatText(`\n\n🕐 Last updated: Just now`);
          await api.editMessage(updatedMsg, sentMsg.messageID);
        } catch (error) {
          console.error("Failed to edit message:", error);
        }
      }, 1000);

    } catch (error) {
      console.error("Pending Error:", error);
      return api.sendMessage(
        formatText("❌ ERROR\n\n") +
        formatText("Failed to retrieve pending list!\n") +
        formatText("Please try again later."), 
        threadID, 
        messageID
      );
    }
  },
};
