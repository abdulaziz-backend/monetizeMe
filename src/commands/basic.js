export function handleStart(bot, msg) {
  const welcomeMessage = `
Welcome to MonetizeMe Bot! 🚀

Here are the main commands:
/newad - Create a new advertisement
/myads - View your active ads
/balance - Check your balance
/deposit - Add funds to your account
/withdraw - Withdraw your earnings
/help - Show this help message

For admins:
/admin - Access admin panel
/broadcast - Send message to all users
/stats - View bot statistics
`;

  bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'Markdown' });
}

export function handleHelp(bot, msg) {
  const helpMessage = `
*Available Commands:*

*Ad Management:*
/newad - Submit a new advertisement
/myads - View your active ads

*Financial:*
/balance - Check your account balance
/deposit - Add funds to your account
/withdraw - Withdraw your earnings

*Other:*
/help - Show this help message
/start - Start the bot

*Note:* 50 Stars = $1
`;

  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
}