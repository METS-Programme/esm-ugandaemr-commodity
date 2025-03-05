import React, { useEffect, useMemo, useState } from 'react';
import styles from '../stock-item-price-details/order-stock-details.scss';
import { SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useOrderItemDetails, useStockItems, StockItemFilter, fetchStockItem } from '../stock-items.resource';
import { CheckmarkOutline, Misuse } from '@carbon/react/icons';
import { ResourceRepresentation } from '../../core/api/api';
import { StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import { StockItemPackagingUOM } from '../../core/api/types/stockItem/StockItemPackagingUOM';

interface OrderStockDetailsComponentProps {
  orderItemUuid: string;
}

const OrderStockDetailsComponent: React.FC<OrderStockDetailsComponentProps> = ({ orderItemUuid }) => {
  const { t } = useTranslation();

  const { item } = useOrderItemDetails(orderItemUuid);

  const [results, setResults] = useState<StockItemDTO[]>([]);

  useEffect(() => {
    if (item && item.uuid) {
      fetchStockItem(item.uuid).then((response) => {
        setResults(response.results);
      });
    }
  }, [item]);

  const isInStock = useMemo(() => {
    if (!results || results.length === 0) return false;

    // Extract the default dispensing unit with factor > 0
    const defaultDispensingUnit = results[0].packagingUnits.find(
      (unit) => unit?.isDefaultStockOperationsUoM && unit?.isDispensingUnit && unit?.factor > 0,
    );

    // Return true if a valid unit with factor > 0 is found
    return !!defaultDispensingUnit;
  }, [results]);

  return (
    <div>
      {isInStock ? (
        <div className={styles.itemInStock}>
          <CheckmarkOutline size={16} className={styles.itemInStockIcon} /> {t('inStock', 'In stock')}
        </div>
      ) : (
        <div className={styles.itemOutOfStock}>
          <Misuse size={16} className={styles.itemOutOfStockIcon} /> {t('outOfStock', 'Out of stock')}
        </div>
      )}
    </div>
  );
};

export default OrderStockDetailsComponent;
