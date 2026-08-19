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
		<div className="w-screen h-screen bg-gradient-to-bl from-red-200 to-sky-200 flex flex-col">
			<main className="flex-1 min-h-0">
				<div className="h-full w-[80%] max-w-2xl mx-auto flex items-center">
					<div className="w-full">
						<h1 className="bg-gradient-to-r from-pink-500 via-pink-500 to-violet-800 inline-block text-transparent bg-clip-text font-normal text-5xl leading-tight">
							Hello there,
						</h1>

						<br />

						<h1 className="bg-gradient-to-r from-blue-500 via-pink-500 to-violet-800 inline-block text-transparent bg-clip-text font-normal text-5xl -mt-2 mb-2 leading-tight">
							How can I help you?
						</h1>

						<p className="text-neutral-500 leading-tight tracking-tight mb-6 text-lg">
							Use one of the most common prompts below <br />
							or chat with us directly by typing your question in the input box below.
						</p>

						<Cards onSelect={handleCardSelect} />
					</div>
				</div>
			</main>

			<div className="shrink-0 w-[80%] max-w-2xl mx-auto pb-4">
				<ChatInput ref={chatRef} />
			</div>
		</div>
	);
}
