import { create } from "zustand";

type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
  show: boolean;
  openToast: (message: string, type?: ToastType) => void;
  closeToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  type: "info",
  show: false,

  openToast: (message, type = "info") =>
    set({
      message,
      type,
      show: true,
    }),

  closeToast: () =>
    set({
      show: false,
      message: "",
    }),
}));