import { adminKeyboard, backToMainMenu } from '../keyboards.js';

export async function handleAdmin(bot, msg, db, userId) {
  db.get('SELECT is_admin FROM users WHERE user_id = ? AND is_admin = 1', [userId], async (err, user) => {
    if (err || !user) {
      return bot.editMessageText('⛔️ Access denied', {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        ...backToMainMenu
      });
    }

    await bot.editMessageText(`
👑 *Admin Panel*

Choose an action:
• 📢 Send broadcast message
• 📊 View statistics
• 👥 Manage users
• ⚙️ Bot settings
`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: 'Markdown',
      ...adminKeyboard
    });
  });
}

export async function handleBroadcast(bot, msg, db) {
  db.get('SELECT is_admin FROM users WHERE user_id = ? AND is_admin = 1', [msg.from.id], async (err, user) => {
    if (err || !user) {
      return bot.sendMessage(msg.chat.id, '⛔️ Access denied');
    }

    await bot.sendMessage(msg.chat.id, '📢 Send the message you want to broadcast:', backToMainMenu);
    
    bot.once('message', async (response) => {
      db.all('SELECT user_id FROM users', async (err, users) => {
        if (err) return console.error('Database error:', err);
        
        let sent = 0;
        for (const user of users) {
          try {
            await bot.sendMessage(user.user_id, `📢 *Broadcast Message*\n\n${response.text}`, {
              parse_mode: 'Markdown'
            });
            sent++;
          } catch (error) {
            console.error(`Failed to send to ${user.user_id}:`, error);
          }
        }

        await bot.sendMessage(msg.chat.id, `✅ Broadcast sent to ${sent} users`, backToMainMenu);
      });
    });
  });
}

export async function handleStats(bot, msg, db, userId) {
  db.get('SELECT is_admin FROM users WHERE user_id = ? AND is_admin = 1', [userId], async (err, user) => {
    if (err || !user) {
      return bot.editMessageText('⛔️ Access denied', {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        ...backToMainMenu
      });
    }

    const stats = await Promise.all([
      new Promise((resolve) => db.get('SELECT COUNT(*) as count FROM users', (err, result) => resolve(result?.count || 0))),
      new Promise((resolve) => db.get('SELECT COUNT(*) as count FROM ads WHERE status = "active"', (err, result) => resolve(result?.count || 0))),
      new Promise((resolve) => db.get('SELECT SUM(views_current) as sum FROM ads', (err, result) => resolve(result?.sum || 0))),
      new Promise((resolve) => db.get('SELECT SUM(amount) as sum FROM transactions WHERE type = "deposit"', (err, result) => resolve(result?.sum || 0)))
    ]);

    await bot.editMessageText(`
📊 *Bot Statistics*

👥 Users: ${stats[0]}
📢 Active Ads: ${stats[1]}
👁 Total Views: ${stats[2]}
💰 Revenue: ${stats[3]} Stars ($${(stats[3] * 0.75 / 100).toFixed(2)})
`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: 'Markdown',
      ...adminKeyboard
    });
  });
}