import { Brain, ChevronDown, User, Bot } from "lucide-react";
import { MessageUserType, MessageType } from "./MessageContainer";
import { NLPAnalysisCard } from "./NLPAnalysisCard";
import { useT } from "@/lib/i18n/I18nProvider";

type MessageProps = {
	message: MessageType;
	showAnalysis: boolean;
	onToggleAnalysis: () => void;
};

export default function Message({
	message,
	showAnalysis,
	onToggleAnalysis,
}: MessageProps) {
	const t = useT("chat");

	if (message.type === MessageUserType.USER) {
		return (
			<div className="flex flex-col items-end gap-1">
				{/* Technical Log Header */}
				<div className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
					<User className="size-3 text-accent" />
					<span>USER_INPUT // LOG_ID: {message.id.slice(0, 8)}</span>
				</div>

				<div className="flex justify-end w-full">
					<div className="border border-accent/40 bg-surface/90 px-3.5 py-2.5 text-text rounded-none shadow-none max-w-[90%] sm:max-w-[82%]">
						<p className="font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
					</div>
				</div>

				{message.nlpAnalysis && (
					<>
						<div className="self-end mt-0.5">
							<button
								type="button"
								onClick={onToggleAnalysis}
								aria-expanded={showAnalysis}
								aria-label={
									showAnalysis ? t("hideAnalysis") : t("showAnalysis")
								}
								className="group inline-flex items-center gap-1.5 border border-border bg-panel px-2 py-0.5 font-mono text-[10px] text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-none"
							>
								<Brain className="size-3 text-accent" aria-hidden="true" />
								<span className="uppercase">[ {t("nlpShort")} ]</span>
								<ChevronDown
									className={`size-3 transition-transform duration-200 ${
										showAnalysis ? "rotate-180" : ""
									}`}
									aria-hidden="true"
								/>
							</button>
						</div>

						{showAnalysis && (
							<div className="self-end w-full max-w-[98%] sm:max-w-[90%]">
								<NLPAnalysisCard analysis={message.nlpAnalysis} />
							</div>
						)}
					</>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-start gap-1">
			{/* Technical Log Header */}
			<div className="flex items-center gap-1.5 font-mono text-[10px] text-accent">
				<Bot className="size-3 text-accent" />
				<span>AGENT [FOUNDRY_LLM] :: FAQ_GROUNDED</span>
			</div>

			<div className="flex justify-start w-full">
				<div className="border-l-2 border-l-accent border-y border-r border-border bg-panel px-3.5 py-2.5 text-text rounded-none shadow-none max-w-[95%] sm:max-w-[85%]">
					<p className="font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
				</div>
			</div>
		</div>
	);
}
