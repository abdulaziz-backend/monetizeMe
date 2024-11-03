export function handleAdmin(bot, msg, db) {
  const userId = msg.from.id;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ? AND is_admin = 1').get(userId);

  if (!user) {
    return bot.sendMessage(msg.chat.id, 'Access denied.');
  }

  bot.sendMessage(msg.chat.id, `
*Admin Panel*

Commands:
/broadcast - Send message to all users
/stats - View statistics
/addadmin - Add new admin
/removeadmin - Remove admin
`, { parse_mode: 'Markdown' });
}

export function handleBroadcast(bot, msg, db) {
  const userId = msg.from.id;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ? AND is_admin = 1').get(userId);

  if (!user) {
    return bot.sendMessage(msg.chat.id, 'Access denied.');
  }

  bot.sendMessage(msg.chat.id, 'Please send the message you want to broadcast:');
  
  bot.once('message', async (response) => {
    const users = db.prepare('SELECT user_id FROM users').all();
    let sent = 0;

    for (const user of users) {
      try {
        await bot.sendMessage(user.user_id, response.text);
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${user.user_id}:`, error);
      }
    }

    bot.sendMessage(msg.chat.id, `Broadcast sent to ${sent} users.`);
  });
}

export function handleStats(bot, msg, db) {
  const userId = msg.from.id;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ? AND is_admin = 1').get(userId);

  if (!user) {
    return bot.sendMessage(msg.chat.id, 'Access denied.');
  }

  const stats = {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    activeAds: db.prepare('SELECT COUNT(*) as count FROM ads WHERE status = "active"').get().count,
    totalViews: db.prepare('SELECT SUM(views_current) as sum FROM ads').get().sum || 0,
    totalRevenue: db.prepare('SELECT SUM(amount) as sum FROM transactions WHERE type = "deposit"').get().sum || 0
  };

  bot.sendMessage(msg.chat.id, `
*Bot Statistics*

👥 Total Users: ${stats.users}
📢 Active Ads: ${stats.activeAds}
👁 Total Views: ${stats.totalViews}
💰 Total Revenue: ${stats.totalRevenue} Stars
`, { parse_mode: 'Markdown' });
}