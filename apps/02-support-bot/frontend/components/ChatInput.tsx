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
			<div className="bg-white h-28 rounded-2xl shadow-md border border-neutral-200 relative">
				<div className="flex">
					<textarea
						ref={textAreaRef}
						value={draft.text}
						onKeyDown={handleKeyDown}
						placeholder="Type your question here ..."
						onChange={(e) => setDraft({ ...draft, text: e.target.value })}
						disabled={isLoading}
						className="resize-none text-mauve-500 grow m-4 outline outline-0 focus:outline-0 active:border-transparent min-h-16 disabled:opacity-60"
					/>
					{isLoading ? (
						<Square
							role="button"
							aria-label="Stop generating"
							onClick={stopRequest}
							className="absolute bottom-0 right-0 w-6 h-6 m-2 text-red-500 hover:text-red-700 cursor-pointer"
						/>
					) : (
						<Send
							role="button"
							aria-label="Send message"
							onClick={() => sendMessage(draft.text)}
							className="absolute bottom-0 right-0 w-6 h-6 m-2 text-sky-500 hover:text-sky-700 cursor-pointer"
						/>
					)}
				</div>
			</div>
		</>
	);
});

export default ChatInput;
