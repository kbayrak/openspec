"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export type Category = {
  id: string;
  name: string;
  order: number;
  translations?: Record<string, { name?: string }>;
  _count?: {
    products: number;
  };
};

type CategoryPayload = {
  name: string;
  order?: number;
};

export function useCategories() {
  const { request, accessToken } = useApiClient();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => request<Category[]>("/categories"),
    enabled: Boolean(accessToken),
  });

  const createCategory = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      request<Category, CategoryPayload>("/categories", { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      request<Category, CategoryPayload>(`/categories/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => request(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
  });

  const reorderCategories = useMutation({
    mutationFn: (payload: { categories: Array<{ id: string; order: number }> }) =>
      request("/categories/reorder/bulk", { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
  });

  const updateTranslations = useMutation({
    mutationFn: ({
      id,
      translations,
    }: {
      id: string;
      translations: Record<string, { name?: string }>;
    }) =>
      request(`/categories/${id}/translations`, {
        method: "PATCH",
        body: { translations },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error as Error | null,
    refetch: categoriesQuery.refetch,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    updateTranslations,
  };
}
