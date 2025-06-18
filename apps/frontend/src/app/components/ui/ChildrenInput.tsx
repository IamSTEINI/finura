import React, { InputHTMLAttributes, ChangeEvent } from "react";

interface ChildrenInputProps extends InputHTMLAttributes<HTMLInputElement> {
    children?: React.ReactNode;
    childPosition?: "left" | "right";
    value?: string | number | readonly string[];
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ChildrenInput: React.FC<ChildrenInputProps> = ({
    children,
    childPosition = "right",
    value,
    onChange,
    ...props
}) => {
    if (children) {
        return (
            <div className="input-wrapper flex items-center gap-x-2">
                {childPosition === "left" && (
                    <div className="w-fit items-center justify-center flex gap-x-2">
                        {children}
                    </div>
                )}
                <input 
                    value={value}
                    onChange={onChange}
                    {...props} 
                    className={`flex-1 ${props.className || ""}`} 
                />
                {childPosition === "right" && (
                    <div className="w-fit items-center justify-center flex gap-x-2">
                        {children}
                    </div>
                )}
            </div>
        );
    }

    return <input value={value} onChange={onChange} {...props} />;
};

export default ChildrenInput;
