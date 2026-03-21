const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  try {
    const base = await axios.get(
      `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
    );
    return base.data.api;
  } catch (error) {
    throw new Error("Failed to fetch API URL");
  }
};

// Bold Serif Font Converter
function boldSerif(text) {
  const boldMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
    'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
    'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶',
    'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿',
    's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
    '!': '❗', '?': '❓', '.': '⋅', ',': '⸴', ':': '꞉', ';': 'ꞏ'
  };
  
  return text.split('').map(char => boldMap[char] || char).join('');
}

module.exports = {
  config: {
    name: "alldl",
    aliases: ["alldown", "dlall", "universal", "videodl"],
    version: "3.0.0",
    author: boldSerif("𓆩𝐂.𝐄.𝐎⸙𝐓𝐀𝐌𝐈𝐌𓆪"),
    countDown: 5,
    role: 0,
    shortDescription: {
      en: boldSerif("📥 Universal Video Downloader")
    },
    longDescription: {
      en: boldSerif("Download videos from TikTok, YouTube, Facebook, Instagram, Twitter, Pinterest and more")
    },
    category: boldSerif("media"),
    guide: {
      en: boldSerif("❏ ${p}alldl <video link>\n❏ Reply to a message with ${p}alldl")
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    
    // Get URL from reply or arguments
    const urlInput = event.messageReply?.body || args[0];
    
    if (!urlInput) {
      return api.sendMessage(
        boldSerif("✨━━━━━━━━『 USAGE 』━━━━━━━━✨\n\n") +
        boldSerif("❍ Please provide a video link.\n\n") +
        boldSerif("▸ Example: /alldl https://youtu.be/xxxx\n") +
        boldSerif("▸ Or reply to a message containing a link\n\n") +
        boldSerif("❍ Supported platforms:\n") +
        boldSerif("  📱 TikTok  |  📺 YouTube\n") +
        boldSerif("  📘 Facebook  |  📸 Instagram\n") +
        boldSerif("  🐦 Twitter  |  📌 Pinterest\n") +
        boldSerif("  🎥 Dailymotion  |  And more...\n\n") +
        boldSerif("✨━━━━━━━━━━━━━━━━━━━━━━━━━━━✨"),
        threadID, 
        messageID
      );
    }

    // Validate URL
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    if (!urlPattern.test(urlInput)) {
      return api.sendMessage(
        boldSerif("❌ Invalid URL | Please provide a valid video link."),
        threadID,
        messageID
      );
    }

    const processingMsg = await api.sendMessage(
      boldSerif("⏳ Initializing download...\n━━━━━━━━━━━━━━━━"),
      threadID,
      messageID
    );

    try {
      // Update reaction
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const apiUrl = await baseApiUrl();
      
      // Update message
      api.editMessage(
        boldSerif("⏳ Fetching video data...\n━━━━━━━━━━━━━━━━\n📡 Connecting to server..."),
        processingMsg.messageID,
        threadID
      );

      const { data } = await axios.get(`${apiUrl}/alldl?url=${encodeURIComponent(urlInput)}`, {
        timeout: 30000
      });

      if (!data || !data.result) {
        throw new Error("Could not fetch video. Please check the link and try again.");
      }

      // Detect platform with improved detection
      const platform = detectPlatform(urlInput);
      
      // Update message
      api.editMessage(
        boldSerif(`⏳ Downloading video...\n━━━━━━━━━━━━━━━━\n📱 Platform: ${platform}\n💾 Size: Fetching...`),
        processingMsg.messageID,
        threadID
      );

      // Create cache directory if not exists
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const filePath = path.join(cacheDir, `video_${timestamp}.mp4`);

      // Download video with progress tracking
      const response = await axios.get(data.result, { 
        responseType: "stream",
        timeout: 60000,
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted % 25 === 0) { // Update every 25%
            api.editMessage(
              boldSerif(`⏳ Downloading... ${percentCompleted}%\n━━━━━━━━━━━━━━━━\n📱 Platform: ${platform}\n📊 Progress: ${percentCompleted}%`),
              processingMsg.messageID,
              threadID
            );
          }
        }
      });

      // Save video
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Generate short link
      const shortLink = await global.utils.shortenURL(data.result);

      // Random speed for aesthetic (1-5 seconds)
      const downloadSpeed = (Math.random() * 4 + 1).toFixed(1);

      // Success reaction
      api.setMessageReaction("✅", messageID, () => {}, true);

      // Delete processing message
      api.unsendMessage(processingMsg.messageID);

      // Send video with stylish message (all in bold serif)
      const message = boldSerif(`╭━━━━━━━━『 DOWNLOADER 』━━━━━━━━╮
┃
┃  ✅ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃
┃
┃  📱 𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌: ${platform}
┃  ⚡ 𝐒𝐏𝐄𝐄𝐃: ${downloadSpeed}s
┃  🔗 𝐐𝐔𝐀𝐋𝐈𝐓𝐘: Original
┃  📊 𝐒𝐓𝐀𝐓𝐔𝐒: Success
┃
┃  📎 𝐃𝐢𝐫𝐞𝐜𝐭 𝐋𝐢𝐧𝐤:
┃  ${shortLink}
┃
┃  ✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲: —͟͞͞𝐓𝐀𝐌𝐈𝐌
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`);

      await api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => {
          // Clean up: delete file after sending
          setTimeout(() => {
            fs.unlinkSync(filePath);
          }, 5000);
        },
        messageID
      );

    } catch (err) {
      console.error("Download error:", err);
      
      api.setMessageReaction("❎", messageID, () => {}, true);
      
      // Delete processing message if exists
      if (processingMsg?.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

      // Error message (all in bold serif)
      let errorMsg = boldSerif("❌ Download Failed\n━━━━━━━━━━━━━━━━\n");
      
      if (err.code === 'ECONNABORTED') {
        errorMsg += boldSerif("Connection timeout. Please try again.");
      } else if (err.response?.status === 404) {
        errorMsg += boldSerif("Video not found or unavailable.");
      } else if (err.message.includes("API URL")) {
        errorMsg += boldSerif("Server connection failed.");
      } else {
        errorMsg += boldSerif(`Error: ${err.message}`);
      }
      
      errorMsg += boldSerif("\n\nPlease check the link and try again.");

      api.sendMessage(errorMsg, threadID, messageID);
    }
  }
};

// Helper function to detect platform
function detectPlatform(url) {
  const platforms = [
    { pattern: /tiktok\.com/i, name: boldSerif("TikTok 🎵") },
    { pattern: /youtube\.com|youtu\.be/i, name: boldSerif("YouTube ▶️") },
    { pattern: /facebook\.com|fb\.watch/i, name: boldSerif("Facebook 📘") },
    { pattern: /instagram\.com/i, name: boldSerif("Instagram 📸") },
    { pattern: /twitter\.com|x\.com/i, name: boldSerif("Twitter 🐦") },
    { pattern: /pinterest\.com/i, name: boldSerif("Pinterest 📌") },
    { pattern: /dailymotion\.com/i, name: boldSerif("Dailymotion 🎥") },
    { pattern: /vimeo\.com/i, name: boldSerif("Vimeo 🎬") },
    { pattern: /tumblr\.com/i, name: boldSerif("Tumblr 🔮") },
    { pattern: /reddit\.com/i, name: boldSerif("Reddit 👽") }
  ];

  for (const platform of platforms) {
    if (platform.pattern.test(url)) {
      return platform.name;
    }
  }
  return boldSerif("Universal 🌐");
}
