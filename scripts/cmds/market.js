const axios = require("axios");

// Premium Font Helper Baby
function fancy(text) {
  const map = {
    'a': '𝒂','b': '𝒃','c': '𝒄','d': '𝒅','e': '𝒆','f': '𝒇','g': '𝒈','h': '𝒉','i': '𝒊','j': '𝒋','k': '𝒌','l': '𝒍','m': '𝒎','n': '𝒏','o': '𝒐','p': '𝒑','q': '𝗊','r': '𝒓','s': '𝒔','t': '𝒕','u': '𝒖','v': '𝒗','w': '𝒘','x': '𝒙','y': '𝒚','z': '𝒛',
    'A': '𝑨','B': '𝑩','C': '𝑪','D': '𝑫','E': '𝑬','F': '𝑭','G': '𝑮','H': '𝑯','I': '𝑰','J': '𝑱','K': '𝑲','L': '𝑳','M': '𝑴','N': '𝑵','O': '𝑶','P': '𝑷','Q': '𝑸','R': '𝑹','S': '𝑺','T': '𝑻','U': '𝑼','V': '𝑽','W': '𝒘','X': '𝑿','Y': '𝒀','Z': '𝒁',
    '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
}

// In-memory cache for active listings
const activeListings = new Map();

module.exports = {
  config: {
    name: "market",
    aliases: ["trade", "p2p", "sell", "economy"],
    version: "100.0",
    author: "Saif",
    countDown: 5,
    role: 0,
    category: "game",
    description: "🏙️ 𝑼𝒍𝒕𝒊𝒎𝒂𝒕𝒆 𝑳𝒊𝒇𝒆 𝑺𝒊𝒎𝒖𝒍𝒂𝒕𝒊𝒐𝒏 𝑴𝒂𝒓𝒌𝒆𝒕 𝑺𝒚𝒔𝒕𝒆𝒎 🏙️"
  },

  onStart: async function ({ api, event, usersData, args, message }) {
    const { threadID, messageID, senderID } = event;
    let user = await usersData.get(senderID);
    
    // Initialize user data structure
    if (!user.data) user.data = {};
    if (!user.data.marketStats) {
      user.data.marketStats = {
        level: 1,
        xp: 0,
        reputation: 50,
        skills: {
          trading: 1,
          negotiation: 1,
          investment: 1,
          production: 1,
          marketing: 1
        },
        totalTrades: 0,
        totalProfit: 0,
        inventory: [],
        businessCount: 0,
        achievements: []
      };
    }
    
    const userStats = user.data.marketStats;
    const sub = args[0]?.toLowerCase();

    // ----------------- 1. HELP & DASHBOARD -----------------
    if (!sub || sub === "help") {
      let help = `🏙️ ${fancy("𝑼𝑳𝑻𝑰𝑴𝑨𝑻𝑬 𝑳𝑰𝑭𝑬 𝑺𝑰𝑴𝑼𝑳𝑨𝑻𝑰𝑶𝑵 𝑴𝑨𝑹𝑲𝑬𝑻")} 🏙️\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      help += `📊 ${fancy("market profile")} - View your stats\n`;
      help += `🏪 ${fancy("market shop")} - Buy items\n`;
      help += `📈 ${fancy("market stock")} - Stock market\n`;
      help += `🏢 ${fancy("market business")} - Manage businesses\n`;
      help += `📦 ${fancy("market sell [item] [price]")} - List item\n`;
      help += `🛒 ${fancy("market buy [ID]")} - Buy item\n`;
      help += `💼 ${fancy("market invest [amount]")} - Invest money\n`;
      help += `📋 ${fancy("market list")} - View all listings\n`;
      help += `⚡ ${fancy("market hunt")} - Find rare items\n`;
      help += `👥 ${fancy("market partner @mention")} - Business partnership\n`;
      help += `🔨 ${fancy("market produce")} - Produce goods\n`;
      help += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      help += `🏆 ${fancy("𝑳𝒆𝒗𝒆𝒍:")} ${userStats.level} | ${fancy("𝑹𝒆𝒑:")} ${userStats.reputation}\n`;
      help += `💰 ${fancy("𝑩𝒂𝒍𝒂𝒏𝒄𝒆:")} ${user.money?.toLocaleString() || 0}\n`;
      help += `📊 ${fancy("𝑻𝒐𝒕𝒂𝒍 𝑻𝒓𝒂𝒅𝒆𝒔:")} ${userStats.totalTrades}`;
      
      return api.sendMessage(help, threadID, messageID);
    }

    // ----------------- 2. USER PROFILE -----------------
    if (sub === "profile" || sub === "stats") {
      const skillsText = Object.entries(userStats.skills)
        .map(([skill, level]) => `${fancy(skill)}: ${level}/100`)
        .join(' | ');
      
      let profile = `👤 ${fancy("𝑷𝑹𝑶𝑭𝑰𝑳𝑬")} 👤\n━━━━━━━━━━━━━━━━━━\n`;
      profile += `${fancy("𝑵𝒂𝒎𝒆:")} ${user.name}\n`;
      profile += `${fancy("𝑳𝒆𝒗𝒆𝒍:")} ${userStats.level} | ${fancy("𝑿𝑷:")} ${userStats.xp}/${userStats.level * 100}\n`;
      profile += `${fancy("𝑹𝒆𝒑𝒖𝒕𝒂𝒕𝒊𝒐𝒏:")} ${userStats.reputation}/100\n`;
      profile += `${fancy("𝑺𝒌𝒊𝒍𝒍𝒔:")}\n${skillsText}\n`;
      profile += `${fancy("𝑻𝒐𝒕𝒂𝒍 𝑻𝒓𝒂𝒅𝒆𝒔:")} ${userStats.totalTrades}\n`;
      profile += `${fancy("𝑻𝒐𝒕𝒂𝒍 𝑷𝒓𝒐𝒇𝒊𝒕:")} ${userStats.totalProfit.toLocaleString()}\n`;
      profile += `${fancy("𝑩𝒖𝒔𝒊𝒏𝒆𝒔𝒔𝒆𝒔:")} ${userStats.businessCount}\n`;
      profile += `${fancy("𝑨𝒄𝒉𝒊𝒆𝒗𝒆𝒎𝒆𝒏𝒕𝒔:")} ${userStats.achievements.length}\n`;
      profile += `${fancy("𝑰𝒏𝒗𝒆𝒏𝒕𝒐𝒓𝒚:")} ${userStats.inventory.length} items\n`;
      profile += `━━━━━━━━━━━━━━━━━━`;
      
      return api.sendMessage(profile, threadID, messageID);
    }

    // ----------------- 3. ITEM DATABASE -----------------
    const ITEM_DB = {
      common: [
        { name: "Fresh Fish", emoji: "🐟", price: 50 },
        { name: "Rice Bag", emoji: "🍚", price: 30 },
        { name: "Vegetables", emoji: "🥬", price: 25 },
        { name: "Milk", emoji: "🥛", price: 40 },
        { name: "Eggs", emoji: "🥚", price: 35 }
      ],
      electronics: [
        { name: "Smartphone", emoji: "📱", price: 15000 },
        { name: "Laptop", emoji: "💻", price: 35000 },
        { name: "Headphones", emoji: "🎧", price: 1200 }
      ],
      luxury: [
        { name: "Gold Necklace", emoji: "📿", price: 50000 },
        { name: "Diamond Ring", emoji: "💍", price: 120000 }
      ]
    };

    // ----------------- 4. SHOP SYSTEM -----------------
    if (sub === "shop") {
      const category = args[1]?.toLowerCase();
      let shopMsg = `🛍️ ${fancy("𝑺𝑯𝑶𝑷")} 🛍️\n━━━━━━━━━━━━━━━━━━\n`;
      
      if (!category) {
        shopMsg += `${fancy("𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒆𝒔:")}\n`;
        shopMsg += `🛒 ${fancy("market shop common")} - Daily items\n`;
        shopMsg += `📱 ${fancy("market shop electronics")} - Electronics\n`;
        shopMsg += `💎 ${fancy("market shop luxury")} - Luxury goods\n`;
        shopMsg += `━━━━━━━━━━━━━━━━━━\n`;
        shopMsg += `${fancy("𝑼𝒔𝒆: market buyitem [number]")}`;
        
        return api.sendMessage(shopMsg, threadID, messageID);
      }
      
      if (!ITEM_DB[category]) {
        return api.sendMessage(fancy("❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝒄𝒂𝒕𝒆𝒈𝒐𝒓𝒚!"), threadID, messageID);
      }
      
      const items = ITEM_DB[category];
      shopMsg += `${fancy(category.toUpperCase())}\n━━━━━━━━━━━━━━━━━━\n`;
      
      items.forEach((item, index) => {
        // Apply skill discount
        const discount = userStats.skills.trading * 0.01;
        const finalPrice = Math.floor(item.price * (1 - discount));
        shopMsg += `${index + 1}. ${item.emoji} ${fancy(item.name)} - ${finalPrice.toLocaleString()}\n`;
      });
      
      shopMsg += `━━━━━━━━━━━━━━━━━━\n`;
      shopMsg += `${fancy("𝑼𝒔𝒆: market buyitem [number]")}`;
      
      // Store shop session
      global.GoatBot.onReply.set(messageID, {
        commandName: this.config.name,
        type: "shop_selection",
        category: category,
        userID: senderID
      });
      
      return api.sendMessage(shopMsg, threadID, messageID);
    }

    // ----------------- 5. SELL ITEM -----------------
    if (sub === "sell" || sub === "post") {
      const price = parseInt(args[args.length - 1]);
      const itemName = args.slice(1, -1).join(" ");
      
      if (!itemName || isNaN(price) || price <= 0) {
        return api.sendMessage(fancy("❌ 𝑼𝒔𝒂𝒈𝒆: market sell [item name] [price]"), threadID, messageID);
      }
      
      const listingID = Math.random().toString(36).substring(2, 7).toUpperCase();
      activeListings.set(listingID, {
        id: listingID,
        ownerID: senderID,
        ownerName: user.name,
        item: itemName,
        price: price,
        time: Date.now()
      });
      
      return api.sendMessage(`📢 ${fancy("𝑰𝑻𝑬𝑴 𝑳𝑰𝑺𝑻𝑬𝑫")} 📢\n━━━━━━━━━━━━━━━━━━\n📦 ${fancy("𝑰𝒕𝒆𝒎:")} ${fancy(itemName)}\n💰 ${fancy("𝑷𝒓𝒊𝒄𝒆:")} ${price.toLocaleString()}\n🆔 ${fancy("𝑰𝑫:")} ${listingID}\n👤 ${fancy("𝑺𝒆𝒍𝒍𝒆𝒓:")} ${user.name}\n━━━━━━━━━━━━━━━━━━`, threadID, messageID);
    }

    // ----------------- 6. VIEW LISTINGS -----------------
    if (sub === "list") {
      if (activeListings.size === 0) {
        return api.sendMessage(fancy("🏙️ 𝑵𝒐 𝒊𝒕𝒆𝒎𝒔 𝒂𝒗𝒂𝒊𝒍𝒂𝒃𝒍𝒆 𝒊𝒏 𝒕𝒉𝒆 𝒎𝒂𝒓𝒌𝒆𝒕!"), threadID, messageID);
      }
      
      let listMsg = `🏪 ${fancy("𝑴𝑨𝑹𝑲𝑬𝑻 𝑳𝑰𝑺𝑻𝑰𝑵𝑮𝑺")} 🏪\n━━━━━━━━━━━━━━━━━━\n`;
      
      activeListings.forEach((listing, id) => {
        const timeAgo = Math.floor((Date.now() - listing.time) / 60000);
        listMsg += `🆔 ${fancy(id)} | 📦 ${fancy(listing.item)}\n💰 ${fancy(listing.price.toLocaleString())} | 👤 ${fancy(listing.ownerName)}\n⏰ ${timeAgo} mins ago\n━━━━━━━━━━━━━━━━━━\n`;
      });
      
      listMsg += `${fancy("𝑼𝒔𝒆: market buy [ID] 𝒕𝒐 𝒑𝒖𝒓𝒄𝒉𝒂𝒔𝒆")}`;
      
      return api.sendMessage(listMsg, threadID, messageID);
    }

    // ----------------- 7. BUY ITEM -----------------
    if (sub === "buy") {
      const listingID = args[1]?.toUpperCase();
      const listing = activeListings.get(listingID);
      
      if (!listing) {
        return api.sendMessage(fancy("❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝒍𝒊𝒔𝒕𝒊𝒏𝒈 𝑰𝑫!"), threadID, messageID);
      }
      
      if (listing.ownerID === senderID) {
        return api.sendMessage(fancy("❌ 𝒀𝒐𝒖 𝒄𝒂𝒏'𝒕 𝒃𝒖𝒚 𝒚𝒐𝒖𝒓 𝒐𝒘𝒏 𝒊𝒕𝒆𝒎!"), threadID, messageID);
      }
      
      if (user.money < listing.price) {
        return api.sendMessage(fancy(`❌ 𝑰𝒏𝒔𝒖𝒇𝒇𝒊𝒄𝒊𝒆𝒏𝒕 𝒇𝒖𝒏𝒅𝒔! 𝑵𝒆𝒆𝒅: ${listing.price.toLocaleString()}`), threadID, messageID);
      }
      
      const seller = await usersData.get(listing.ownerID);
      
      // Transaction
      user.money -= listing.price;
      seller.money += listing.price;
      
      // Update stats
      userStats.totalTrades++;
      userStats.xp += 10;
      userStats.totalProfit -= listing.price; // For buyer, it's expense
      userStats.skills.trading = Math.min(100, userStats.skills.trading + 1);
      
      // Update seller stats
      if (!seller.data) seller.data = {};
      if (!seller.data.marketStats) seller.data.marketStats = userStats;
      seller.data.marketStats.totalTrades++;
      seller.data.marketStats.totalProfit += listing.price;
      seller.data.marketStats.xp += 5;
      
      // Add to buyer's inventory
      userStats.inventory.push({
        name: listing.item,
        boughtAt: listing.price,
        boughtFrom: listing.ownerName,
        time: Date.now()
      });
      
      // Save all data to MongoDB via usersData
      await usersData.set(senderID, user);
      await usersData.set(listing.ownerID, seller);
      
      // Remove listing
      activeListings.delete(listingID);
      
      return api.sendMessage(`✅ ${fancy("𝑷𝑼𝑹𝑪𝑯𝑨𝑺𝑬 𝑺𝑼𝑪𝑪𝑬𝑺𝑺𝑭𝑼𝑳!")}\n━━━━━━━━━━━━━━━━━━\n📦 ${fancy("𝑰𝒕𝒆𝒎:")} ${fancy(listing.item)}\n💰 ${fancy("𝑷𝒓𝒊𝒄𝒆:")} ${listing.price.toLocaleString()}\n👤 ${fancy("𝑺𝒆𝒍𝒍𝒆𝒓:")} ${listing.ownerName}\n📊 ${fancy("𝑻𝒓𝒂𝒅𝒊𝒏𝒈 𝑺𝒌𝒊𝒍𝒍 +1")}\n━━━━━━━━━━━━━━━━━━`, threadID, messageID);
    }

    // ----------------- 8. ITEM HUNTING -----------------
    if (sub === "hunt" || sub === "find") {
      if (!userStats.lastHunt) userStats.lastHunt = 0;
      const cooldown = 300000; // 5 minutes
      
      if (Date.now() - userStats.lastHunt < cooldown) {
        const remaining = Math.ceil((cooldown - (Date.now() - userStats.lastHunt)) / 60000);
        return api.sendMessage(fancy(`⏳ 𝑯𝒖𝒏𝒕𝒊𝒏𝒈 𝒄𝒐𝒐𝒍𝒅𝒐𝒘𝒏! 𝑻𝒓𝒚 𝒂𝒈𝒂𝒊𝒏 𝒊𝒏 ${remaining} 𝒎𝒊𝒏𝒖𝒕𝒆𝒔`), threadID, messageID);
      }
      
      userStats.lastHunt = Date.now();
      
      // Generate random item
      const categories = Object.keys(ITEM_DB);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const items = ITEM_DB[category];
      const foundItem = { ...items[Math.floor(Math.random() * items.length)] };
      
      // Add to inventory
      userStats.inventory.push({
        name: foundItem.name,
        value: foundItem.price,
        foundAt: Date.now()
      });
      
      userStats.xp += 5;
      await usersData.set(senderID, user);
      
      return api.sendMessage(`🎯 ${fancy("𝑰𝑻𝑬𝑴 𝑭𝑶𝑼𝑵𝑫!")}\n${foundItem.emoji} ${fancy(foundItem.name)}\n${fancy("𝑽𝒂𝒍𝒖𝒆:")} ${foundItem.price.toLocaleString()}\n${fancy("𝑿𝑷:")} +5`, threadID, messageID);
    }

    // ----------------- 9. INVESTMENT SYSTEM -----------------
    if (sub === "invest") {
      const amount = parseInt(args[1]);
      
      if (isNaN(amount) || amount <= 0) {
        return api.sendMessage(fancy("❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝒂𝒎𝒐𝒖𝒏𝒕!"), threadID, messageID);
      }
      
      if (user.money < amount) {
        return api.sendMessage(fancy(`❌ 𝑰𝒏𝒔𝒖𝒇𝒇𝒊𝒄𝒊𝒆𝒏𝒕 𝒇𝒖𝒏𝒅𝒔! 𝑵𝒆𝒆𝒅: ${amount.toLocaleString()}`), threadID, messageID);
      }
      
      const profitChance = 0.6 + (userStats.skills.investment * 0.002);
      const isProfitable = Math.random() < profitChance;
      const profitMultiplier = 0.1 + (Math.random() * 0.3);
      
      let profit = Math.floor(amount * profitMultiplier);
      let message = "";
      
      if (isProfitable) {
        user.money += profit;
        userStats.totalProfit += profit;
        userStats.skills.investment = Math.min(100, userStats.skills.investment + 2);
        message = `📈 ${fancy("𝑰𝑵𝑽𝑬𝑺𝑻𝑴𝑬𝑵𝑻 𝑺𝑼𝑪𝑪𝑬𝑺𝑺!")}\n${fancy("𝑷𝒓𝒐𝒇𝒊𝒕:")} +${profit.toLocaleString()}\n${fancy("𝑹𝑶𝑰:")} +${(profitMultiplier * 100).toFixed(1)}%\n${fancy("𝑰𝒏𝒗𝒆𝒔𝒕𝒎𝒆𝒏𝒕 𝑺𝒌𝒊𝒍𝒍 +2")}`;
      } else {
        user.money -= profit;
        message = `📉 ${fancy("𝑰𝑵𝑽𝑬𝑺𝑻𝑴𝑬𝑵𝑻 𝑳𝑶𝑺𝑺!")}\n${fancy("𝑳𝒐𝒔𝒕:")} -${profit.toLocaleString()}\n${fancy("𝑹𝑶𝑰:")} -${(profitMultiplier * 100).toFixed(1)}%`;
      }
      
      userStats.totalTrades++;
      userStats.xp += 5;
      
      await usersData.set(senderID, user);
      
      return api.sendMessage(message, threadID, messageID);
    }

    // ----------------- 10. BUSINESS PARTNERSHIP -----------------
    if (sub === "partner" || sub === "collab") {
      const mentions = Object.keys(event.mentions);
      
      if (mentions.length === 0) {
        return api.sendMessage(fancy("❌ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒎𝒆𝒏𝒕𝒊𝒐𝒏 𝒂 𝒖𝒔𝒆𝒓 𝒕𝒐 𝒑𝒂𝒓𝒕𝒏𝒆𝒓 𝒘𝒊𝒕𝒉!"), threadID, messageID);
      }
      
      const partnerID = mentions[0];
      
      if (partnerID === senderID) {
        return api.sendMessage(fancy("❌ 𝒀𝒐𝒖 𝒄𝒂𝒏'𝒕 𝒑𝒂𝒓𝒕𝒏𝒆𝒓 𝒘𝒊𝒕𝒉 𝒚𝒐𝒖𝒓𝒔𝒆𝒍𝒇!"), threadID, messageID);
      }
      
      const partnerData = await usersData.get(partnerID);
      const combinedSkills = (userStats.skills.trading + (partnerData.data?.marketStats?.skills?.trading || 1)) / 2;
      const partnershipBonus = Math.floor(combinedSkills * 10);
      
      return api.sendMessage(`🤝 ${fancy("𝑷𝑨𝑹𝑻𝑵𝑬𝑹𝑺𝑯𝑰𝑷 𝑶𝑭𝑭𝑬𝑹")} 🤝\n━━━━━━━━━━━━━━━━━━\n👤 ${fancy("𝑭𝒓𝒐𝒎:")} ${user.name}\n👥 ${fancy("𝑻𝒐:")} ${partnerData.name}\n💰 ${fancy("𝑫𝒂𝒊𝒍𝒚 𝑩𝒐𝒏𝒖𝒔:")} ${partnershipBonus.toLocaleString()}\n━━━━━━━━━━━━━━━━━━\n${fancy("𝑹𝒆𝒑𝒍𝒚 '𝒂𝒄𝒄𝒆𝒑𝒕' 𝒕𝒐 𝒄𝒐𝒏𝒇𝒊𝒓𝒎")}`, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "partnership_offer",
          fromID: senderID,
          toID: partnerID,
          bonus: partnershipBonus
        });
      }, messageID);
    }

    // If no valid command
    return api.sendMessage(fancy(`❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝒄𝒐𝒎𝒎𝒂𝒏𝒅! 𝑼𝒔𝒆 ${global.utils.getPrefix(threadID)}market help`), threadID, messageID);
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { senderID, body, threadID, messageID } = event;
    const { type, fromID, toID, bonus, category, userID } = Reply;
    
    if (type === "partnership_offer") {
      if (senderID !== toID) return;
      
      if (body.toLowerCase() === "accept") {
        const fromUser = await usersData.get(fromID);
        const toUser = await usersData.get(toID);
        
        // Add bonus money
        fromUser.money += bonus;
        toUser.money += bonus;
        
        await usersData.set(fromID, fromUser);
        await usersData.set(toID, toUser);
        
        return api.sendMessage(`✅ ${fancy("𝑷𝑨𝑹𝑻𝑵𝑬𝑹𝑺𝑯𝑰𝑷 𝑬𝑺𝑻𝑨𝑩𝑳𝑰𝑺𝑯𝑬𝑫!")}\n🤝 ${fancy("𝑷𝒂𝒓𝒕𝒏𝒆𝒓𝒔:")} ${fromUser.name} & ${toUser.name}\n💰 ${fancy("𝑺𝒊𝒈𝒏𝒊𝒏𝒈 𝑩𝒐𝒏𝒖𝒔:")} ${bonus.toLocaleString()}`, threadID, messageID);
      }
    }
    
    if (type === "shop_selection" && senderID === userID) {
      const itemNumber = parseInt(body);
      const categories = {
        common: ITEM_DB.common,
        electronics: ITEM_DB.electronics,
        luxury: ITEM_DB.luxury
      };
      
      const items = categories[category];
      
      if (isNaN(itemNumber) || itemNumber < 1 || itemNumber > items.length) {
        return api.sendMessage(fancy("❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝒊𝒕𝒆𝒎 𝒏𝒖𝒎𝒃𝒆𝒓!"), threadID, messageID);
      }
      
      const selectedItem = items[itemNumber - 1];
      const user = await usersData.get(senderID);
      const userStats = user.data.marketStats;
      const discount = userStats.skills.trading * 0.01;
      const finalPrice = Math.floor(selectedItem.price * (1 - discount));
      
      global.GoatBot.onReply.set(messageID, {
        commandName: this.config.name,
        type: "purchase_confirmation",
        item: selectedItem,
        price: finalPrice,
        userID: senderID
      });
      
      return api.sendMessage(`🛒 ${fancy("𝑪𝑶𝑵𝑭𝑰𝑹𝑴 𝑷𝑼𝑹𝑪𝑯𝑨𝑺𝑬")}\n${selectedItem.emoji} ${fancy(selectedItem.name)}\n💰 ${fancy("𝑷𝒓𝒊𝒄𝒆:")} ${finalPrice.toLocaleString()}\n━━━━━━━━━━━━━━━━━━\n${fancy("𝑹𝒆𝒑𝒍𝒚 '𝒚𝒆𝒔' 𝒕𝒐 𝒃𝒖𝒚")}`, threadID, messageID);
    }
    
    if (type === "purchase_confirmation" && senderID === userID) {
      if (body.toLowerCase() === 'yes') {
        const { item, price } = Reply;
        const user = await usersData.get(senderID);
        
        if (user.money < price) {
          return api.sendMessage(fancy(`❌ 𝑰𝒏𝒔𝒖𝒇𝒇𝒊𝒄𝒊𝒆𝒏𝒕 𝒇𝒖𝒏𝒅𝒔! 𝑵𝒆𝒆𝒅: ${price.toLocaleString()}`), threadID, messageID);
        }
        
        user.money -= price;
        user.data.marketStats.inventory.push({
          name: item.name,
          boughtAt: price,
          time: Date.now()
        });
        
        await usersData.set(senderID, user);
        
        return api.sendMessage(`✅ ${fancy("𝑷𝑼𝑹𝑪𝑯𝑨𝑺𝑬 𝑺𝑼𝑪𝑪𝑬𝑺𝑺𝑭𝑼𝑳!")}\n${item.emoji} ${fancy(item.name)}\n💰 ${fancy("𝑷𝒂𝒊𝒅:")} ${price.toLocaleString()}\n📦 ${fancy("𝑨𝒅𝒅𝒆𝒅 𝒕𝒐 𝒊𝒏𝒗𝒆𝒏𝒕𝒐𝒓𝒚")}`, threadID, messageID);
      }
    }
  }
};
