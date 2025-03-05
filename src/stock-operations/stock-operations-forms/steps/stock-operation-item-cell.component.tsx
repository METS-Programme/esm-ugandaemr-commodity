import React, { useCallback, useEffect } from 'react';
import { useStockItem } from '../../../stock-items/stock-items.resource';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';
import { StockItemDTO } from '../../../core/api/types/stockItem/StockItem';
import { URL_STOCK_ITEM } from '../../../constants';
import { Link } from 'react-router-dom';

type StockOperationItemCellProps = {
  stockItemUuid: string;
};

const StockOperationItemCell: React.FC<StockOperationItemCellProps> = ({ stockItemUuid }) => {
  const { isLoading, error, item } = useStockItem(stockItemUuid);
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      showSnackbar({
        kind: 'error',
        title: t('stockItemError', 'Error loading stock item'),
        subtitle: error?.message,
      });
    }
  }, [error, t]);

  if (isLoading) return <InlineLoading status="active" iconDescription="Loading" />;
  if (error) return <>--</>;

  return (
    <Link target={'_blank'} to={URL_STOCK_ITEM(stockItemUuid)}>
      {(item as StockItemDTO)?.commonName || 'No name available'}
    </Link>
  );
};

export default StockOperationItemCell;
