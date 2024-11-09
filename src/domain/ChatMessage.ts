import { z } from "zod";

const ChatMessageTypeSchema = z.enum(["player-message", "system-message"]);
export type ChatMessageType = z.infer<typeof ChatMessageTypeSchema>;

export const ChatMessageSchema = z.object({
    type: ChatMessageTypeSchema,
    // The name of the player that "sent" the message, or undefined.
    // It is separate from 'text' for styling purposes.
    sender: z.string().optional(),
    text: z.string(),
    sender: z.string(),
});

type ChatMessage = z.infer<typeof ChatMessageSchema>;

export default ChatMessage;
