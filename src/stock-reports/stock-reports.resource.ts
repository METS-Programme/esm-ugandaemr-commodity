import { openmrsFetch, restBaseUrl, usePagination } from '@openmrs/esm-framework';
import { StockReportFilter } from './report-list/stock-report-filters';
import { toQueryParams } from '../core/api/api';
import useSWR from 'swr';
import { ReportType } from './ReportType';
import { useState } from 'react';

export function useReportTypes() {
  const apiUrl = `${restBaseUrl}/stockmanagement/report?v=default`;
  const { data, error, isLoading } = useSWR<{ data: { results: ReportType } }, Error>(apiUrl, openmrsFetch);
  return {
    reportTypes: data?.data?.results ?? [],
    isLoading,
    error,
  };
}

export function useGetReports(filter: StockReportFilter) {
  const apiUrl = `${restBaseUrl}/stockmanagement/batchjob?batchJobType=Report&${toQueryParams(
    filter,
  )}&limit=10&totalCount=true`;

  const { data, error, isLoading, mutate } = useSWR<{ data: { results: any } }, Error>(apiUrl, openmrsFetch, {
    refreshInterval: 1000,
    dedupingInterval: 1000,
  });

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const { goTo, results: paginatedItems, currentPage } = usePagination(data?.data?.results, currentPageSize);

  return {
    reports: data?.data?.results ?? [],
    isLoading,
    error,
    items: paginatedItems,
    totalItems: data?.data?.results?.length,
    currentPage,
    currentPageSize,
    paginatedItems,
    goTo,
    pageSizes,
    setPageSize,
    mutate,
  };
}
