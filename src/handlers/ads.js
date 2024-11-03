import { backToMainMenu } from '../keyboards.js';

export async function handleNewAd(bot, msg, db, userId) {
  const checkUser = new Promise((resolve, reject) => {
    db.get('SELECT balance FROM users WHERE user_id = ?', [userId], (err, user) => {
      if (err) reject(err);
      resolve(user);
    });
  });

  const user = await checkUser;
  if (!user) {
    return bot.editMessageText('❌ Please start the bot first with /start', {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      ...backToMainMenu
    });
  }

  const instructions = `
📝 *New Advertisement*

Send your ad with the following format:
\`\`\`
Content: Your ad text (max 300 chars)
Views: Number of views to purchase
\`\`\`

💰 Price: $0.75 per 100 views

Example:
Content: 🌟 Amazing product launch! Check it out at t.me/example
Views: 1000
`;

  await bot.editMessageText(instructions, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...backToMainMenu
  });
}

export async function handleViewAds(bot, msg, db, userId) {
  db.all('SELECT * FROM ads WHERE user_id = ?', [userId], async (err, ads) => {
    if (err) {
      console.error('Database error:', err);
      return bot.editMessageText('❌ An error occurred', {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        ...backToMainMenu
      });
    }

    if (!ads || ads.length === 0) {
      return bot.editMessageText('📭 You have no active ads', {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        ...backToMainMenu
      });
    }

    const adList = ads.map(ad => `
🎯 *Ad #${ad.ad_id}*
📝 Content: ${ad.content}
👁 Views: ${ad.views_current}/${ad.views_paid}
📊 Status: ${ad.status === 'active' ? '✅' : '❌'}
📅 Created: ${new Date(ad.created_at).toLocaleDateString()}
`).join('\n───────────────\n');

    await bot.editMessageText(adList, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: 'Markdown',
      ...backToMainMenu
    });
  });
}

export async function handleAdAction(bot, msg, db, action, userId) {
  const adId = action.split('_')[1];
  // Handle specific ad actions like pause/resume/delete
}