export interface IAthlete {
  _id: string;
  user: string;
  name: string;
  birthdate: string; // ISO date string
  schools: string[]; // array of School IDs
  imageUrl?: string;
  belt?: "PUTIH" | "KUNING" | "HIJAU" | "BIRU" | "COKLAT" | "HITAM" | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateAthlete {
  user: string;
  name: string;
  birthdate: string | Date;
  schools: string[];
  imageUrl?: string;
  belt?: string | null;
}

export interface IUpdateAthlete {
  name?: string;
  birthdate?: string | Date;
  schools?: string[];
  imageUrl?: string;
  belt?: string | null;
}

export {};
