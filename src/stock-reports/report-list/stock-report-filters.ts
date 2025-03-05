import { ResourceFilterCriteria, toQueryParams } from '../../core/api/api';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface StockReportFilter extends ResourceFilterCriteria {
  status?: string | null | undefined;
  operationTypeUuid?: string | null | undefined;
  locationUuid?: string | null | undefined;
  isLocationOther?: boolean | null | undefined;
  stockItemUuid?: string | null | undefined;
  reportRequestedDateMin?: string | null | undefined;
  reportRequestedDateMax?: string | null | undefined;
  reportCompletedDateMin?: string | null | undefined;
  reportCompleteDateMax?: string | null | undefined;
}

export function useStockReports(filter: StockReportFilter) {
  const apiUrl = `${restBaseUrl}/stockmanagement/reports${toQueryParams(filter)}`;

  const { data, error, isLoading } = useSWR(apiUrl, openmrsFetch);

  return {
    items: data?.data || { results: [], totalCount: 0 },
    isLoading,
    error,
  };
}
