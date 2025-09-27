import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 1, email: 'test@example.com' });
  const [role, setRole] = useState('instructor'); // DEFAULT TO STUDENT
  const [loading, setLoading] = useState(false);

  // Temporary function to switch roles for testing
  const switchRole = (newRole) => {
    setRole(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}