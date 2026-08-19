"use client";

import Cards from "@/components/Cards";
import ChatInput, { ChatInputHandle } from "@/components/ChatInput";
import { useRef } from "react";

export default function HomePage() {
	const chatRef = useRef<ChatInputHandle>(null);

	const handleCardSelect = (question: string) => {
		chatRef.current?.submit(question);
	};

	return (
		<div className="w-screen h-screen bg-white flex flex-col">
			<main className="flex-1 min-h-0">
				<div className="h-full w-[80%] max-w-2xl mx-auto flex items-center">
					<div className="w-full">
						<h1 className="text-slate-900 font-semibold text-5xl leading-tight tracking-tight">
							Hello there,
						</h1>

						<br />

						<h1 className="bg-gradient-to-r from-sky-500 to-pink-500 inline-block text-transparent bg-clip-text font-semibold text-5xl -mt-2 mb-3 leading-tight tracking-tight">
							How can I help you?
						</h1>

						<p className="text-slate-500 leading-relaxed tracking-tight mb-8 text-base max-w-lg">
							Use one of the most common prompts below <br />
							or chat with us directly by typing your question in the input box below.
						</p>

						<Cards onSelect={handleCardSelect} />
					</div>
				</div>
			</main>

			<div className="shrink-0 w-[80%] max-w-2xl mx-auto pb-6">
				<ChatInput ref={chatRef} />
			</div>
		</div>
	);
}
