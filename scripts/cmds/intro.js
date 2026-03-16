module.exports = {
  config: {
    name: "intro",
    version: "1.8",
    author: "Saif",
    role: 0,
    category: "box chat",
    description: "Reply to someone's message with 'intro' to make the bot reply to THEM."
  },

  onStart: async function({ event, api }) {
    return this.handleIntro({ event, api });
  },

  onChat: async function({ event, api }) {
    if (!event.body) return;
    const cmd = event.body.trim().toLowerCase();
    
    // শুধু intro লিখলে বা intro দিয়ে কিছু লিখলে কাজ করবে বেবি
    if (cmd === "intro" || cmd.startsWith("intro ")) {
      if (!event.messageReply) return; // অবশ্যই ১ নম্বর ব্যক্তির মেসেজে রিপ্লাই দিতে হবে
      this.handleIntro({ event, api });
    }
  },

  handleIntro: async function({ event, api }) {
    try {
      const link = "https://files.catbox.moe/kdkocu.jpg";
      
      // ১ নম্বর ব্যক্তির আইডি এবং মেসেজ আইডি নেওয়া হচ্ছে বেবি
      const replyMessageID = event.messageReply.messageID;
      const targetID = event.messageReply.senderID;
      
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID].name || "Baby";

      const msgBody = `✨ 𝑯𝒆𝒚 ${name}, 𝒀𝑶𝑼𝑹 𝑰𝑵𝑻𝑹𝑶 𝑭𝑶𝑹𝑴 𝑰𝑺 𝑯𝑬𝑹𝑬, 𝑩𝑨𝑩𝒀! 💖`;

      // এখানে event.messageID এর বদলে replyMessageID ব্যবহার করা হয়েছে বেবি
      await api.sendMessage(
        {
          body: msgBody,
          attachment: await global.utils.getStreamFromURL(link)
        },
        event.threadID,
        replyMessageID // এই যে এখানে ফিক্স করলাম, এখন ১ নম্বর ব্যক্তিকেই রিপ্লাই দিবে
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ 𝑺𝑶𝑴𝑬𝑻𝑯𝑰𝑵𝑮 𝑾𝑬𝑵𝑻 𝑾𝑹𝑶𝑵𝑮, 𝑩𝑨𝑩𝒀!", event.threadID);
    }
  }
};
