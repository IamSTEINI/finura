"use client";
import { createContext, useContext} from "react";


interface DeveloperContextType {
    devMode: boolean;
}

const DevModeContext = createContext<DeveloperContextType>({
    devMode: false,
});

export const useDevMode = () => useContext(DevModeContext);
