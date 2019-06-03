import axios from 'axios';
import querystring from 'querystring';

import config from '../config';
import SlackService from './slack';

export default class SpotifyService {
  private accessToken: string = '';
  private clientId: string = config.spotify.clientId || '';
  private clientSecret: string = config.spotify.clientSecret || '';
  private code: string = '';
  private redirectUri: string = config.spotify.redirectUri || '';
  private refreshToken: string = '';
  private scope: string = config.spotify.scope || '';

  public async addTrackToPlaylist(playlistId: string, uri: string) {
    // Does not add track if already in playlist
    if (!this.accessToken) {
      await this.refreshTokens();
    }
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`
    };
    const params = {
      uris: [uri]
    };

    const existingTracks = await this.getPlaylist(playlistId);
    if (!existingTracks.includes(uri)) {
      try {
        axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, params, { headers });
      } catch (error) {
        console.log(error);
      }
    }
  }

  public async getPlaylist(playlistId: string): Promise<string[]> {
    if (!this.accessToken) {
      await this.refreshTokens();
    }
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`
    };
    const queryParams = '?fields=tracks.items.track.uri';

    try {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}${queryParams}`, { headers });
      const uris = response.data.tracks.items.map((item: { track: { uri: any; }; }) => item.track.uri );
      return uris;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  public setCode(code: string) {
    this.code = code;
  }

  public async refreshTokens() {
    const params = {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify(params));
      ({ access_token: this.accessToken, refresh_token: this.refreshToken } = response.data);
    } catch(error) {
      console.log(`Problem refreshing tokens: ${error}`);
      console.log('Resending auth link...');
      this.sendAuthLink();
    }
  }

  public async requestTokens() {
    const params = {
      grant_type: 'authorization_code',
      code: this.code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify(params));
      ({ access_token: this.accessToken, refresh_token: this.refreshToken } = response.data);
    } catch (error) {
      console.log(error);
    }
  }

  public sendAuthLink() {
    const queryParams = `client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUri}&scope=${this.scope}&show_dialog=true`;
    const slackService = new SlackService();
    slackService.sendTextMessage(`https://accounts.spotify.com/authorize?${queryParams}`);
  }

}
