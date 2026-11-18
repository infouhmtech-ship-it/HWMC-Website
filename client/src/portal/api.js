export async function portalFetch(path, options = {}) {
  const token = localStorage.getItem("hwmc-portal-token");
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "The desk could not complete that.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function portalBlob(path) {
  const token = localStorage.getItem("hwmc-portal-token");
  const response = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = new Error("The saved page could not be opened.");
    error.status = response.status;
    throw error;
  }
  const blob = await response.blob();
  return { url: URL.createObjectURL(blob), type: blob.type };
}

export const roleLabels = {
  owner: "Owner / Administration",
  marketing: "Marketing",
  tender: "Tender / PPRA",
  operations: "Operations",
  field: "Field staff",
  finance: "Finance / Billing",
};

export function money(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-PK")}`;
}
