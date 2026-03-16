/**
 * Full listgroup command for Mikasa Bot / Goat Bot v2
 * Features:
 * - Fancy Sherif Bold Italic text
 * - Reply + editMessage system
 * - Multiple leave support
 * - Single file (fonts mapping included)
 */

module.exports = {
  config: {
    name: "listgroup",
    aliases: ["lgroups", "lg"],
    version: "5.1",
    author: "Saif",
    countDown: 5,
    role: 2,
    shortDescription: "Show bot groups and leave",
    longDescription: "Shows groups where the bot is currently a member. Reply with index numbers to leave.",
    category: "owner",
    guide: "{p}listgroup"
  },

  // ---------------------------
  // FONT MAPPING FUNCTION
  // ---------------------------
  fonts: {
    title: (text) => {
      const map = {
        "A": "𝑨","B": "𝑩","C": "𝑪","D": "𝑫","E": "𝑬","F": "𝑭","G": "𝑮",
        "H": "𝑯","I": "𝑰","J": "𝑱","K": "𝑲","L": "𝑳","M": "𝑴","N": "𝑵",
        "O": "𝑶","P": "𝑷","Q": "𝑸","R": "𝑹","S": "𝑺","T": "𝑻","U": "𝑼",
        "V": "𝑽","W": "𝑾","X": "𝑿","Y": "𝒀","Z": "𝒁",
        "a": "𝒂","b": "𝒃","c": "𝒄","d": "𝒅","e": "𝒆","f": "𝒇","g": "𝒈",
        "h": "𝒉","i": "𝒊","j": "𝒋","k": "𝒌","l": "𝒍","m": "𝒎","n": "𝒏",
        "o": "𝒐","p": "𝒑","q": "𝒒","r": "𝒓","s": "𝒔","t": "𝒕","u": "𝒖",
        "v": "𝒗","w": "𝒘","x": "𝒙","y": "𝒚","z": "𝒛",
        "0": "0","1": "1","2": "2","3": "3","4": "4","5": "5","6": "6",
        "7": "7","8": "8","9": "9",
        " ": " ",".": ".","!": "!","?": "?","'": "'","-": "-",
        ",": ",",":": ":","/": "/","\\": "\\","+":"+" 
      };
      return text.split("").map(c => map[c] || c).join("");
    }
  },

  // ---------------------------
  // ON START
  // ---------------------------
  onStart: async function({ api, event }) {
    try {
      const botID = api.getCurrentUserID();
      const threadList = await api.getThreadList(200, null, ["INBOX"]);

      const activeGroups = threadList.filter(t =>
        t.isGroup && Array.isArray(t.participantIDs) && t.participantIDs.includes(botID)
      );

      if (!activeGroups.length)
        return api.sendMessage(
          this.fonts.title("❌ I'm not currently in any groups."),
          event.threadID,
          event.messageID
        );

      let msg = this.fonts.title("📋 ACTIVE BOT GROUPS\n\n");
      activeGroups.forEach((g, i) => {
        msg += `${i + 1}. ${this.fonts.title(g.name || "Unnamed Group")}\n`;
      });

      msg += this.fonts.title(
        "\n↩️ Reply with index number(s) (e.g., 1 3 5) to leave those group(s)"
      );

      api.sendMessage(
        msg,
        event.threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            groups: activeGroups,
            editMsgID: info.messageID
          });
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        this.fonts.title("❌ Failed to load group list."),
        event.threadID,
        event.messageID
      );
    }
  },

  // ---------------------------
  // ON REPLY
  // ---------------------------
  onReply: async function({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const indexes = event.body
      .trim()
      .split(/\s+/)
      .map(n => parseInt(n) - 1)
      .filter(n => !isNaN(n));

    if (!indexes.length)
      return api.sendMessage(
        this.fonts.title("❌ Invalid index."),
        event.threadID,
        event.messageID
      );

    let results = [];
    for (const i of indexes) {
      const g = Reply.groups[i];
      if (!g) {
        results.push(this.fonts.title(`❌ Invalid index: ${i + 1}`));
        continue;
      }
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), g.threadID);
        results.push(this.fonts.title(`✅ Left: ${g.name}`));
      } catch {
        results.push(this.fonts.title(`❌ Failed: ${g.name}`));
      }
    }

    api.editMessage(
      this.fonts.title("📤 LEAVE RESULT\n\n") + results.join("\n"),
      Reply.editMsgID
    );
  }
};
