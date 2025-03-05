import { ClickableTile, Search } from '@carbon/react';
import { useDebounce } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StockItemDTO } from '../../../core/api/types/stockItem/StockItem';
import { useStockItems } from '../../stock-item-selector/stock-item-selector.resource';
import styles from './input-components-styles.scss';

type StockItemSearchProps = {
  onSelectedItem?: (stockItem: StockItemDTO) => void;
};

const StockItemSearch: React.FC<StockItemSearchProps> = ({ onSelectedItem }) => {
  const { t } = useTranslation();
  const { isLoading, stockItemsList, setSearchString } = useStockItems({});
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    if (debouncedSearchTerm?.length !== 0) {
      setSearchString(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, setSearchString]);

  const handleOnSearchResultClick = (stockItem: StockItemDTO) => {
    // const itemId = `new-item-${getStockOperationUniqueId()}`;
    // launchWorkspace('stock-operation-stock-items-form', {
    //   workspaceTitle: t('stockItem', 'StockItem'),
    //   id: itemId,

    // });
    onSelectedItem?.(stockItem);
    setSearchTerm('');
    // setValue(`stockItems[${fields.length}].stockItemUuid`, stockItem.uuid);
  };
  return (
    <div className={styles.stockItemSearchContainer}>
      <div style={{ display: 'flex' }}>
        <Search
          size="lg"
          placeholder="Find your items"
          labelText="Search"
          closeButtonLabelText="Clear search input"
          value={searchTerm}
          id="search-1"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {searchTerm && stockItemsList?.length > 0 && (
        <div className={styles.searchResults}>
          {stockItemsList?.slice(0, 5).map((stockItem) => (
            <ClickableTile onClick={() => handleOnSearchResultClick(stockItem)} key={stockItem?.uuid}>
              {stockItem?.commonName}
            </ClickableTile>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockItemSearch;
