import { backToMainMenu } from '../keyboards.js';

export async function handleBalance(bot, msg, db, userId) {
  db.get('SELECT balance FROM users WHERE user_id = ?', [userId], async (err, user) => {
    if (err || !user) {
      return bot.editMessageText('❌ An error occurred', {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        ...backToMainMenu
      });
    }

    const balance = user.balance;
    const usdBalance = (balance * 0.75 / 100).toFixed(2);

    await bot.editMessageText(`
💰 *Your Balance*

🌟 ${balance} Stars
💵 ≈ $${usdBalance}

• 💫 1 Star = $0.0075
• 🎯 100 Views = 100 Stars
`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: 'Markdown',
      ...backToMainMenu
    });
  });
}

export async function handleDeposit(bot, msg, db, userId) {
  const depositOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '500 Stars ($3.75)', callback_data: 'deposit_500' },
          { text: '1000 Stars ($7.50)', callback_data: 'deposit_1000' }
        ],
        [
          { text: '2500 Stars ($18.75)', callback_data: 'deposit_2500' },
          { text: '5000 Stars ($37.50)', callback_data: 'deposit_5000' }
        ],
        [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]
      ]
    }
  };

  await bot.editMessageText(`
💳 *Deposit Stars*

Choose amount to deposit:
• 500 Stars = $3.75
• 1000 Stars = $7.50
• 2500 Stars = $18.75
• 5000 Stars = $37.50

🔒 Secure payment via Stripe
`, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...depositOptions
  });
}

export async function handleWithdraw(bot, msg, db, userId) {
  db.get('SELECT balance FROM users WHERE user_id = ?', [userId], async (err, user) => {
    if (err || !user || user.balance < 100) {
      return bot.editMessageText('❌ Minimum withdrawal is 100 Stars ($0.75)', {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        ...backToMainMenu
      });
    }

    await bot.editMessageText(`
💸 *Withdraw Funds*

Available: ${user.balance} Stars ($${(user.balance * 0.75 / 100).toFixed(2)})

Reply with the amount of Stars you want to withdraw.
Minimum: 100 Stars ($0.75)
`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: 'Markdown',
      ...backToMainMenu
    });
  });
}