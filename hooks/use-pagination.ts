"use client"

import { useEffect, useMemo, useState } from "react"

/**
 * Hook genérico para paginação.
 *
 * @param data         Lista de itens a serem paginados.
 * @param itemsPerPage Quantidade de itens por página.
 *
 * @example
 * const {
 *   currentPage,
 *   totalPages,
 *   paginatedData,
 *   goToPage,
 *   goToNextPage,
 *   goToPreviousPage,
 *   hasNextPage,
 *   hasPreviousPage,
 *   totalItems,
 * } = usePagination({ data, itemsPerPage: 10 })
 */
interface UsePaginationProps<T> {
  data: T[]
  itemsPerPage?: number
}

export function usePagination<T>({ data, itemsPerPage = 10 }: UsePaginationProps<T>) {
  // Página atual (1-based).
  const [currentPage, setCurrentPage] = useState(1)

  // Quando a lista de dados muda, volte para a primeira página.
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  // Quantidade total de páginas.
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / itemsPerPage))
  }, [data.length, itemsPerPage])

  // Lista de itens visíveis na página atual.
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return data.slice(start, end)
  }, [currentPage, data, itemsPerPage])

  /* ---- Navegação ---- */
  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  return {
    /* estado */
    currentPage,
    totalPages,
    paginatedData,
    totalItems: data.length,

    /* helpers */
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,

    /* ações */
    goToPage,
    goToNextPage,
    goToPreviousPage,
  }
}
