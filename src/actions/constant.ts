const BASE_URL = process.env.NODE_ENV === "development" ? "https://traillms.vercel.app" : process.env.NEXTAUTH_URL;
const BASE_URL_API = `${BASE_URL}/api`;

// https://ai-lms-nine.vercel.app
export { BASE_URL, BASE_URL_API };

// export const BASE_URL_API_AUTH = `${BASE_URL_API}/auth`;
// export const BASE_URL_API_USER = `${BASE_URL_API}/user`;
// export const BASE_URL_API_COURSE = `${BASE_URL_API}/course`;
// export const BASE_URL_API_COURSE_GRID = `${BASE_URL_API_COURSE}/grid`;
// export const BASE_URL_API_COURSE_SINGLE = `${BASE_URL_API_COURSE}/single`;
// export const BASE_URL_API_BLOG = `${BASE_URL_API}/blog`;
// export const BASE_URL_API_BLOG_SINGLE = `${BASE_URL_API_BLOG}/single`;
// export const BASE_URL_API_BLOG_GRID = `${BASE_URL_API_BLOG}/grid`;
// export const BASE_URL_API_CONTACT = `${BASE_URL_API}/contact`;
// export const BASE_URL_API_CONTACT_DARK = `${BASE_URL_API}/contact-dark`;
// export const BASE_URL_API_PASS = `${BASE_URL_API}/pass`;
// export const BASE_URL_API_PASS_ACTIVATE = `${BASE_URL_API_PASS}/activate`;
