const USER_KEY = 'shuttle_user';

/**
 * Saves user data and sets a 24-hour expiry timestamp.
 * @param {object} userData - The user object from the API ({ id, email, role }).
 */
export const login = (userData) => {
    const expiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours from now
    const session = { ...userData, expiry };
    localStorage.setItem(USER_KEY, JSON.stringify(session));
};

/**
 * Removes the user session from localStorage.
 */
export const logout = () => {
    localStorage.removeItem(USER_KEY);
};

/**
 * Retrieves the current user from localStorage if the session is not expired.
 * @returns {object|null} The user object or null if not logged in or session expired.
 */
export const getCurrentUser = () => {
    const sessionStr = localStorage.getItem(USER_KEY);
    if (!sessionStr) {
        return null;
    }

    const session = JSON.parse(sessionStr);
    const now = new Date().getTime();

    if (now > session.expiry) {
        localStorage.removeItem(USER_KEY);
        return null;
    }

    return session;
};
