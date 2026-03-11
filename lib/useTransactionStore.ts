"use client";

import { create } from "zustand";

export type TxStatus = "loading" | "pending" | "success" | "error";

interface TxState {
  open: boolean;
  hash?: string;
  status?: TxStatus;
  message?: string;

  openModal: (data: {
    status: TxStatus;
    message: string;
    hash?: string;
  }) => void;

  close: () => void;
}

export const useTransactionStore = create<TxState>((set) => ({
  open: false,
  hash: undefined,
  status: undefined,
  message: undefined,

  openModal: ({ status, message, hash }) =>
    set({
      open: true,
      status,
      message,
      hash,
    }),

  close: () =>
    set({
      open: false,
      hash: undefined,
      status: undefined,
      message: undefined,
    }),
}));