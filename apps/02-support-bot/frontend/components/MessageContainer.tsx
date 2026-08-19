import { useEffect, useRef } from "react";
import Message from "./Message";

export type MessageType = {
	text: string;
	type: MessageUserType;
};

export enum MessageUserType {
	USER = "user",
	BOT = "bot",
}

type MessageContainerProps = {
	messages: MessageType[];
	isLoading?: boolean;
};

export default function MessageContainer({
	messages,
	isLoading,
}: MessageContainerProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
		});
	}, [messages, isLoading]);

	return (
		<div
			className="chat-scroll p-5 space-y-3 overflow-y-auto min-h-auto max-h-70 rounded-2xl"
			style={{
				maskImage:
					"linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
				WebkitMaskImage:
					"linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
			}}
		>
			{messages.map((message, index) => (
				<Message key={index} message={message} />
			))}

			{isLoading && (
				<div className="flex">
					<div className="bg-gradient-to-bl from-red-200 to-sky-200 px-3 py-2 text-gray-700 rounded-2xl rounded-bl-none shadow-md">
						<p className="animate-pulse">Thinking...</p>
					</div>
				</div>
			)}

			<div ref={messagesEndRef} />
		</div>
	);
}
