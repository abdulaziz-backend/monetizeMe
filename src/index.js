import TelegramBot from 'node-telegram-bot-api';
import sqlite3 from 'sqlite3';
import { setupDatabase } from './database.js';
import { handleStart, handleMainMenu } from './handlers/basic.js';
import { handleNewAd, handleViewAds, handleAdAction } from './handlers/ads.js';
import { handleBalance, handleDeposit, handleWithdraw } from './handlers/financial.js';
import { handleAdmin, handleBroadcast, handleStats } from './handlers/admin.js';
import { handleAddChannel, verifyChannelOwnership, listUserChannels } from './handlers/channels.js';
import { handlePaymentMethod, handleCryptoPayment, handleCardPayment, handleWithdrawalMethod, processWithdrawalRequest } from './handlers/payment.js';

const token = '8162939768:AAE-nfGk8LKfCQVevmORJiie2GQsSSN5u_c';
const bot = new TelegramBot(token, { polling: true });
const db = new sqlite3.Database('bot.db');

// Initialize database
setupDatabase(db);

// Main menu handler
bot.on('callback_query', async (query) => {
  const action = query.data;
  const msg = query.message;
  const userId = query.from.id;

  try {
    switch(action) {
      case 'main_menu':
        await handleMainMenu(bot, msg, userId);
        break;
      case 'new_ad':
        await handleNewAd(bot, msg, db, userId);
        break;
      case 'view_ads':
        await handleViewAds(bot, msg, db, userId);
        break;
      case 'balance':
        await handleBalance(bot, msg, db, userId);
        break;
      case 'deposit':
        await handleDeposit(bot, msg, db, userId);
        break;
      case 'withdraw':
        await handleWithdraw(bot, msg, db, userId);
        break;
      case 'admin_panel':
        await handleAdmin(bot, msg, db, userId);
        break;
      case 'add_channel':
        await handleAddChannel(bot, msg, db, userId);
        break;
      case 'list_channels':
        await listUserChannels(bot, msg, db, userId);
        break;
      default:
        if (action.startsWith('ad_')) {
          await handleAdAction(bot, msg, db, action, userId);
        } else if (action.startsWith('pay_')) {
          const [method, type, amount] = action.split('_');
          if (type === 'card') {
            await handleCardPayment(bot, msg, parseInt(amount));
          } else if (type === 'crypto') {
            await handleCryptoPayment(bot, msg, parseInt(amount));
          }
        } else if (action.startsWith('withdraw_')) {
          const method = action.split('_')[1];
          await handleWithdrawalMethod(bot, msg, db, userId);
        }
    }

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Callback query error:', error);
    await bot.answerCallbackQuery(query.id, { text: '❌ An error occurred' });
  }
});

// Handle forwarded messages for channel verification
bot.on('message', async (msg) => {
  if (msg.forward_from_chat?.type === 'channel') {
    await verifyChannelOwnership(bot, msg, db, msg.from.id);
  }
});

// Command handlers
bot.onText(/\/start/, (msg) => handleStart(bot, msg, db));
bot.onText(/\/broadcast/, (msg) => handleBroadcast(bot, msg, db));
bot.onText(/\/stats/, (msg) => handleStats(bot, msg, db));

console.log('🚀 Bot is running...');