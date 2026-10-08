import { apiPost } from "./api";

const TOKEN_KEY = "examo_token";
const USER_KEY = "examo_user";

const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

function getValue(object, ...keys) {
  if (!object) return null;
  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }
  return null;
}

function normalizeAuthResponse(response) {
  const nestedData = getValue(response, "data", "Data");
  const token =
    getValue(response, "token", "Token", "accessToken", "AccessToken") ||
    getValue(nestedData, "token", "Token", "accessToken", "AccessToken");

  const user =
    getValue(response, "user", "User") ||
    getValue(nestedData, "user", "User") ||
    (nestedData && !token ? nestedData : null) ||
    null;

  return { token, user };
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function saveSession(token, user, remember = true) {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user || {}));
}

export async function login(identifier, password, remember = true) {
  const response = await apiPost("/Auth/login", {
    identifier: identifier.trim(),
    password,
  });

  const { token, user } = normalizeAuthResponse(response);

  if (!token) {
    throw new Error("Login successful, but authentication token was not returned.");
  }

  saveSession(
    token,
    user || { email: identifier.trim() },
    remember
  );

  return { token, user };
}

export async function register({
  firstName,
  lastName,
  mobileNumber,
  email,
  password,
}) {
  const first = firstName.trim();
  const last = lastName.trim();
  const mobile = mobileNumber.trim();

  const response = await apiPost("/Auth/register", {
    fullName: `${first} ${last}`.trim(),
    studentId: mobile, // Backend RegisterDto StudentId mapped to Mobile Number
    email: email.trim(),
    password,
  });

  const { token, user } = normalizeAuthResponse(response);

  if (token) {
    saveSession(token, user, true);
  }

  return {
    ...(response && typeof response === "object" ? response : {}),
    token,
    user,
  };
}

export function logout() {
  clearSession();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const value = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

function getTokenPayload() {
  const token = getToken();
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getRoles(user) {
  const fromUser = getValue(user, "role", "Role");
  if (fromUser) {
    return Array.isArray(fromUser) ? fromUser : [fromUser];
  }

  const payload = getTokenPayload();
  const fromToken = getValue(payload, "role", "roles", CLAIM_ROLE) || [];
  return Array.isArray(fromToken) ? fromToken : [fromToken];
}

export function isAdmin(user) {
  return getRoles(user).some(
    (role) => String(role).toLowerCase() === "admin"
  );
}

export function getRoleLabel(user) {
  return isAdmin(user) ? "Admin" : "Student";
}

export function getDisplayName(user) {
  const fullName = getValue(user, "fullName", "FullName", "name", "Name");
  if (fullName) return String(fullName);

  const firstName = getValue(user, "firstName", "FirstName") || "";
  const lastName = getValue(user, "lastName", "LastName") || "";
  const combinedName = `${firstName} ${lastName}`.trim();
  
  if (combinedName) return combinedName;

  const payload = getTokenPayload();
  const tokenName = getValue(
    payload,
    "name",
    "fullName",
    "unique_name",
    "given_name",
    CLAIM_NAME
  );
  if (tokenName) return String(tokenName);

  const email =
    getValue(user, "email", "Email") ||
    getValue(payload, "email", CLAIM_EMAIL);
    
  if (email) return String(email).split("@")[0];

  return "Student";
}

export function getFirstName(user) {
  return getDisplayName(user).split(" ")[0];
}