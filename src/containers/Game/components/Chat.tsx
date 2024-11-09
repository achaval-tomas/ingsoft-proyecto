import { useState } from "react";
import FilledButton from "../../../components/FilledButton";
import Input from "../../../components/Input";
import { ChatMessage } from "../../../domain/ChatMessage";

export interface ChatProps {
   messages: ChatMessage[];
   selfPlayerName: string;
   onSendMessage: (message: ChatMessage) => void;
};

const Chat = ({ messages, selfPlayerName, onSendMessage }: ChatProps) => {
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (input.trim() === "") { return; }

        const newMessage = {
            msg: input,
            sender: selfPlayerName,
        };

        onSendMessage(newMessage);
        setInput("");
    };

    return (
        <div className="max-h-full">
            <div className="pt-14 max-h-screen overflow-y-auto break-words flex flex-col-reverse">
                {[...messages].reverse().map((message, i) => (
                    <div key={messages.length - i - 1} className="max-w-inherit">
                        <strong>{message.sender}:</strong> {message.msg}
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
