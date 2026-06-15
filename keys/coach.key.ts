// ─── Query key factories ────────────────────────────────────────────────────
// Centralised query keys for all domains (except auth which already has its own)

export const coachKey = {
  all: ["coaches"] as const,
  lists: () => [...coachKey.all, "list"] as const,
  detail: (id: string) => [...coachKey.all, "detail", id] as const,
};

export const schoolKey = {
  all: ["schools"] as const,
  lists: () => [...schoolKey.all, "list"] as const,
  detail: (id: string) => [...schoolKey.all, "detail", id] as const,
};

export const athleteKey = {
  all: ["athletes"] as const,
  lists: () => [...athleteKey.all, "list"] as const,
  detail: (id: string) => [...athleteKey.all, "detail", id] as const,
};

export const financeKey = {
  all: ["finances"] as const,
  lists: () => [...financeKey.all, "list"] as const,
  detail: (id: string) => [...financeKey.all, "detail", id] as const,
};

export const mediaKey = {
  all: ["media"] as const,
  lists: () => [...mediaKey.all, "list"] as const,
};

export const reportKey = {
  all: ["reports"] as const,
  monthly: (year: number, month: number) =>
    [...reportKey.all, "monthly", year, month] as const,
};

export const statisticsKey = {
  all: ["statistics"] as const,
  summary: () => [...statisticsKey.all, "summary"] as const,
};