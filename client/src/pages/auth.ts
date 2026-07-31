const ADMIN_AUTH_STORAGE_KEY = "nitobel-admin-auth";

export const isAdminAuthenticated = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true";
};

export const setAdminAuthenticated = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
    return;
  }

  sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
};
