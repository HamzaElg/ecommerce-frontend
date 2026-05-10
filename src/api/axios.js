import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const clearAuthState = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("auth:logout"));
};

const clearAuthAndRedirect = () => {
  clearAuthState();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const isAuthError = (error) => {
  const status = error.response?.status;
  const code = error.response?.data?.code;
  const message = error.response?.data?.message?.toLowerCase() ?? "";

  if (status === 401) return true;

  if (status === 403) {
    return (
      code === "INVALID_TOKEN" ||
      code === "TOKEN_EXPIRED" ||
      code === "INVALID_REFRESH_TOKEN" ||
      code === "EXPIRED_TOKEN" ||
      message.includes("token") ||
      message.includes("jwt") ||
      message.includes("expired")
    );
  }

  return false;
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const backendError = error.response?.data;
    const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");
    const isLoginOrRegisterRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    if (
      isAuthError(error) &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isLoginOrRegisterRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const authData = refreshResponse.data?.data;

        if (!authData?.accessToken || !authData?.refreshToken) {
          throw new Error("Invalid refresh response from backend.");
        }

        localStorage.setItem("accessToken", authData.accessToken);
        localStorage.setItem("refreshToken", authData.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;

        processQueue(null, authData.accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();

        return Promise.reject({
          status: refreshError.response?.status,
          code: refreshError.response?.data?.code,
          message:
            refreshError.response?.data?.message ||
            refreshError.message ||
            "Session expired. Please login again.",
          original: refreshError,
        });
      } finally {
        isRefreshing = false;
      }
    }

    const normalizedError = {
      status: error.response?.status,
      code: backendError?.code,
      message:
        backendError?.message ||
        error.message ||
        "Something went wrong. Please try again.",
      original: error,
    };

    return Promise.reject(normalizedError);
  }
);

export default api;