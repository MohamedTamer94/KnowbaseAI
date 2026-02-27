import { apiFetch, apiUpload } from "./apiClient";

export async function getTenant() {
    const res = await apiFetch("/tenants/current");
    return await res.json();
}

export async function getCurrentUser() {
    const res = await apiFetch("/users/me");
    return await res.json();
}

export async function listDocuments() {
    const res = await apiFetch("/documents/");
    return await res.json();
}

export async function register(name, email, password) {
    const res = await apiFetch(`/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });

    return await res.json();
}

export async function login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const res = await apiFetch(`/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    });

    return await res.json();
}

/**
 * Stream query response with callbacks for real-time token, sources, and session updates.
 * @param {string} question - The query question
 * @param {string} sessionId - The chat session ID (from localStorage)
 * @param {Function} onToken - Callback fired for each token chunk received
 * @param {Function} onSources - Callback fired once when sources are received
 * @param {Function} onSessionId - Callback fired once when session_id is received from start event
 */
export async function askQuery(question, sessionId, onToken, onSources, onSessionId) {
  const res = await apiFetch("/documents/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: question,
      session_id: sessionId
    })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;

      const event = JSON.parse(line);

      if (event.type === "start" && event.session_id) {
        onSessionId?.(event.session_id);
      }

      if (event.type === "token") {
        onToken?.(event.data);
      }

      if (event.type === "sources") {
        onSources?.(event.data);
      }
    }
  }
}

/**
 * Fetch chat history for a session from the backend.
 * @param {string} sessionId - The chat session ID
 * @returns {Promise<Array>} Array of messages with role, content, created_at
 */
export async function fetchChatHistory(sessionId) {
  if (!sessionId) return [];
  const res = await apiFetch(`/documents/chat/session/${sessionId}`);
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
    form.append('url', url ?? 'None');
    form.append('type', url ? 'url' : 'pdf'); // TODO: support more types

    const res = await apiUpload(`/documents/${url ? 'crawl' : 'upload'}`, form);

    return await res.json();
}

/**
 * Update a document's name.
 * @param {string} documentId - The document ID
 * @param {string} newName - The new filename
 * @returns {Promise<Object>} Response from backend
 */
export async function updateDocumentName(documentId, newName) {
    const res = await apiFetch(`/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
    });

    return await res.json();
}

/**
 * Delete a document.
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} Response from backend
 */
export async function deleteDocument(documentId) {
    const res = await apiFetch(`/documents/${documentId}`, {
        method: 'DELETE'
    });

    return await res.json();
}

/**
 * Get list of users in current tenant.
 * @returns {Promise<Array>} Array of user objects with id, email, role
 */
export async function getTenantUsers() {
    const res = await apiFetch('/tenants/current/users');
    return await res.json();
}

/**
 * List all tenants the current user is a member of.
 * @returns {Promise<Array>} Array of tenant objects with id, name, role
 */
export async function listUserTenants() {
    const res = await apiFetch('/tenants/');
    return await res.json();
}

/**
 * Switch to a different tenant.
 * @param {string} tenantId - The tenant ID to switch to
 * @returns {Promise<Object>} Response with new access token
 */
export async function switchTenant(tenantId) {
    const res = await apiFetch(`/tenants/switch/${tenantId}`, {
        method: 'POST'
    });
    return await res.json();
}

/**
 * Invite a user to the current tenant (admin only).
 * @param {string} email - The email of the user to invite
 * @returns {Promise<Object>} Response from backend
 */
export async function inviteUserToTenant(email) {

    const res = await apiFetch('/tenants/invite/', {
        method: 'POST',
         body: JSON.stringify({ email }),
    });

    return await res.json();
}

/**
 * Remove a user from the current tenant (admin only).
 * @param {string} email - The email of the user to remove
 * @returns {Promise<Object>} Response from backend
 */
export async function removeUserFromTenant(email) {
    const res = await apiFetch('/tenants/remove', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

    return await res.json();
}

// ========== WIDGET ENDPOINTS ==========

/**
 * Get all widgets for the current tenant.
 * @returns {Promise<Array>} List of widgets
 */
export async function listWidgets() {
    const res = await apiFetch('/widgets');
    return await res.json();
}

/**
 * Create a new widget (admin only).
 * @param {string} name - Widget name
 * @param {Array<string>} allowed_domains - Allowed domains for embedding
 * @returns {Promise<Object>} Created widget with token
 */
export async function createWidget(name, allowed_domains) {
    const res = await apiFetch('/widgets', {
        method: 'POST',
        body: JSON.stringify({ name, allowed_domains }),
    });

    return await res.json();
}

/**
 * Update an existing widget (admin only).
 * @param {string} widget_id - The widget ID
 * @param {string} name - New widget name
 * @param {Array<string>} allowed_domains - New allowed domains
 * @returns {Promise<Object>} Response from backend
 */
export async function updateWidget(widget_id, name, allowed_domains) {
    const res = await apiFetch(`/widgets/${widget_id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, allowed_domains }),
    });

    return await res.json();
}

/**
 * Delete a widget (admin only).
 * @param {string} widget_id - The widget ID to delete
 * @returns {Promise<Object>} Response from backend
 */
export async function deleteWidget(widget_id) {
    const res = await apiFetch(`/widgets/${widget_id}`, {
        method: 'DELETE',
    });

    return await res.json();
}
