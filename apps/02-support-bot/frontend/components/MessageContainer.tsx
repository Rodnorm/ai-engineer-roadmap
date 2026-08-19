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
			className="chat-scroll p-2 space-y-3 overflow-y-auto min-h-[60px] max-h-[480px] rounded-2xl"
			style={{
				maskImage:
					"linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
			}}
		>
			{messages.map((message, index) => (
				<Message key={index} message={message} />
			))}

			{isLoading && (
				<div className="flex">
					<div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
						<span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
						<span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
						<span className="sr-only">Thinking</span>
					</div>
				</div>
			)}

			<div ref={messagesEndRef} />
		</div>
	);
}
