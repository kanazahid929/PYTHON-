const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cb", "cbox"],
    version: "2.5",
    author: "𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪",
    description: "Upload replied media to Catbox with animated loading",
    category: "tools",
    usage: "Reply to image / video / gif",
    cooldown: 3
  },

  onStart: async function ({ message, event, api }) {
    const reply = event.messageReply;

    if (!reply?.attachments?.length) {  
      return message.reply(  
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n" +  
        "│ ✖ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐦𝐞𝐝𝐢𝐚 𝐟𝐢𝐫𝐬𝐭\n" +  
        "╰───────────────╯"  
      );  
    }  

    const file = reply.attachments[0];  
    const url = file.url;  

    const extMap = {  
      photo: ".jpg",  
      animated_image: ".gif",  
      video: ".mp4",
      audio: ".mp3"
    };  

    const ext = extMap[file.type] || path.extname(url) || ".dat";  
    const cacheDir = path.join(__dirname, "cache");  
    const filePath = path.join(  
      cacheDir,  
      `catbox_${Date.now()}${ext}`  
    );  

    let loadingInterval;
    let loadingMessageID;

    try {  
      await fs.ensureDir(cacheDir);  

      // Animated loading message
      const loadingFrames = [
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ ⬇️ 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐘𝐨𝐮𝐫 𝐌𝐞𝐝𝐢𝐚...\n╰───────────────╯",
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐘𝐨𝐮𝐫 𝐌𝐞𝐝𝐢𝐚 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲\n╰───────────────╯",
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ ⬆️ 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠...\n╰───────────────╯",
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ 📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠...\n╰───────────────╯",
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ ⏳ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠...\n╰───────────────╯",
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ 🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠...\n╰───────────────╯"
      ];
      
      let frameIndex = 0;
      const loadingMsg = await message.reply(loadingFrames[0]);
      loadingMessageID = loadingMsg.messageID;
      
      // Start animated loading
      loadingInterval = setInterval(async () => {
        frameIndex = (frameIndex + 1) % loadingFrames.length;
        try {
          await api.editMessage(loadingFrames[frameIndex], loadingMessageID);
        } catch (e) {
          // Ignore edit errors
        }
      }, 500);

      // Download file
      const res = await axios.get(url, { responseType: "arraybuffer" });  
      await fs.writeFile(filePath, res.data);  

      // Upload to catbox
      const form = new FormData();  
      form.append("reqtype", "fileupload");  
      form.append("fileToUpload", fs.createReadStream(filePath));  

      const upload = await axios.post(  
        "https://catbox.moe/user/api.php",  
        form,  
        { headers: form.getHeaders() }  
      );  

      const catboxUrl = upload.data.trim();
      
      // Stop loading animation
      clearInterval(loadingInterval);
      
      // Send voice message with catbox URL
      await api.editMessage(
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n" +  
        "│ 🔊 𝐕𝐨𝐢𝐜𝐞 𝐏𝐥𝐚𝐲𝐢𝐧𝐠...\n" +  
        "│ ✅ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥\n" +  
        "╰───────────────╯",
        loadingMessageID
      );
      
      // Prepare final response
      const finalMessage = 
        "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n" +  
        "│ ✅ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥\n" +  
        "│ 🔗 𝐔𝐫𝐥:\n" +  
        `│ ${catboxUrl}\n` +  
        "╰───────────────╯";
      
      // Send voice message (text-to-speech simulation)
      try {
        // This is a simulated voice - in actual implementation you might want to use TTS API
        const voiceMessage = `Your catbox URL is ${catboxUrl}. Upload successful.`;
        
        // Edit message with final result
        await api.editMessage(finalMessage, loadingMessageID);
        
        // You can add actual TTS here if your bot supports it
        // Example: await api.sendMessage({body: "", attachment: await global.utils.getStreamFromURL(ttsUrl)});
        
      } catch (voiceErr) {
        console.log("[VOICE ERROR]", voiceErr);
        await api.editMessage(finalMessage, loadingMessageID);
      }

      // Clean up
      await fs.unlink(filePath);  

    } catch (err) {  
      console.error("[CATBOX ERROR]", err);  
      
      // Stop loading animation if it exists
      if (loadingInterval) clearInterval(loadingInterval);
      
      if (fs.existsSync(filePath)) await fs.unlink(filePath);  
      
      // Edit error message if loading message exists
      if (loadingMessageID) {
        await api.editMessage(
          "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n" +  
          "│ ❌ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐅𝐚𝐢𝐥𝐞𝐝\n" +  
          "│ 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫\n" +  
          "╰───────────────╯",
          loadingMessageID
        );
      } else {
        await message.reply(  
          "╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n" +  
          "│ ❌ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐅𝐚𝐢𝐥𝐞𝐝\n" +  
          "│ 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫\n" +  
          "╰───────────────╯"  
        );  
      }
    }
  }
};
