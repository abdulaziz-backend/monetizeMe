export function handleNewAd(bot, msg, db) {
  const userId = msg.from.id;
  
  // Check if user exists
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  if (!user) {
    return bot.sendMessage(msg.chat.id, 'Please start the bot first with /start');
  }

  bot.sendMessage(msg.chat.id, `
Please send your ad in the following format:

\`\`\`
Content: Your ad text (max 300 chars)
Views: Number of views to purchase
\`\`\`

Example:
Content: Check out our amazing product! 🌟
Views: 1000
`, { parse_mode: 'Markdown' });

  // Set up listener for the next message
  bot.once('message', (response) => {
    try {
      const lines = response.text.split('\n');
      const content = lines[0].replace('Content:', '').trim();
      const views = parseInt(lines[1].replace('Views:', '').trim());

      if (content.length > 300) {
        return bot.sendMessage(msg.chat.id, 'Ad content must be under 300 characters.');
      }

      const cost = Math.ceil(views / 100) * 5; // 5 stars per 100 views
      if (user.balance < cost) {
        return bot.sendMessage(msg.chat.id, `Insufficient balance. Cost: ${cost} stars`);
      }

      // Insert ad
      db.prepare(`
        INSERT INTO ads (user_id, content, views_paid)
        VALUES (?, ?, ?)
      `).run(userId, content, views);

      // Update balance
      db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?')
        .run(cost, userId);

      bot.sendMessage(msg.chat.id, 'Ad created successfully! Use /myads to view your ads.');
    } catch (error) {
      bot.sendMessage(msg.chat.id, 'Invalid format. Please try again with /newad');
    }
  });
}

export function handleViewAd(bot, msg, db) {
  const userId = msg.from.id;
  const ads = db.prepare('SELECT * FROM ads WHERE user_id = ?').all(userId);

  if (ads.length === 0) {
    return bot.sendMessage(msg.chat.id, 'You have no active ads.');
  }

  const adList = ads.map(ad => `
*Ad ID:* ${ad.ad_id}
*Content:* ${ad.content}
*Views:* ${ad.views_current}/${ad.views_paid}
*Status:* ${ad.status}
*Created:* ${new Date(ad.created_at).toLocaleDateString()}
`).join('\n---\n');

  bot.sendMessage(msg.chat.id, adList, { parse_mode: 'Markdown' });
}