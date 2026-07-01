import React, { createContext, useContext, useState } from 'react';

interface SimpleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<SimpleUser | null>(null);

  const loginWithGoogle = async () => {
    // Auth not available in this build
  };

  const logout = async () => {
    // Auth not available in this build
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
