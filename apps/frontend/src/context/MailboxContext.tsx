"use client";
import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";

export interface Mail {
	author: string;
	message: string;
	timestamp: string;
	author_id?: string;
	read: boolean;
	notificationId: string;
}

interface MailboxContextType {
	mails: Mail[];
	addMail: (mail: {
		author: string;
		message: string;
		authorId: string;
	}) => void;
	markAsRead: (notificationId: string) => void;
	clearMailbox: () => void;
	deleteMail: (notificationId: string) => void;
}

interface MailboxProviderProps {
	children: ReactNode;
}

const MailboxContext = createContext<MailboxContextType | undefined>(undefined);

export const useMailbox = () => {
	const context = useContext(MailboxContext);
	if (!context) {
		throw new Error("useMailbox must be used within a MailboxProvider");
	}
	return context;
};

export const MailboxProvider = ({ children }: MailboxProviderProps) => {
	const [mails, setMails] = useState<Mail[]>(() => {
		if (typeof window !== "undefined") {
			const savedMails = localStorage.getItem("FINURA_MAILBOX");
			return savedMails ? JSON.parse(savedMails) : [];
		}
		return [];
	});

	useEffect(() => {
		localStorage.setItem("FINURA_MAILBOX", JSON.stringify(mails));
	}, [mails]);

	const addMail = (mail: {
		author: string;
		message: string;
		authorId: string;
	}) => {
		const timestamp = Date.now().toString();
		const newMail: Mail = {
			...mail,
			timestamp,
			read: false,
			author_id: mail.authorId || undefined,
			notificationId: `${timestamp}-${Math.random()
				.toString(36)
				.substring(2, 9)}`,
		};
		setMails((prevMails: Mail[]) => [...prevMails, newMail]);
	};

	const markAsRead = (notificationId: string) => {
		setMails((prevMails: Mail[]) => {
			const updatedMails = prevMails.map((mail) => {
				if (mail.notificationId === notificationId) {
					return { ...mail, read: true };
				}
				return mail;
			});
			return updatedMails;
		});
	};

	const clearMailbox = () => {
		setMails([]);
		localStorage.removeItem("FINURA_MAILBOX");
	};

	const deleteMail = (notificationId: string) => {
		setMails((prevMails: Mail[]) =>
			prevMails.filter((mail) => mail.notificationId !== notificationId)
		);
	};

	return (
		<MailboxContext.Provider
			value={{ mails, addMail, markAsRead, clearMailbox, deleteMail }}>
			{children}
		</MailboxContext.Provider>
	);
};
