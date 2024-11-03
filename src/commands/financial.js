export function handleBalance(bot, msg, db) {
  const userId = msg.from.id;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

  if (!user) {
    return bot.sendMessage(msg.chat.id, 'Please start the bot first with /start');
  }

  const balance = user.balance;
  const usdBalance = (balance / 50).toFixed(2);

  bot.sendMessage(msg.chat.id, `
*Your Balance:*
${balance} Stars (≈ $${usdBalance})

Use /deposit to add funds
Use /withdraw to cash out
`, { parse_mode: 'Markdown' });
}

export function handleDeposit(bot, msg, db) {
  // In a real implementation, integrate with payment processor
  bot.sendMessage(msg.chat.id, `
To deposit Stars, choose an amount:

1. 500 Stars ($10)
2. 1000 Stars ($20)
3. 2500 Stars ($50)
4. 5000 Stars ($100)

Reply with the number of your choice.
`);
}

export function handleWithdraw(bot, msg, db) {
  const userId = msg.from.id;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

  if (!user || user.balance < 50) {
    return bot.sendMessage(msg.chat.id, 'Minimum withdrawal is 50 Stars ($1)');
  }

  bot.sendMessage(msg.chat.id, `
*Available for withdrawal:*
${user.balance} Stars (≈ $${(user.balance / 50).toFixed(2)})

Reply with the amount of Stars you want to withdraw.
`, { parse_mode: 'Markdown' });
}