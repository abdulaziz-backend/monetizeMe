import Stripe from 'stripe';
import { config } from '../config.js';

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export async function createPaymentIntent(amount, currency = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: ['card']
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw error;
  }
}

export async function processWithdrawal(userId, amount, method, db) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO withdrawals (user_id, amount, method, status) VALUES (?, ?, ?, ?)',
      [userId, amount, method, 'pending'],
      function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      }
    );
  });
}

export function validateWithdrawalRequest(amount, balance) {
  if (amount < config.MIN_WITHDRAWAL) {
    throw new Error(`Minimum withdrawal is ${config.MIN_WITHDRAWAL} Stars`);
  }
  if (amount > balance) {
    throw new Error('Insufficient balance');
  }
  return true;
}