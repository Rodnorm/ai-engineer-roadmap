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
		<div className="chat-scroll flex-1 min-h-0 py-2 px-1 space-y-3 overflow-y-auto">
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
				<div className="flex border border-border bg-panel p-3 font-mono text-xs text-accent">
					<div className="flex items-center gap-2">
						<span className="size-1.5 bg-accent animate-ping" />
						<span className="uppercase tracking-wider">
							[ {t("thinking")} ] :: RETRIEVING FAQ & NLP PIPELINE...
						</span>
					</div>
				</div>
			)}

			<div ref={messagesEndRef} />
		</div>
	);
}
