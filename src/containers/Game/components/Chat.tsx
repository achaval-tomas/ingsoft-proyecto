import { useState } from "react";
import Input from "../../../components/Input";
import ChatMessage from "../../../domain/ChatMessage";

export interface ChatProps {
   messages: ChatMessage[];
   onSendMessage: (message: string) => void;
};

const Chat = ({ messages, onSendMessage }: ChatProps) => {
    const [input, setInput] = useState("");

    const sendMessage = () => {
        const trimmedInput = input.trim();
        if (trimmedInput === "") {
            return;
        }

        onSendMessage(trimmedInput);
        setInput("");
    };

    return (
        <div className="h-full flex flex-col justify-end">
            <div
                className="h-full mb-2 justify-end overflow-y-auto"
                style={{ "WebkitMaskImage": "linear-gradient(0deg, #000 80%, transparent)" }}
            >
                <div className="flex flex-col break-words">
                    {messages.map((message, i) => (
                        <div key={i}>
                            <strong>{message.sender}:</strong> {message.text}
                        </div>
                    ))}
                </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <Input
                    type="text"
                    placeholder="Enviar mensaje..."
                    value={input}
                    onChange={(text) => setInput(text)}
                    className="w-full"
                />
            </form>
        </div>
    );
};

export default Chat;
