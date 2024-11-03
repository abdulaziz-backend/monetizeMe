export const config = {
  ADMIN_ID: 6236467772,
  STRIPE_PUBLIC_KEY: 'pk_test_51Op8KDFjx2PqsK3Y5XYZQv8N9X2tQwK',
  STRIPE_SECRET_KEY: 'sk_test_51Op8KDFjx2PqsK3Y5XYZQv8N9X2tQwK',
  PAYMENT_METHODS: {
    CRYPTO: {
      BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      USDT: 'TRX4WnhyNcXVxuQi2kPdBGe1cqnw9LMmX'
    },
    BANK: {
      SWIFT: 'CHASUS33XXX',
      IBAN: 'DE89370400440532013000'
    }
  },
  WITHDRAWAL_METHODS: ['Crypto', 'Bank Transfer', 'PayPal'],
  MIN_WITHDRAWAL: 100, // Stars
  CONVERSION_RATE: 0.0075, // $ per Star
  VIEWS_COST: 0.75 // $ per 100 views
};