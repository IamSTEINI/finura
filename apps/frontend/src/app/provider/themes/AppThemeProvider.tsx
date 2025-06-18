import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface AppThemeProviderProps {
    children: ReactNode;
}

const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
    return (
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    );
};

export default AppThemeProvider;