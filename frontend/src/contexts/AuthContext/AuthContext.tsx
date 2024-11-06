import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../constants/apiClient';
import { ErrorMessageEnum } from '../../constants/errorMessages';
import { ROUTES } from '../../constants/routes';
import { LocalStorageTokenEnum } from '../../constants/tokens';

interface AuthContextProps {
  isLoggedIn: boolean;
  userName: string | null;
  userEmail: string | null;
  isLoading: boolean;
  setAuthState: ({ isLoggedIn }: { isLoggedIn: boolean }) => void;
  logout: () => void;
  fetchProfile: (signal: AbortSignal) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  userName: null,
  userEmail: null,
  isLoading: true,
  setAuthState: () => {},
  logout: () => {},
  fetchProfile: async () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setuserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchProfile = async (signal: AbortSignal) => {
    try {
      const response = await apiClient.get(`/api/v1/users/profile`, {
        signal,
      });

      setUserName(response.data.name);
      setuserEmail(response.data.email);
      setIsLoggedIn(true);
      navigate(ROUTES.APP);
    } catch (error) {
      if (
        (error as unknown as any)?.response?.data?.message ===
        ErrorMessageEnum.INVALID_ACCESS_TOKEN
      ) {
        await refreshAccessToken(signal);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfileWithAbort = async () => {
      await fetchProfile(controller.signal);
    };

    fetchProfileWithAbort();

    return () => {
      controller.abort();
    };
  }, []);

  const refreshAccessToken = async (signal: AbortSignal) => {
    try {
      const { data } = await apiClient.post(
        `/api/v1/auth/refresh-access-token`,
        { signal }
      );
      localStorage.setItem(LocalStorageTokenEnum.accessToken, data.accessToken);

      await fetchProfile(signal);
    } catch (error) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem(LocalStorageTokenEnum.accessToken);
    setIsLoggedIn(false);
    setUserName(null);
    setuserEmail(null);
    navigate(ROUTES.SIGN_IN);
  };

  const setAuthState = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
    setIsLoggedIn(isLoggedIn);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userName,
        userEmail,
        isLoading,
        setAuthState,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
