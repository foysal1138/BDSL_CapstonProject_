const DEFAULT_HTTP_BASE_URL = 'http://localhost:8000';

function normalizeBaseUrl(baseUrl, fallbackUrl) {
    const trimmedUrl = (baseUrl || fallbackUrl).trim();
    return trimmedUrl.endsWith('/') ? trimmedUrl.slice(0, -1) : trimmedUrl;
}

export const API_BASE_URL = normalizeBaseUrl(
    import.meta.env.VITE_API_URL,
    DEFAULT_HTTP_BASE_URL,
);

export const WS_BASE_URL = normalizeBaseUrl(
    import.meta.env.VITE_WS_URL,
    API_BASE_URL.replace(/^http/, 'ws'),
);