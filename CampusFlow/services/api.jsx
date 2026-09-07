export const API_URL = "http://192.168.1.137:5000/api";

// Helper for authorized headers
const authHeader = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// =========================================================================
// 1. GENERAL USER APIS
// =========================================================================

// Browse all campus issues (Public / General User Feed)
export const getAllIssues = async () => {
  const response = await fetch(`${API_URL}/issues`);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch issues");
  }

  return response.json();
};

// Report a new campus issue (General User)
export const createIssue = async (issueData, token) => {
  const response = await fetch(`${API_URL}/issues`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(issueData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit issue");
  }

  return data;
};

// Fetch personal reports submitted by the logged-in user
export const getMyReports = async (token) => {
  const response = await fetch(`${API_URL}/user/issues/my`, {
    method: "GET",
    headers: authHeader(token),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch your reports");
  }

  return data;
};

// Get single issue details
export const getIssueById = async (id) => {
  const response = await fetch(`${API_URL}/issues/${id}`);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch issue details");
  }

  return data;
};

// =========================================================================
// 2. SUPPORT TEAM APIS
// =========================================================================

// Fetch support queue with optional filters (status, category, priority, search)
export const getSupportTickets = async (filters = {}, token) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.priority) queryParams.append("priority", filters.priority);
  if (filters.search) queryParams.append("search", filters.search);

  const url = `${API_URL}/support/tickets?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: authHeader(token),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch support tickets");
  }

  return data;
};

// Update issue status and resolution notes (Support Team & Admin)
export const updateTicketStatus = async (ticketId, { status, resolutionNotes, priority }, token) => {
  const response = await fetch(`${API_URL}/support/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify({ status, resolutionNotes, priority }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to update ticket status");
  }

  return data;
};

// Assign ticket to a support team member
export const assignTicket = async (ticketId, { assignedToId, assignedToName }, token) => {
  const response = await fetch(`${API_URL}/support/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify({ assignedToId, assignedToName }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to assign ticket");
  }

  return data;
};

// =========================================================================
// 3. ADMIN APIS
// =========================================================================

// Fetch platform KPI statistics & metrics (Admin exclusive)
export const getAdminStats = async (token) => {
  const response = await fetch(`${API_URL}/admin/stats`, {
    method: "GET",
    headers: authHeader(token),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch platform statistics");
  }

  return data;
};

// Fetch all registered users with role & search (Admin exclusive)
export const getAdminUsers = async (filters = {}, token) => {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.role) queryParams.append("role", filters.role);

  const url = `${API_URL}/admin/users?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: authHeader(token),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data;
};

// Update user role: 'User' | 'Support' | 'Admin' (Admin exclusive)
export const updateUserRole = async (userId, newRole, token) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify({ role: newRole }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to update user role");
  }

  return data;
};

// Permanent master delete of an issue (Admin exclusive)
export const adminDeleteIssue = async (issueId, token) => {
  const response = await fetch(`${API_URL}/admin/issues/${issueId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete issue");
  }

  return data;
};

// =========================================================================
// 4. AUTH & PROFILE SERVICES
// =========================================================================

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Registration failed. Please try again.");
  }

  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Invalid credentials. Please try again.");
  }

  return data;
};

export const getMe = async (token) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: authHeader(token),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user profile.");
  }

  return data;
};

export const googleAuth = async (googleData) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(googleData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Google authentication failed.");
  }

  return data;
};

export const updateProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify(profileData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile.");
  }

  return data;
};