// config/maps.js
// small abstraction so you can switch mapping providers
const provider = process.env.MAPS_PROVIDER || 'google'; // e.g., 'google' or 'other'

const config = {
  provider,
  google: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  },
  // add other provider configs here later
};

module.exports = config;
