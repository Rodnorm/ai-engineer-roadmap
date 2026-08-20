import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { NLPAnalysis } from "./NLPAnalysisCard";
import { useT } from "@/lib/i18n/I18nProvider";

export enum MessageUserType {
	USER = "user",
	BOT = "bot",
}

export type MessageType = {
	id: string;
	type: MessageUserType;
	text: string;
	nlpAnalysis?: NLPAnalysis;
};

type MessageContainerProps = {
	messages: MessageType[];
	isLoading?: boolean;
};

export default function MessageContainer({
	messages,
	isLoading,
}: MessageContainerProps) {
	const t = useT("chat");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [openId, setOpenId] = useState<string | null>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
		});
	}, [messages, isLoading]);

	return (
		<div
			className="chat-scroll flex-1 min-h-0 p-2 space-y-3 overflow-y-auto rounded-2xl"
			style={{
				maskImage:
					"linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
			}}
		>
			{messages.map((message) => (
				<Message
					key={message.id}
					message={message}
					showAnalysis={openId === message.id}
					onToggleAnalysis={() =>
						setOpenId((prev) => (prev === message.id ? null : message.id))
					}
				/>
			))}

			{isLoading && (
				<div className="flex">
					<div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
						<span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
						<span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
						<span className="sr-only">{t("thinking")}</span>
					</div>
				</div>
			)}

			<div ref={messagesEndRef} />
		</div>
	);
}
