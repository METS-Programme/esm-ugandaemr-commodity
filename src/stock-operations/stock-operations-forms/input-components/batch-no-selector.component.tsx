import { ComboBox, SelectSkeleton } from '@carbon/react';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StockBatchDTO } from '../../../core/api/types/stockItem/StockBatchDTO';
import { useStockItemBatchInformationHook } from '../../../stock-items/add-stock-item/batch-information/batch-information.resource';
import { useStockItemBatchNumbers } from '../hooks/useStockItemBatchNumbers';

interface BatchNoSelectorProps {
  stockItemUuid: string;
  intiallvalue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
}

const BatchNoSelector: React.FC<BatchNoSelectorProps> = ({ stockItemUuid, error, intiallvalue, onValueChange }) => {
  const { isLoading, stockItemBatchNos } = useStockItemBatchNumbers(stockItemUuid);
  const { t } = useTranslation();

  const { items, setStockItemUuid, isLoading: isLoadingBatchinfo } = useStockItemBatchInformationHook();

  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const stockItemBatchesInfo = useMemo(() => {
    return stockItemBatchNos?.map((item) => {
      const matchingBatch = items?.find((batch) => batch.batchNumber === item.batchNo);
      if (matchingBatch) {
        return {
          ...item,
          quantity: matchingBatch.quantity ?? '',
        };
      }
      return item;
    });
  }, [stockItemBatchNos, items]);

  const filteredBatches = useMemo(() => {
    return stockItemBatchesInfo?.filter((s) => s.quantity !== undefined && s.quantity !== 0);
  }, [stockItemBatchesInfo]);
  const initialSelectedItem = useMemo(
    () => filteredBatches?.find((s) => s.uuid === intiallvalue),
    [filteredBatches, intiallvalue],
  );

  if (isLoading || isLoadingBatchinfo) return <SelectSkeleton role="progressbar" />;

  return (
    <ComboBox
      style={{ flexGrow: '1' }}
      titleText={t('batchNo', 'Batch')}
      name={'stockBatchUuid'}
      id={'stockBatchUuid'}
      items={filteredBatches || []}
      onChange={(data: { selectedItem?: StockBatchDTO }) => {
        onValueChange(data.selectedItem?.uuid);
      }}
      initialSelectedItem={initialSelectedItem}
      itemToString={(s: StockBatchDTO) => (s?.batchNo ? `${s?.batchNo} | Qty: ${s?.quantity ?? 'Unknown'}` : '')}
      placeholder={t('filter', "'Filter") + '...'}
      invalid={error}
      invalidText={error}
    />
  );
};

export default BatchNoSelector;
