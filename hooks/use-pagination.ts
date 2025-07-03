"use client"

import { useState, useEffect, useMemo } from "react"

interface UsePaginationProps<T> {
  data: T[]
  itemsPerPage: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  paginatedData: T[]
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  totalItems: number
}

export function usePagination<T>({ data, itemsPerPage }: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  const totalPages = useMemo(() => {
    if (!data || data.length === 0) return 1
    return Math.ceil(data.length / itemsPerPage)
  }, [data, itemsPerPage])

  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return []
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const startIndex = data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, data.length)
  const totalItems = data.length

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
  }
}
