import axios from 'axios';

import config from '../config';
import { IEvent, ILink } from '../../types/slack';

export default class SlackService {
  private url: string;

  constructor() {
    const url: string = config.slack.url || '';
    this.url =  url;
  }

  public processEvent(event: IEvent): string {
    const { links }: { links: ILink[] } = event;
    if (links[0].url.split('/')[3] === 'track') {
      const spotifyUri = `spotify:track:${links[0].url.split('/').pop().split('?')[0]}`;
      return spotifyUri;
    }
    return '';
  }

  public sendTextMessage(payload: string): void {
    const params = {
      "text": payload
    };
    axios.post(this.url, params);
  }
}
