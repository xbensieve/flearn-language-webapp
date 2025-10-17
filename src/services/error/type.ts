import type { AxiosError } from "axios";

export interface Error extends AxiosError {
  message: string;
}