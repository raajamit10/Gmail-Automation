import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const fetchMessages = async () => {
  const { data } = await api.get("/messages");
  return data;
};

export const fetchTasks = async (completed) => {
  const { data } = await api.get("/tasks", {
    params: completed === undefined ? {} : { completed },
  });
  return data;
};

export const ingestMessage = async (payload) => {
  const { data } = await api.post("/messages/ingest", payload);
  return data;
};

export const updateTask = async (taskId, payload) => {
  const { data } = await api.patch(`/tasks/${taskId}`, payload);
  return data;
};

export const approveDraft = async (messageId, draft_reply) => {
  const { data } = await api.post(
    `/messages/${messageId}/approve-draft`,
    { draft_reply }
  );
  return data;
};

export const fetchDigest = async () => {
  const { data } = await api.get("/digest");
  return data;
};

export const syncGmail = async () => {
  const { data } = await api.post("/messages/sync-gmail");
  return data;
};

export default api;