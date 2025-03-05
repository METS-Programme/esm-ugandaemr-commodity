import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import { launchAddOrEditDialog } from '../stock-operation.utils';
import { useStockOperation } from '../stock-operations.resource';

interface StockOperationRelatedLinkProps {
  stockOperationUuid: string;
  operationNumber: string;
}

const StockOperationRelatedLink: React.FC<StockOperationRelatedLinkProps> = ({
  stockOperationUuid,
  operationNumber,
}) => {
  const { error, isLoading, types } = useStockOperationTypes();
  const {
    error: stockOperationError,
    isLoading: isStockOperationLoading,
    items: stockOperation,
  } = useStockOperation(stockOperationUuid);
  const { t } = useTranslation();

  const handleEdit = useCallback(() => {
    const operationType = types?.results?.find((op) => op?.uuid === stockOperation?.operationTypeUuid);
    if (!operationType) {
      return;
    }
    launchAddOrEditDialog(t, operationType, stockOperation, false);
  }, [types, stockOperation, t]);

  if (isLoading || error || stockOperationError || isStockOperationLoading) return null;
  return (
    <span onClick={handleEdit} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
      {operationNumber}
    </span>
  );
};

export default StockOperationRelatedLink;
