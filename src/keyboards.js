export const mainMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '📢 New Ad', callback_data: 'new_ad' },
        { text: '📋 My Ads', callback_data: 'view_ads' }
      ],
      [
        { text: '💰 Balance', callback_data: 'balance' },
        { text: '💳 Deposit', callback_data: 'deposit' }
      ],
      [
        { text: '💸 Withdraw', callback_data: 'withdraw' },
        { text: '📺 Add Channel', callback_data: 'add_channel' }
      ],
      [
        { text: '📊 Statistics', callback_data: 'stats' },
        { text: '📢 My Channels', callback_data: 'list_channels' }
      ]
    ]
  }
};

export const paymentKeyboard = (amount) => ({
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
});

export const adminKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '📢 Broadcast', callback_data: 'broadcast' },
        { text: '📊 Stats', callback_data: 'stats' }
      ],
      [
        { text: '👥 Users', callback_data: 'users' },
        { text: '⚙️ Settings', callback_data: 'settings' }
      ],
      [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]
    ]
  }
};

export const backToMainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]
    ]
  }
};