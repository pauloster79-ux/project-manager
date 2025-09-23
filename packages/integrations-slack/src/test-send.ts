import { SlackTransport } from "./transport.js";
const token = process.env.SLACK_BOT_TOKEN!;
const target = process.argv[2];
if (!token || !target) { console.error('Usage: npm run slack:test "<SLACK_USER_OR_CHANNEL_ID>"'); process.exit(1); }
const slack = new SlackTransport(token);
await slack.sendText({ kind: "dm", userRef: target }, "Hello from SlackTransport ✅");
