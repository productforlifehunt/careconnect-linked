import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const mercurPlugins: any[] = [
  { resolve: '@mercurjs/b2c-core', options: {} },
  { resolve: '@mercurjs/commission', options: {} },
  { resolve: '@mercurjs/reviews', options: {} },
  { resolve: '@mercurjs/requests', options: {} },
  ...(process.env.RESEND_API_KEY ? [{ resolve: '@mercurjs/resend', options: {} }] : []),
  ...(process.env.ALGOLIA_APP_ID ? [{
    resolve: '@mercurjs/algolia',
    options: {
      apiKey: process.env.ALGOLIA_API_KEY,
      appId: process.env.ALGOLIA_APP_ID,
    }
  }] : []),
]

const mercurModules: any[] = [
  ...(process.env.STRIPE_SECRET_API_KEY ? [{
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [{
        resolve: '@mercurjs/payment-stripe-connect/providers/stripe-connect',
        id: 'stripe-connect',
        options: { apiKey: process.env.STRIPE_SECRET_API_KEY },
      }],
    },
  }] : []),
  {
    resolve: '@medusajs/medusa/notification',
    options: {
      providers: [
        ...(process.env.RESEND_API_KEY ? [{
          resolve: '@mercurjs/resend/providers/resend',
          id: 'resend',
          options: {
            channels: ['email'],
            api_key: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL,
          },
        }] : []),
        {
          resolve: '@medusajs/medusa/notification-local',
          id: 'local',
          options: { channels: ['feed', 'seller_feed'] },
        },
      ],
    },
  },
]

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseSchema: process.env.DATABASE_SCHEMA || "medusa",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      // @ts-expect-error: vendorCors is not a standard Medusa config key
      vendorCors: process.env.VENDOR_CORS || process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  plugins: mercurPlugins,
  modules: mercurModules,
})
