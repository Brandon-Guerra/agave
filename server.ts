import bodyParser from 'body-parser';
import express from 'express';

import config from './src/config';
import SlackService from './src/services/slack';
import SpotifyService from './src/services/spotify';

const required = ['CLIENT_ID', 'CLIENT_SECRET', 'PLAYLIST_ID', 'REDIRECT_URI', 'SCOPE', 'SLACK_URL'];

const missing = required.filter(e => !process.env.hasOwnProperty(e));

if (missing.length) {
  throw new Error(`Missing some required env variables: ${missing.join(',')}`);
}

const { port } = config.server;
const { playlistId } = config.spotify;

const app = express();
const path = require('path');
app.use(bodyParser.json());

const slackService = new SlackService();
const spotifyService = new SpotifyService();

app.post('/slack/event', async (req, res) => {
  const { type } = req.body;
  switch (type) {
    case 'url_verification':
      const { challenge } = req.body;
      res.send(challenge);
      return;
    case 'event_callback':
      const trackUri = slackService.processEvent(req.body.event);
      spotifyService.addTrackToPlaylist(playlistId as string, trackUri);
      res.send(200);
    default:
      console.log(`Unsupported event type: ${type}`);
  }
});

app.get('/callback', async (req, res) => {
  res.sendFile(path.join(__dirname + '/src/index.html'));
  const { code } = req.query;
  await spotifyService.setCode(code);
  spotifyService.requestTokens();
});

app.listen(port, () => {
  console.log(`The server has started on port ${port}`);
});