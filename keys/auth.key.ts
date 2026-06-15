export const authKey = {
  all: ["auth"],
  me: () => [...authKey.all, "me"],
};