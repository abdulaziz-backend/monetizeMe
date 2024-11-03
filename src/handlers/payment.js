import { config } from '../config.js';
import { createPaymentIntent, processWithdrawal, validateWithdrawalRequest } from '../utils/payment.js';
import { backToMainMenu } from '../keyboards.js';

export async function handlePaymentMethod(bot, msg, db, userId, amount) {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💳 Credit Card', callback_data: `pay_card_${amount}` },
          { text: '₿ Crypto', callback_data: `pay_crypto_${amount}` }
        ],
        [
          { text: '🏦 Bank Transfer', callback_data: `pay_bank_${amount}` },
          { text: '🔙 Back', callback_data: 'main_menu' }
        ]
      ]
    }
  };

  await bot.editMessageText(`
💳 *Choose Payment Method*

Amount: ${amount} Stars ($${(amount * config.CONVERSION_RATE).toFixed(2)})

Available methods:
• Credit/Debit Card
• Cryptocurrency
• Bank Transfer
`, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...keyboard
  });
}

export async function handleCryptoPayment(bot, msg, amount) {
  const { CRYPTO } = config.PAYMENT_METHODS;
  
  await bot.editMessageText(`
₿ *Crypto Payment*

Amount: ${amount} Stars ($${(amount * config.CONVERSION_RATE).toFixed(2)})

Send the exact amount to one of these addresses:

*Bitcoin (BTC):*
\`${CRYPTO.BTC}\`

*Ethereum (ETH):*
\`${CRYPTO.ETH}\`

*USDT (TRC20):*
\`${CRYPTO.USDT}\`

After sending, forward the transaction ID to this chat.
`, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...backToMainMenu
  });
}

export async function handleCardPayment(bot, msg, amount) {
  try {
    const paymentIntent = await createPaymentIntent(amount * config.CONVERSION_RATE);
    
    await bot.editMessageText(`
💳 *Card Payment*

Amount: ${amount} Stars ($${(amount * config.CONVERSION_RATE).toFixed(2)})

Click the button below to proceed with secure payment:
`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '💳 Pay Securely',
            url: `https://checkout.stripe.com/pay/${paymentIntent.client_secret}`
          }],
          [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]
        ]
      }
    });
  } catch (error) {
    await bot.editMessageText('❌ Payment processing error. Please try again.', {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      ...backToMainMenu
    });
  }
}

export async function handleWithdrawalMethod(bot, msg, db, userId) {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '₿ Crypto', callback_data: 'withdraw_crypto' },
          { text: '🏦 Bank', callback_data: 'withdraw_bank' }
        ],
        [
          { text: '💰 PayPal', callback_data: 'withdraw_paypal' },
          { text: '🔙 Back', callback_data: 'main_menu' }
        ]
      ]
    }
  };

  await bot.editMessageText(`
💸 *Choose Withdrawal Method*

Available methods:
• Cryptocurrency (BTC, ETH, USDT)
• Bank Transfer (SWIFT/IBAN)
• PayPal

Minimum withdrawal: ${config.MIN_WITHDRAWAL} Stars ($${(config.MIN_WITHDRAWAL * config.CONVERSION_RATE).toFixed(2)})
Processing time: 1-3 business days
`, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...keyboard
  });
}

export async function processWithdrawalRequest(bot, msg, db, userId, method) {
  const user = await new Promise((resolve, reject) => {
    db.get('SELECT balance FROM users WHERE user_id = ?', [userId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });

  if (!user || user.balance < config.MIN_WITHDRAWAL) {
    return bot.editMessageText(`❌ Minimum withdrawal is ${config.MIN_WITHDRAWAL} Stars`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      ...backToMainMenu
    });
  }

  await bot.editMessageText(`
💸 *Withdrawal Request*

Available: ${user.balance} Stars ($${(user.balance * config.CONVERSION_RATE).toFixed(2)})
Method: ${method}

Please enter your ${method} details and the amount you wish to withdraw:

Format:
\`\`\`
Amount: [number of Stars]
Address: [your ${method} address/details]
\`\`\`
`, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...backToMainMenu
  });

  // Set up listener for withdrawal details
  bot.once('message', async (response) => {
    try {
      const lines = response.text.split('\n');
      const amount = parseInt(lines[0].replace('Amount:', '').trim());
      const address = lines[1].replace('Address:', '').trim();

      validateWithdrawalRequest(amount, user.balance);

      const withdrawalId = await processWithdrawal(userId, amount, method, db);

      // Update user balance
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET balance = balance - ? WHERE user_id = ?',
          [amount, userId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      // Notify admin
      await bot.sendMessage(config.ADMIN_ID, `
🔔 *New Withdrawal Request*

ID: #${withdrawalId}
User: ${userId}
Amount: ${amount} Stars ($${(amount * config.CONVERSION_RATE).toFixed(2)})
Method: ${method}
Address: ${address}
`, { parse_mode: 'Markdown' });

      await bot.sendMessage(msg.chat.id, `
✅ *Withdrawal Request Submitted*

ID: #${withdrawalId}
Amount: ${amount} Stars
Method: ${method}

Your request is being processed. You will receive a notification once completed.
`, {
        parse_mode: 'Markdown',
        ...backToMainMenu
      });
    } catch (error) {
      await bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`, backToMainMenu);
    }
  });
}