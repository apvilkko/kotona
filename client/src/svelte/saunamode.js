import { writable } from "svelte/store";

export const active = writable(false);
export const started = writable(null);

export const saunaTo = mode => {
  active.set(mode);
  if (mode) {
    started.set(new Date());
  } else {
    started.set(null);
  }
};
