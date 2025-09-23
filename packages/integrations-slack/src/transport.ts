import { WebClient } from "@slack/web-api";
import type { ChannelTransport, SendTarget } from "@pm/core/channel";

export class SlackTransport implements ChannelTransport {
  name = "slack" as const;
  private client: WebClient;
  constructor(token: string) { this.client = new WebClient(token); }
  async sendText(target: SendTarget, text: string) {
    const payload = target.kind === "dm"
      ? { channel: target.userRef, text }
      : { channel: target.channelRef, text };
    await this.client.chat.postMessage(payload as any);
  }
  async sendBlocks(target: SendTarget, blocks: any) {
    const payload = target.kind === "dm"
      ? { channel: target.userRef, text: "", blocks }
      : { channel: target.channelRef, text: "", blocks };
    await this.client.chat.postMessage(payload as any);
  }
  async openModal() { throw new Error("openModal requires trigger_id in Slack action context"); }
}
