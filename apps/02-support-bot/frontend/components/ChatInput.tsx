import { CornerDownLeft, Send, Square, Terminal } from "lucide-react";

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
			<div className="mt-2 shrink-0">
				<div className="relative border border-border bg-panel focus-within:border-accent transition-colors">
					{/* Console Bar Header */}
					<div className="flex items-center justify-between border-b border-border/60 px-3 py-1 font-mono text-[10px] text-muted">
						<div className="flex items-center gap-1.5 text-accent">
							<Terminal className="size-3" />
							<span>INPUT_STREAM // TICKET_ENTRY</span>
						</div>
						<span className="text-[10px]">{value.length} CHARS</span>
					</div>

					<textarea
						ref={textAreaRef}
						value={value}
						onKeyDown={handleKeyDown}
						placeholder={t("inputPlaceholder")}
						onChange={(e) => setValue(e.target.value)}
						disabled={isLoading}
						rows={2}
						className="w-full resize-none border-0 bg-transparent p-3 pr-28 font-mono text-xs text-text placeholder:text-muted/60 outline-none disabled:opacity-50 leading-relaxed"
					/>

					<div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
						{isLoading ? (
							<button
								type="button"
								aria-label={t("stop")}
								onClick={onStop}
								className="inline-flex items-center gap-1.5 border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-red-400 hover:bg-red-500 hover:text-black transition cursor-pointer"
							>
								<Square className="size-3" aria-hidden="true" />
								<span>[ {t("stop")} ]</span>
							</button>
						) : (
							<button
								type="button"
								aria-label={t("send")}
								onClick={submit}
								disabled={!value.trim()}
								className="btn-primary py-1 px-3 text-[11px]"
							>
								<span className="mr-1">[ {t("send")}</span>
								<CornerDownLeft className="size-3" aria-hidden="true" />
								<span>]</span>
							</button>
						)}
					</div>
				</div>

				<p className="mt-1.5 text-center font-mono text-[10px] leading-relaxed text-muted">
					<span className="text-accent/80">[PII_PROTOCOL]: </span>
					{t("privacyNotice")}
				</p>
			</div>
		);
	}
);

export default ChatInput;
