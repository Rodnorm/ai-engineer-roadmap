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

import { useT } from "@/lib/i18n/I18nProvider";

export type ChatAreaHandle = {
	submit: (text: string) => void;
};

const createMessageId = () =>
	globalThis.crypto?.randomUUID?.() ??
	`${Date.now()}-${Math.random().toString(36).slice(2)}`;

const ChatArea = forwardRef<ChatAreaHandle>(function ChatArea(_, ref) {
	const t = useT("chat");

	const [messages, setMessages] = useState<MessageType[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const abortRef = useRef<AbortController | null>(null);
	const inputRef = useRef<ChatInputHandle>(null);

	const sendMessage = async (text: string) => {
		const trimmed = text.trim();

		if (!trimmed || isLoading) return;

		const userId = createMessageId();

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
			const reply = await queryMessage(
				trimmed,
				controller.signal
			);

			setMessages((prev) => [
				...prev,
				{
					id: createMessageId(),
					type: MessageUserType.BOT,
					text: reply.queryResponse,
				},
			]);

			const analysis: NLPAnalysis | undefined =
				reply.nlpAnalysis;

			if (analysis) {
				setMessages((prev) =>
					prev.map((message) =>
						message.id === userId
							? {
								...message,
								nlpAnalysis: analysis,
							}
							: message
					)
				);
			}
		} catch (err) {
			if ((err as DOMException)?.name !== "AbortError") {
				setMessages((prev) => [
					...prev,
					{
						id: createMessageId(),
						type: MessageUserType.BOT,
						text: t("errorMessage"),
					},
				]);
			}
		} finally {
			setIsLoading(false);
			abortRef.current = null;
			inputRef.current?.focus();
		}
	};

	useImperativeHandle(ref, () => ({
		submit: sendMessage,
	}));

	const stopRequest = () => {
		abortRef.current?.abort();
	};

	return (
		<>
			<MessageContainer
				messages={messages}
				isLoading={isLoading}
			/>

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