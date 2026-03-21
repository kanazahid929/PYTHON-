const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

// Configuration section
const expectedAuthor = "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙"; 

module.exports = {
  config: {
    name: "videotogif",
    aliases: ["vtg", "gif"],
    author: "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌⸙", // Don't change this!
    countDown: 10,
    role: 0,
    shortDescription: "Convert video to GIF",
    longDescription: "Convert any video into a high-quality GIF by replying.",
    category: "media",
    guide: "{pn} (reply to a video)"
  },

  onStart: async function ({ message, event }) {
    const { messageReply, threadID, messageID } = event;

    // --- Author Integrity Check ---
    if (this.config.author !== expectedAuthor) {
      return message.reply("⚠️ [ AUTHOR ERROR ]\nModifying the author name is not allowed. This module is locked.");
    }

    try {
      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return message.reply("📸 | Please reply to a video to convert it.");
      }

      const attachment = messageReply.attachments[0];
      if (attachment.type !== "video") {
        return message.reply("❌ | Supported format: Video only.");
      }

      const cacheDir = path.join(__dirname, "cache");
      const videoPath = path.join(cacheDir, `input_${Date.now()}.mp4`);
      const gifPath = path.join(cacheDir, `output_${Date.now()}.gif`);

      await fs.ensureDir(cacheDir);

      const processingMsg = await message.reply("⏳ | Processing your GIF... please wait.");

      // Download Video using Stream
      const response = await axios({
        url: attachment.url,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // FFmpeg Conversion
      ffmpeg(videoPath)
        .outputOptions([
          "-vf fps=12,scale=320:-1:flags=lanczos", // Balanced quality & size
          "-loop 0"
        ])
        .toFormat("gif")
        .on("end", async () => {
          await message.reply({
            body: "✨ | Video converted to GIF successfully!",
            attachment: fs.createReadStream(gifPath)
          });

          // Cleanup cache
          fs.unlinkSync(videoPath);
          fs.unlinkSync(gifPath);
        })
        .on("error", (err) => {
          console.error(err);
          message.reply("❌ | Failed to process video. FFmpeg Error.");
        })
        .save(gifPath);

    } catch (err) {
      console.error(err);
      message.reply("🛠️ | An unexpected error occurred while processing.");
    }
  }
};
