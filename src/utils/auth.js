export const getUserId = () => {
  try {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      console.warn("❌ No userInfo found in localStorage");
      return null;
    }
    
    const user = JSON.parse(userInfo);
    console.log("📦 User from localStorage:", user);
    
    // Try multiple possible locations
    // Your structure uses "id" (not "_id")
    const id = user?.id || user?._id || user?.user?._id || user?.userId;
    
    if (!id) {
      console.error("❌ User ID not found in userInfo structure:", user);
    } else {
      console.log("✅ Extracted User ID:", id);
    }
    
    return id;
  } catch (error) {
    console.error("❌ Error getting user ID:", error);
    return null;
  }
};

/**
 * Get complete user info
 */
export const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return null;
    return JSON.parse(userInfo);
  } catch (error) {
    console.error("Error parsing userInfo:", error);
    return null;
  }
};

/**
 * Get authentication token
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  const userId = getUserId();
  return !!(token && userId);
};

/**
 * Get user's role
 */
export const getUserRole = () => {
  const user = getUserInfo();
  return user?.role || null;
};

/**
 * Get user's name
 */
export const getUserName = () => {
  const user = getUserInfo();
  return user?.fullName || user?.name || user?.username || null;
};

/**
 * Debug auth - run in console to check
 */
export const debugAuth = () => {
  console.group("🔐 Authentication Debug");
  console.log("Token:", getToken() ? "✅ Present" : "❌ Missing");
  console.log("UserInfo:", getUserInfo());
  console.log("User ID:", getUserId());
  console.log("Is Authenticated:", isAuthenticated());
  console.log("User Role:", getUserRole());
  console.log("User Name:", getUserName());
  console.groupEnd();
};