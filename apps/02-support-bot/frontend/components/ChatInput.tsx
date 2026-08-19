import { Send, Square } from "lucide-react";
import MessageContainer, {
	MessageType,
	MessageUserType,
} from "./MessageContainer";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { queryMessage } from "@/lib/queryKB";

const initialMessage = {
	text: "",
	type: MessageUserType.USER,
};

export type ChatInputHandle = {
	submit: (text: string) => void;
};

const ChatInput = forwardRef<ChatInputHandle>(function ChatInput(_, ref) {
	const [draft, setDraft] = useState<MessageType>(initialMessage);
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (!isLoading) {
			textAreaRef.current?.focus();
		}
	}, [isLoading]);

	const sendMessage = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || isLoading) return;

		const userMessage: MessageType = {
			text: trimmed,
			type: MessageUserType.USER,
		};
		setMessages((prev) => [...prev, userMessage]);
		setDraft(initialMessage);

		const controller = new AbortController();
		abortRef.current = controller;
		setIsLoading(true);

		try {
			const reply = await queryMessage(trimmed);
			setMessages((prev) => [
				...prev,
				{ text: reply.response, type: MessageUserType.BOT },
			]);
		} catch (err) {
			if ((err as DOMException)?.name !== "AbortError") {
				setMessages((prev) => [
					...prev,
					{
						text: "Something went wrong. Please try again.",
						type: MessageUserType.BOT,
					},
				]);
			}
		} finally {
			setIsLoading(false);
			abortRef.current = null;
		}
	};

	useImperativeHandle(ref, () => ({ submit: sendMessage }), [isLoading]);

	const stopRequest = () => {
		abortRef.current?.abort();
		setIsLoading(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(draft.text);
		}
	};

	return (
		<>
			<MessageContainer messages={messages} isLoading={isLoading} />
			<div className="bg-white h-28 rounded-2xl shadow-sm border border-slate-200 relative focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100 transition-all duration-200">
				<div className="flex h-full">
					<textarea
						ref={textAreaRef}
						value={draft.text}
						onKeyDown={handleKeyDown}
						placeholder="Type your question here ..."
						onChange={(e) => setDraft({ ...draft, text: e.target.value })}
						disabled={isLoading}
						className="resize-none text-slate-900 placeholder:text-slate-400 grow m-4 outline-none border-0 bg-transparent min-h-16 disabled:opacity-60 leading-relaxed"
					/>
					{isLoading ? (
						<button
							type="button"
							aria-label="Stop generating"
							onClick={stopRequest}
							className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
						>
							<Square className="w-4 h-4" aria-hidden="true" />
						</button>
					) : (
						<button
							type="button"
							aria-label="Send message"
							onClick={() => sendMessage(draft.text)}
							disabled={!draft.text.trim()}
							className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
						>
							<Send className="w-4 h-4" aria-hidden="true" />
						</button>
					)}
				</div>
			</div>
		</>
	);
});

export default ChatInput;
