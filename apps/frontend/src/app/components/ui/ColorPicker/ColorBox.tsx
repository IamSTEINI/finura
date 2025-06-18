interface Props {
	children: React.ReactNode;
}

const ColorBox = ({ children }: Props) => {
	return (
        <div className="rounded-xl overflow-hidden border-color cursor-context-menu w-56 h-56 bg-black/10 backdrop-blur-md border absolute mt-2 left-1/2 -translate-x-1/2 p-4">
            {children}
        </div>
	);
};

export default ColorBox