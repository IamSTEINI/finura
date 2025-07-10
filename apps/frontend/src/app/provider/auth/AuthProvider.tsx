"use client";
import React, { ReactNode, useEffect, useState } from "react";

interface AuthProviderProps {
	children: ReactNode;
}

// Here we will check if the user ahs a valid JWT token, by sending it to the API TROUGH THE REDIS session proxy
const AuthProvider = ({ children }: AuthProviderProps) => {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    
    useEffect(() => {
        setAuthenticated(true);
    }, []);

    useEffect(() => {
        if (authenticated) {
            const timer = setTimeout(() => setVisible(true), 10);
            return () => clearTimeout(timer);
        }
    }, [authenticated]);

    if (!authenticated)
        return <div className="h-screen w-full flex justify-center items-center select-none">
            <div className="flex flex-col justify-center items-center space-y-2">
                <div className="border-[#825494] border-3 animate-spin w-[30px] h-[30px] rounded-full font-bold text-xl text-[#825494]">-</div>
                <span>Loading</span>
            </div>
        </div>
    
    return (
        <div className={`transition-opacity duration-300 ease-in ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {children}
        </div>
    );
};

export default AuthProvider;
