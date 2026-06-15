import { IAthlete } from "./Athlete";
import { ISchool } from "./School";

export interface IMedia {
  _id: string;
  title: string;
  type: "sertifikat" | "latihan";
  url: string;
  fileId: string;
  athlete?: IAthlete | null;
  school?: ISchool | null;
  uploader?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateMediaPayload {
  title: string;
  type: "sertifikat" | "latihan";
  url: string;
  fileId: string;
  athleteId?: string;
  schoolId?: string;
}
