import { mainMenuKeyboard } from '../keyboards.js';

export async function handleStart(bot, msg, db) {
  const userId = msg.from.id;
  const username = msg.from.username;

  // Add user to database if not exists
  db.run(
    'INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)',
    [userId, username]
  );

  const welcomeMessage = `
🎉 Welcome to MonetizeMe Bot! 

💫 Promote your content across Telegram channels:
• 💰 Only $0.75 per 100 views
• 📊 Real-time statistics
• 🎯 Targeted audience reach

Get started by choosing an option below:
`;

  await bot.sendMessage(msg.chat.id, welcomeMessage, mainMenuKeyboard);
}

export async function handleMainMenu(bot, msg, userId) {
  const menuMessage = `
🎯 Main Menu

Choose an action:
• 📢 Create new advertisement
• 📋 View your active ads
• 💰 Check balance
• 💳 Add funds
• 💸 Withdraw earnings
`;

  await bot.editMessageText(menuMessage, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    ...mainMenuKeyboard
  });
}