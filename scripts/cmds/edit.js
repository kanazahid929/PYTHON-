const axios = require('axios');
const fs = require('fs-extra'); 
const path = require('path');

const API_ENDPOINT = "https://dev.oculux.xyz/api/gptimage"; 
const SEED_FLAG = "--seed";
const WIDTH_FLAG = "--width";
const HEIGHT_FLAG = "--height";

module.exports = {
  config: {
    name: "edit",
    aliases: ["e","edt"],
    version: "1.2", 
    author: "SiFu ゐ",
    countDown: 20,
    role: 0,
    longDescription: "Generate or edit an image using AI. Reply to an image to edit it.",
    category: "ai-image",
    guide: {
      en: 
        "{pn} <prompt> [--seed <number>] [--width <px>] [--height <px>]\n" +
        "• ɢᴇɴᴇʀᴀᴛᴇ: {pn} a cybernetic forest\n" +
        "• ᴇᴅɪᴛ: Reply to an image with {pn} change hair color to blue\n" +
        "• ᴏᴘᴛɪᴏɴs: {pn} a cat --seed 777 --width 1024"
    }
  },

  onStart: async function({ message, args, event }) {
    let prompt = args.join(" ");
    let refUrl = null;
    let seed = null;
    let width = null;
    let height = null;

    // 1. Detect if replying to an image (Edit Mode)
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const imageAttachment = event.messageReply.attachments.find(att => att.type === 'photo' || att.type === 'image');
      if (imageAttachment && imageAttachment.url) {
        refUrl = imageAttachment.url;
      }
    }

    // 2. Extract Flags
    const extractFlag = (flagName, regex) => {
      const match = prompt.match(regex);
      if (match && match[1]) {
        prompt = prompt.replace(match[0], "").trim();
        return match[1];
      }
      return null;
    };

    const seedValue = extractFlag(SEED_FLAG, new RegExp(`${SEED_FLAG}\\s+([^\\s]+)`, 'i'));
    if (seedValue) {
      if (seedValue.toLowerCase() === 'true') seed = true;
      else if (seedValue.toLowerCase() === 'false') seed = false;
      else if (!isNaN(parseInt(seedValue))) seed = parseInt(seedValue);
    }

    const widthValue = extractFlag(WIDTH_FLAG, new RegExp(`${WIDTH_FLAG}\\s+(\\d+)`, 'i'));
    if (widthValue) width = parseInt(widthValue);

    const heightValue = extractFlag(HEIGHT_FLAG, new RegExp(`${HEIGHT_FLAG}\\s+(\\d+)`, 'i'));
    if (heightValue) height = parseInt(heightValue);

    prompt = prompt.trim();

    // 3. Validation
    if (!prompt) {
        return message.reply("🎀 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴘʀᴏᴍᴘᴛ ᴏʀ ɪɴsᴛʀᴜᴄᴛɪᴏɴ.");
    }
    
    message.reaction("🧪", event.messageID);
    let tempFilePath; 

    try {
      // 4. Build API URL
      let fullApiUrl = `${API_ENDPOINT}?prompt=${encodeURIComponent(prompt)}`;
      
      if (refUrl) fullApiUrl += `&ref=${encodeURIComponent(refUrl)}`;
      if (seed !== null) fullApiUrl += `&seed=${seed}`;
      if (width !== null) fullApiUrl += `&width=${width}`;
      if (height !== null) fullApiUrl += `&height=${height}`;
      
      const response = await axios.get(fullApiUrl, {
          responseType: 'stream',
          timeout: 120000 
      });

      if (response.status !== 200) {
           throw new Error(`ᴀᴘɪ ʀᴇsᴘᴏɴᴅᴇᴅ ᴡɪᴛʜ sᴛᴀᴛᴜs: ${response.status}`);
      }
      
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
          await fs.mkdirp(cacheDir); 
      }
      
      tempFilePath = path.join(cacheDir, `gpt_ai_${Date.now()}.png`);
      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // 5. Success Message
      message.reaction("🎀", event.messageID);
      const msgBody = refUrl 
        ? "✨ ɪᴍᴀɢᴇ sᴜᴄᴄᴇssғᴜʟʟʏ ᴇᴅɪᴛᴇᴅ!" 
        : "✨ ɪᴍᴀɢᴇ sᴜᴄᴄᴇssғᴜʟʟʏ ɢᴇɴᴇʀᴀᴛᴇᴅ!";

      await message.reply({
        body: `『 ${msgBody} 』`,
        attachment: fs.createReadStream(tempFilePath)
      });

    } catch (error) {
      message.reaction("❌", event.messageID);
      console.error("GPT Image Error:", error);

      let errMsg = "ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴘʀᴏᴄᴇssɪɴɢ ʏᴏᴜʀ ɪᴍᴀɢᴇ.";
      if (error.code === 'ETIMEDOUT') {
        errMsg = "ᴛʜᴇ sᴇʀᴠᴇʀ ᴛᴏᴏᴋ ᴛᴏᴏ ʟᴏɴɢ ᴛᴏ ʀᴇsᴘᴏɴᴅ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.";
      }

      message.reply(`❌ ᴇʀʀᴏʀ: ${errMsg}`);
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
          try { await fs.unlink(tempFilePath); } catch(e) {}
      }
    }
  }
};
