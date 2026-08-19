import { MessageType, MessageUserType } from "./MessageContainer";

export default function Message({ message }: { message: MessageType }) {
    if (message.type === MessageUserType.USER) {
        return (
            <div className="flex justify-end">
                <div className="bg-[#333333] px-3 py-2 text-white rounded-2xl rounded-br-none shadow-md">
                    <p>{message.text}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <div className="bg-gradient-to-bl from-red-200 to-sky-200 px-3 py-2 text-gray-700 rounded-2xl rounded-bl-none shadow-md">
                <p>{message.text}</p>
            </div>
        </div>
    );
}
