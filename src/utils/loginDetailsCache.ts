const LOGIN_KEY = "unique-key";

interface JWT {
  expiresAt: number;
}

const getDetails = (): JWT | null => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(LOGIN_KEY) || "null");
  }
  return null;
};

const saveDetails = (jwt: JWT) => {
  return localStorage.setItem(LOGIN_KEY, JSON.stringify(jwt));
};

const deleteDetails = () => {
  return localStorage.removeItem(LOGIN_KEY);
};

export const loginDetailsCache = {
  get: getDetails,
  set: saveDetails,
  del: deleteDetails,
};
