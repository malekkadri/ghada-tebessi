const AUTH_TOKEN_KEY = 'vcard-app-token';

export const storeToken = (token: string, persist: boolean): void => {
  try {
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Token storage failed:', error);
    throw new Error('Failed to store token');
  }
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Token retrieval failed:', error);
    return null;
  }
};

export const deleteToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Token removal failed:', error);
  }
};

export const hasValidToken = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      deleteToken();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};