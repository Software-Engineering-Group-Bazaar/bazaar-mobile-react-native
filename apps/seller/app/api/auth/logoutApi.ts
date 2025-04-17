import api from "../defaultApi";

export const logoutApi = async (token: string | null) => {
  try {
    if (token) {
      const response = await api.post(
        "/Auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.status;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};
