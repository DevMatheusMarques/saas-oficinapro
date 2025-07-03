"use client"

import { useState, useMemo } from "react"

interface UsePaginationProps {
  data: any[]
  itemsPerPage: number
}

export function usePagination({ data = [], itemsPerPage = 10 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
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

  // Reset to page 1 when data changes significantly
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    totalItems: data.length,
  }
}
