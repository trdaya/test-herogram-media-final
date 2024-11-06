import apiClient from '../constants/apiClient';
import { ROUTES } from '../constants/routes';
import { LocalStorageTokenEnum } from '../constants/tokens';

export const refreshAccessToken = async (signal?: AbortSignal) => {
  try {
    const response = await apiClient.post(
      `/api/v1/auth/refresh-access-token`,
      {},
      { signal }
    );

    const { accessToken } = response.data;
    localStorage.setItem(LocalStorageTokenEnum.accessToken, accessToken);
    return accessToken;
  } catch (error) {
    console.error('Failed to refresh access token', error);

    localStorage.removeItem(LocalStorageTokenEnum.accessToken);
    window.location.href = ROUTES.SIGN_IN;
    return null;
  }
};
