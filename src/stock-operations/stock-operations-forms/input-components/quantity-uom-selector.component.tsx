import { ComboBox, InlineNotification, SkeletonText } from '@carbon/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StockItemPackagingUOMDTO } from '../../../core/api/types/stockItem/StockItemPackagingUOM';
import { useStockItem } from '../../../stock-items/stock-items.resource';

interface QtyUomSelectorProps {
  stockItemUuid: string;
  intiallvalue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
}

const QtyUomSelector: React.FC<QtyUomSelectorProps> = ({ stockItemUuid, error, intiallvalue, onValueChange }) => {
  const { t } = useTranslation();
  const { isLoading, error: stockItemError, item } = useStockItem(stockItemUuid);
  const initialSelectedItem = useMemo<StockItemPackagingUOMDTO | null>(
    () => (item?.packagingUnits ?? []).find((u) => u.uuid === intiallvalue),
    [item?.packagingUnits, intiallvalue],
  );

  if (isLoading) return <SkeletonText role="progressbar" />;

  if (stockItemError)
    return (
      <InlineNotification
        kind="error"
        title={t('packagingUomError', 'Error loading Stock item')}
        subtitle={stockItemError?.message}
      />
    );

  return (
    <ComboBox
      titleText={t('quantityUom', 'Qty UoM')}
      name={'stockItemPackagingUOMUuid'}
      id={'stockItemPackagingUOMUuid'}
      items={item?.packagingUnits ?? []}
      onChange={(data: { selectedItem?: StockItemPackagingUOMDTO }) => {
        onValueChange?.(data.selectedItem?.uuid);
      }}
      initialSelectedItem={initialSelectedItem}
      itemToString={(s: StockItemPackagingUOMDTO) =>
        s.packagingUomName ? `${s?.packagingUomName} - ${s?.factor} ` : ''
      }
      placeholder={t('filter', 'Filter') + '...'}
      invalid={error}
      invalidText={error}
    />
  );
};

export default QtyUomSelector;
