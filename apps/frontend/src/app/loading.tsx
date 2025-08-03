import React from "react";

const Loading: React.FC = () => {
	return (
		<div className="h-screen w-full flex justify-center items-center select-none">
			<div className="flex flex-col justify-center items-center space-y-2">
				<div className="border-[#825494] border-3 animate-spin w-[30px] h-[30px] rounded-full font-bold text-xl text-[#825494]">
					-
				</div>
				<span>Loading</span>
			</div>
		</div>
	);
};

export default Loading;
