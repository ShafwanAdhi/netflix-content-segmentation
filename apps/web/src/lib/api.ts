import { useQuery } from "@tanstack/react-query";
import type { components } from "./schema";
export type SegmentationResults = components["schemas"]["SegmentationResults"];
export type TitlePage = components["schemas"]["TitlePage"];
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, init);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const fields = data.field_errors
      ?.map(
        (e: { field: string; message: string }) => `${e.field}: ${e.message}`,
      )
      .join("; ");
    throw new ApiError(
      response.status,
      fields ||
        data.detail ||
        data.message ||
        "The service could not complete this request.",
    );
  }
  return response.json();
}
export const useSegmentation = () =>
  useQuery({
    queryKey: ["segmentation"],
    queryFn: () => request<SegmentationResults>("/tasks/4/results"),
  });
export const useClusterTitles = (
  cluster: string,
  type: string,
  query: string,
  offset: number,
) =>
  useQuery({
    queryKey: ["cluster-titles", cluster, type, query, offset],
    queryFn: () =>
      request<TitlePage>(
        `/tasks/4/titles?${new URLSearchParams({ ...(cluster !== "" ? { cluster } : {}), ...(type ? { content_type: type } : {}), q: query, offset: String(offset), limit: "25" })}`,
      ),
  });
export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
export const modelName = (name: string) =>
  name.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
