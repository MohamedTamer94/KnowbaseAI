import { apiFetch, apiUpload } from "./apiClient";

export async function getTenant() {
    const res = await apiFetch("/tenants/current");
    return await res.json();
}

export async function listDocuments() {
    const res = await apiFetch("/documents");
    return await res.json();
}

export async function askQuery(question) {
    const res = await apiFetch("/documents/query?query=" + encodeURIComponent(question), {method: 'POST'});
    return await res.json();
}

/**
 * Upload a document file or a URL to the backend.
 * Uses centralized apiUpload helper to avoid duplicating auth/base URL logic.
 */
export async function uploadDocument({ file, url }) {
    if (!file && !url) throw new Error('Provide a file or a URL to upload');

    const form = new FormData();
    if (file) form.append('file', file);
    form.append('source', url ?? 'None');
    form.append('type', url ? 'url' : 'pdf'); // TODO: support more types

    const res = await apiUpload('/documents/upload', form);

    return await res.json();
}