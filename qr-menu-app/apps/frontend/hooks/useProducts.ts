"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: {
    id: string;
    name: string;
  };
  imageUrl?: string | null;
  isActive: boolean;
  translations?: Record<string, { name?: string; description?: string }>;
};

type ProductPayload = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string | null;
  imageId?: string | null;
  isActive: boolean;
};

export function useProducts() {
  const { request, accessToken } = useApiClient();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: queryKeys.products(),
    queryFn: () => request<Product[]>("/products"),
    enabled: Boolean(accessToken),
  });

  const createProduct = useMutation({
    mutationFn: (payload: ProductPayload) =>
      request<Product, ProductPayload>("/products", { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products() }),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      request<Product, ProductPayload>(`/products/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products() }),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => request(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products() }),
  });

  const bulkDelete = useMutation({
    mutationFn: (productIds: string[]) =>
      request("/products/bulk/delete", { method: "DELETE", body: { productIds } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products() }),
  });

  const bulkStatus = useMutation({
    mutationFn: ({ productIds, isActive }: { productIds: string[]; isActive: boolean }) =>
      request("/products/bulk/status", { method: "PATCH", body: { productIds, isActive } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products() }),
  });

  const updateTranslations = useMutation({
    mutationFn: ({
      id,
      translations,
    }: {
      id: string;
      translations: Record<string, { name?: string; description?: string }>;
    }) =>
      request(`/products/${id}/translations`, {
        method: "PATCH",
        body: { translations },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products() }),
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error as Error | null,
    refetch: productsQuery.refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDelete,
    bulkStatus,
    updateTranslations,
  };
}
