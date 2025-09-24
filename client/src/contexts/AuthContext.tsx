import { createContext, useState, useContext, type ReactNode } from 'react';

type AuthContextType = {
    accessToken: string | undefined;
    setAccessToken: (token: string | undefined) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | undefined>(import.meta.env.VITE_ACCESS_TOKEN || undefined);
    
    console.log('🔑 AuthProvider: Initial access token from env:', import.meta.env.VITE_ACCESS_TOKEN ? 'SET' : 'UNDEFINED');

    const setAccessTokenWithLogging = (token: string | undefined) => {
        console.log('🔑 AuthContext: Setting access token:', token ? 'SET' : 'CLEARED');
        setAccessToken(token);
    };

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken: setAccessTokenWithLogging }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};