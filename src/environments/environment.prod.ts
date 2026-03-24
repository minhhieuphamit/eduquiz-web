export const environment = {
  production: true,
  apiUrl: '/api/v1',
  apiKey: '__API_KEY__', // Replaced at deploy time via CI/CD
  storageKeys: {
    accessToken: 'eduquiz_access_token',
    refreshToken: 'eduquiz_refresh_token',
    user: 'eduquiz_user',
  },
};
