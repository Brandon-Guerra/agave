export interface ILink {
  url: string;
  domain: string;
}

export interface IEvent {
  channel: string;
  type: string;
  user: string;
  messageTs: string;
  links: ILink[];
}
