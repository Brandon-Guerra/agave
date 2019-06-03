import dotenv from 'dotenv';

dotenv.config();

export default {
  server: {
    port: process.env.PORT,
  },
  spotify: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    playlistId: process.env.PLAYLIST_ID,
    redirectUri: process.env.REDIRECT_URI,
    scope: process.env.SCOPE,
  },
  slack: {
    url: process.env.SLACK_URL
  }
};