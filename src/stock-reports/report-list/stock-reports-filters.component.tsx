import React, { useEffect, useState } from 'react';
import { useConcept } from '../../stock-lookups/stock-lookups.resource';
import { DropdownSkeleton, MultiSelect } from '@carbon/react';
import { ReportFilters } from '../../constants';
import { StockOperationStatusTypes } from '../../core/api/types/stockOperation/StockOperationStatus';
import styles from './stock-reports.scss';

interface StockOperationFiltersProps {
  conceptUuid?: string;
  onFilterChange: (selectedItems: any[], filterType: string) => void;
  filterName: string;
}

const StockReportsFilters: React.FC<StockOperationFiltersProps> = ({ conceptUuid, onFilterChange, filterName }) => {
  const { items, isLoading } = useConcept(conceptUuid);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataItems, setDataItems] = useState([]);

  useEffect(() => {
    setIsDataLoading(true);

    switch (filterName) {
      case ReportFilters.STATUS:
        // Populate the status filter options
        setDataItems(
          StockOperationStatusTypes.map((status) => ({
            uuid: status,
            display: status,
          })),
        );
        break;

      case ReportFilters.LOCATION:
        // Populate the location filter options
        if (items?.answers?.length) {
          setDataItems([...items.answers]);
        }
        break;

      default:
        setDataItems([]);
        break;
    }

    setIsDataLoading(false);
  }, [filterName, isLoading, items?.answers]);

  if (isDataLoading) {
    return <DropdownSkeleton />;
  }

  return (
    <MultiSelect
      className={styles.filtersAlign}
      id={`multiSelect-${filterName}`}
      label={filterName}
      size="md"
      labelInline={true}
      items={dataItems}
      itemToString={(item) => (item ? item.display : 'Not Set')}
      onChange={({ selectedItems }) => {
        if (selectedItems) {
          onFilterChange(
            selectedItems.map((selectedItem) => selectedItem.uuid),
            filterName,
          );
        }
      }}
      placeholder={`Filter by ${filterName}`}
      style={{ minWidth: 'auto', width: 'auto' }}
    />
  );
};

export default StockReportsFilters;
