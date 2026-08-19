import { MessageType, MessageUserType } from "./MessageContainer";

export default function Message({ message }: { message: MessageType }) {
    if (message.type === MessageUserType.USER) {
        return (
            <div className="flex justify-end">
                <div className="bg-slate-900 px-4 py-2.5 text-white rounded-2xl rounded-br-md shadow-sm max-w-[80%]">
                    <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
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
