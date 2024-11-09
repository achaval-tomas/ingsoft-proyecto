import { useState } from "react";
import FilledButton from "../../../components/FilledButton";
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
        <div
            className="h-full flex flex-col justify-end"
            style={{
                "WebkitMaskImage": "linear-gradient(0deg, #000 80%, transparent)",
            }}
        >
            <div className="mb-2 overflow-y-auto break-words flex flex-col-reverse max-h-full">
                {[...messages].reverse().map((message, i) => (
                    <div key={messages.length - i - 1} className="max-w-inherit">
                        <strong>{message.sender}:</strong> {message.text}
                    </div>
                ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <Input
                    type="text"
                    placeholder="Escribí un mensaje"
                    value={input}
                    onChange={(text) => setInput(text)}
                />
                <FilledButton className="text-sm mx-2" type="submit">Enviar</FilledButton>
            </form>
        </div>
    );
};

export default Chat;
