// Basic input validation shared across auth routes.
// The frontend also validates, but the API must not trust the client —
// anyone can call these endpoints directly.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

module.exports = { isValidEmail, isValidPassword };