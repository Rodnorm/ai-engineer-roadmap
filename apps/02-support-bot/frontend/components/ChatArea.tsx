"use client";

import {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import ChatInput, { ChatInputHandle } from "./ChatInput";
import MessageContainer, {
	MessageType,
	MessageUserType,
} from "./MessageContainer";
import { NLPAnalysis } from "./NLPAnalysisCard";
import { queryMessage } from "@/lib/queryKB";

export type ChatAreaHandle = {
	submit: (text: string) => void;
};

const ChatArea = forwardRef<ChatAreaHandle>(function ChatArea(_, ref) {
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);
	const inputRef = useRef<ChatInputHandle>(null);

	const sendMessage = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || isLoading) return;

		const userId = crypto.randomUUID();
		const userMessage: MessageType = {
			id: userId,
			type: MessageUserType.USER,
			text: trimmed,
		};
		setMessages((prev) => [...prev, userMessage]);

		const controller = new AbortController();
		abortRef.current = controller;
		setIsLoading(true);

		try {
			const reply = await queryMessage(trimmed);
			setMessages((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					type: MessageUserType.BOT,
					text: reply.queryResponse,
				},
			]);
			const analysis: NLPAnalysis | undefined = reply.nlpAnalysis;
			if (analysis) {
				setMessages((prev) =>
					prev.map((m) =>
						m.id === userId ? { ...m, nlpAnalysis: analysis } : m
					)
				);
			}
		} catch (err) {
			if ((err as DOMException)?.name !== "AbortError") {
				setMessages((prev) => [
					...prev,
					{
						id: crypto.randomUUID(),
						type: MessageUserType.BOT,
						text: "Something went wrong. Please try again.",
					},
				]);
			}
		} finally {
			setIsLoading(false);
			abortRef.current = null;
			inputRef.current?.focus();
		}
	};

	useImperativeHandle(ref, () => ({ submit: sendMessage }));

	const stopRequest = () => {
		abortRef.current?.abort();
		setIsLoading(false);
		inputRef.current?.focus();
	};

	return (
		<>
			<MessageContainer messages={messages} isLoading={isLoading} />
			<ChatInput
				ref={inputRef}
				isLoading={isLoading}
				onSubmit={sendMessage}
				onStop={stopRequest}
			/>
		</>
	);
});

export default ChatArea;
