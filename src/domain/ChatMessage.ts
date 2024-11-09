import { z } from "zod";

const ChatMessageTypeSchema = z.enum(["player-message", "system-message"]);
export type ChatMessageType = z.infer<typeof ChatMessageTypeSchema>;

export const ChatMessageSchema = z.object({
    type: ChatMessageTypeSchema,
    text: z.string(),
});

type ChatMessage = z.infer<typeof ChatMessageSchema>;

export default ChatMessage;
