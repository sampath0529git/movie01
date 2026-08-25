export default {};
export const fetch = typeof window !== 'undefined' ? window.fetch : global.fetch;
export const Headers = typeof window !== 'undefined' ? window.Headers : global.Headers;
export const Request = typeof window !== 'undefined' ? window.Request : global.Request;
export const Response = typeof window !== 'undefined' ? window.Response : global.Response;
