import { Send, Square } from "lucide-react";

import {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

import { useT } from "@/lib/i18n/I18nProvider";

export type ChatInputHandle = {
	focus: () => void;
	submit: () => void;
	setValue: (text: string) => void;
};

type ChatInputProps = {
	isLoading?: boolean;
	onSubmit: (text: string) => void;
	onStop: () => void;
};

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
	function ChatInput(
		{ isLoading, onSubmit, onStop },
		ref
	) {
		const t = useT("chat");

		const [value, setValue] = useState("");

		const textAreaRef = useRef<HTMLTextAreaElement>(null);

		const submit = () => {
			const trimmed = value.trim();

			if (!trimmed) return;

			onSubmit(trimmed);

			setValue("");
		};

		useImperativeHandle(ref, () => ({
			focus: () =>
				textAreaRef.current?.focus({
					preventScroll: true,
				}),
			submit: () => submit(),
			setValue: (text: string) => setValue(text),
		}));

		const handleKeyDown = (
			e: React.KeyboardEvent<HTMLTextAreaElement>
		) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				submit();
			}
		};

		return (
			<div className="shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 relative focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-sky-700 dark:focus-within:ring-sky-950">
				<textarea
					ref={textAreaRef}
					value={value}
					onKeyDown={handleKeyDown}
					placeholder={t("inputPlaceholder")}
					onChange={(e) => setValue(e.target.value)}
					disabled={isLoading}
					rows={3}
					className="resize-none text-slate-900 placeholder:text-slate-400 w-full m-4 outline-none border-0 bg-transparent disabled:opacity-60 leading-relaxed pr-14 dark:text-slate-100 dark:placeholder:text-slate-500"
				/>

				{isLoading ? (
					<button
						type="button"
						aria-label={t("stop")}
						onClick={onStop}
						className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
					>
						<Square
							className="w-4 h-4"
							aria-hidden="true"
						/>
					</button>
				) : (
					<button
						type="button"
						aria-label={t("send")}
						onClick={submit}
						disabled={!value.trim()}
						className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
					>
						<Send
							className="w-4 h-4"
							aria-hidden="true"
						/>
					</button>
				)}
			</div>
		);
	}
);

export default ChatInput;
