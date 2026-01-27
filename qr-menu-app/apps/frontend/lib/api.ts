"use client";

import { useSession } from "next-auth/react";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiOptions<TBody> = {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
};

export function useApiClient() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const request = async <TResponse, TBody = unknown>(
    path: string,
    options: ApiOptions<TBody> = {}
  ): Promise<TResponse> => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Request failed");
    }

    return response.json() as Promise<TResponse>;
  };

  return { request, baseUrl, accessToken };
}
