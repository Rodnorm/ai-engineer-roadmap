import { Brain, ChevronDown } from "lucide-react";
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
			<div className="flex flex-col items-end gap-1.5">
				<div className="flex justify-end">
					<div className="bg-slate-900 px-4 py-2.5 text-white rounded-2xl rounded-br-md shadow-sm max-w-[80%]">
						<p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
					</div>
				</div>

				{message.nlpAnalysis && (
					<>
						<div className="self-end">
							<button
								type="button"
								onClick={onToggleAnalysis}
								aria-expanded={showAnalysis}
								aria-label={
									showAnalysis ? t("hideAnalysis") : t("showAnalysis")
								}
								className="group inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-600 px-2 py-1 rounded-md hover:bg-sky-50/60 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
							>
								<Brain className="w-3.5 h-3.5" aria-hidden="true" />
								<span>{t("nlpShort")}</span>
								<ChevronDown
									className={`w-3.5 h-3.5 transition-transform duration-200 ${
										showAnalysis ? "rotate-180" : ""
									}`}
									aria-hidden="true"
								/>
							</button>
						</div>

						{showAnalysis && (
							<div className="self-end w-full max-w-[95%]">
								<NLPAnalysisCard analysis={message.nlpAnalysis} />
							</div>
						)}
					</>
				)}
			</div>
		);
	}

	return (
		<div className="flex">
			<div className="bg-slate-100 border border-slate-200 px-4 py-2.5 text-slate-800 rounded-2xl rounded-bl-md shadow-sm max-w-[80%]">
				<p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
			</div>
		</div>
	);
}
