import React, {
	useState,
	useRef,
	KeyboardEvent,
	ChangeEvent,
	useEffect,
} from "react";

interface CodeInputProps {
	value?: string;
	onChange?: (value: string) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ value, onChange }) => {
	const [internalCode, setInternalCode] = useState<string[]>(
		Array(6).fill("")
	);
	const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

	const code = value
		? value.padEnd(6, "").split("").slice(0, 6)
		: internalCode;

	useEffect(() => {
		if (value) {
			setInternalCode(value.padEnd(6, "").split("").slice(0, 6));
		}
	}, [value]);

	const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		if (!/^\d*$/.test(inputValue)) return;

		const digit = inputValue.slice(-1);

		const newCode = [...(value ? code : internalCode)];
		newCode[index] = digit;

		if (!onChange) {
			setInternalCode(newCode);
		}

		if (onChange) {
			onChange(newCode.join(""));
		}

		if (digit && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		e: KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	return (
		<div className="flex items-center justify-center gap-4">
			<div className="flex gap-2 font-bold">
				{[0, 1, 2].map((i) => (
					<input
						key={i}
						ref={(el) => {
							inputRefs.current[i] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={code[i]}
						onChange={(e) => handleChange(i, e)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						className="w-16 h-16 text-4xl text-center border-2 rounded-lg focus:border-blue-500 focus:outline-none"
					/>
				))}
			</div>
			<span className="text-4xl font-bold">-</span>
			<div className="flex gap-2 font-bold">
				{[3, 4, 5].map((i) => (
					<input
						key={i}
						ref={(el) => {
							inputRefs.current[i] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={code[i]}
						onChange={(e) => handleChange(i, e)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						className="w-16 h-16 text-4xl text-center border-2 rounded-lg focus:border-blue-500 focus:outline-none"
					/>
				))}
			</div>
		</div>
	);
};

export default CodeInput;
