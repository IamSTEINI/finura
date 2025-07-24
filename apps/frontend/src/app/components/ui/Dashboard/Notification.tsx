import React from "react";
import TimestampToTime from "../../utils/timestampToTime";
import { MailCheck, Trash } from "lucide-react";

interface NotificationProps {
	author: string;
	time: string;
	content: string;
	id: string;
	markAsRead?: (id: string) => void;
	deleteMail?: (id: string) => void;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Notification: React.FC<NotificationProps> = ({
	author,
	time,
	content,
	id,
	markAsRead,
	deleteMail,
	onClick,
}) => {
	return (
		<div
			className="w-full max-h-[60px] min-h-[60px] border-b flex flex-col pt-1 overflow-hidden select-none cursor-pointer hover:backdrop-brightness-90 px-2"
			style={{ borderColor: "var(--seperator-color)" }}
			onClick={onClick}>
			<div className="flex flex-row justify-between items-center translate-y-1">
				<div className="font-bold text-md">{author}</div>
				<div className="text-sm italic mr-1 opacity-50">
					<TimestampToTime timestamp={time} />
				</div>
			</div>
			<div className="flex flex-row justify-between items-center mt-1.5">
				<div className="opacity-50 w-full truncate truncate max-w-[80%]">
					{content}
				</div>
				<div className="w-fit flex flex-row items-center justify-center">
					<button
						onClick={(e) => {
							e.stopPropagation();
							if (deleteMail) {
								deleteMail(id);
							}
						}}
						style={{
							padding: "4px 7px 4px 7px",
							backgroundColor: "transparent",
						}}
						className="-translate-y-1 opacity-50 hover:opacity-100">
						<Trash size={16} className="mt-1 dashboard-text" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							if (markAsRead) {
								markAsRead(id);
							}
						}}
						style={{
							padding: "4px 7px 4px 7px",
							backgroundColor: "transparent",
						}}
						className="-translate-y-1 opacity-50 hover:opacity-100">
						<MailCheck size={16} className="mt-1 dashboard-text" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default Notification;
