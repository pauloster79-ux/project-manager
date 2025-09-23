export type DMTarget = { kind: "dm"; userRef: string };
export type ChannelTarget = { kind: "channel"; channelRef: string };
export type SendTarget = DMTarget | ChannelTarget;

export interface ChannelTransport {
  name: "slack" | "email" | "teams";
  sendText(target: SendTarget, text: string): Promise<void>;
  sendBlocks?(target: SendTarget, blocks: any): Promise<void>;
  openModal?(userRef: string, view: any): Promise<void>;
}
