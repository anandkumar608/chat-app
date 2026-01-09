import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // ---------------- STATE ----------------
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ---------------- GET USERS ----------------
  getUsers: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/users");

      // ✅ ALWAYS ENSURE ARRAY
      if (Array.isArray(res.data)) {
        set({ users: res.data });
      } else if (Array.isArray(res.data?.users)) {
        set({ users: res.data.users });
      } else {
        set({ users: [] });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load users"
      );
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ---------------- GET MESSAGES ----------------
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load messages"
      );
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ---------------- SEND MESSAGE ----------------
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send message"
      );
    }
  },

  // ---------------- SOCKET SUBSCRIBE ----------------
  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;

      set({ messages: [...get().messages, newMessage] });
    });
  },

  // ---------------- SOCKET UNSUBSCRIBE ----------------
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  // ---------------- SELECT USER ----------------
  setSelectedUser: (selectedUser) =>
    set({
      selectedUser,
      messages: [],
    }),
}));
