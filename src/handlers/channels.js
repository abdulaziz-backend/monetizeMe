import { backToMainMenu } from '../keyboards.js';
import { config } from '../config.js';

export async function handleAddChannel(bot, msg, db, userId) {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '➕ Add Channel', callback_data: 'add_channel' }],
        [{ text: '📋 My Channels', callback_data: 'list_channels' }],
        [{ text: '🔙 Back', callback_data: 'main_menu' }]
      ]
    }
  };

  await bot.editMessageText(`
📢 *Channel Monetization*

To monetize your channel:
1. Add this bot (@MonetizeMe_bot) as admin to your channel
2. Click "Add Channel" below
3. Forward any message from your channel to this chat

Your channel will start receiving ads based on:
• Channel size
• Engagement rate
• Content quality

Revenue share: 70% to channel owner
`, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...keyboard
  });
}

export async function verifyChannelOwnership(bot, msg, db, userId) {
  try {
    const channelId = msg.forward_from_chat?.id;
    if (!channelId) {
      return bot.sendMessage(msg.chat.id, '❌ Please forward a message from your channel.');
    }

    // Check if bot is admin in the channel
    const botMember = await bot.getChatMember(channelId, bot.options.username);
    if (!botMember || !['administrator', 'creator'].includes(botMember.status)) {
      return bot.sendMessage(msg.chat.id, '❌ Please add the bot as an administrator to your channel first.');
    }

    // Get channel info
    const chat = await bot.getChat(channelId);
    
    // Check if channel already exists
    const existingChannel = await new Promise((resolve) => {
      db.get('SELECT * FROM channels WHERE channel_id = ?', [channelId], (err, row) => {
        resolve(row);
      });
    });

    if (existingChannel) {
      return bot.sendMessage(msg.chat.id, '❌ This channel is already registered.');
    }

    // Add channel to database
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO channels (channel_id, title, username, added_by) VALUES (?, ?, ?, ?)',
        [channelId, chat.title, chat.username, userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    await bot.sendMessage(msg.chat.id, `
✅ *Channel Successfully Added*

Channel: ${chat.title}
Username: @${chat.username}

Your channel will now receive ads and earn revenue!
`, {
      parse_mode: 'Markdown',
      ...backToMainMenu
    });

  } catch (error) {
    console.error('Channel verification error:', error);
    await bot.sendMessage(msg.chat.id, '❌ Error verifying channel ownership. Please try again.');
  }
}

export async function listUserChannels(bot, msg, db, userId) {
  const channels = await new Promise((resolve) => {
    db.all('SELECT * FROM channels WHERE added_by = ?', [userId], (err, rows) => {
      resolve(rows || []);
    });
  });

  if (channels.length === 0) {
    return bot.editMessageText('📭 You haven\'t added any channels yet.', {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      ...backToMainMenu
    });
  }

  const channelList = channels.map(channel => `
📢 *${channel.title}*
👤 @${channel.username}
📅 Added: ${new Date(channel.created_at).toLocaleDateString()}
`).join('\n───────────────\n');

  await bot.editMessageText(`
📋 *Your Channels*

${channelList}
`, {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: 'Markdown',
    ...backToMainMenu
  });
}