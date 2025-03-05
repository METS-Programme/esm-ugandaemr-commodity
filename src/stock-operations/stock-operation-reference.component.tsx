import { InlineLoading } from '@carbon/react';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockOperationTypes } from '../stock-lookups/stock-lookups.resource';
import { launchAddOrEditDialog } from './stock-operation.utils';
import { useStockOperation } from './stock-operations.resource';
import { showSnackbar } from '@openmrs/esm-framework';

interface StockOperationReferenceProps {
  operationUuid: string;
  operationNumber: string;
}

const StockOperationReference = ({ operationNumber, operationUuid }: StockOperationReferenceProps) => {
  const { t } = useTranslation();
  const { types, isLoading: istypesLoading, error: typesError } = useStockOperationTypes();
  const {
    items: stockOperation,
    error: stockOperationError,
    isLoading: isStockOperationloading,
  } = useStockOperation(operationUuid ?? null);

  const handleEdit = useCallback(() => {
    const operationType = types.results?.find((op) => op?.uuid === stockOperation?.operationTypeUuid);
    if (!operationType) {
      return;
    }
    launchAddOrEditDialog(t, operationType, stockOperation, false);
  }, [stockOperation, t, types.results]);

  useEffect(() => {
    if (stockOperationError) {
      showSnackbar({
        title: t('errorLoadingStockOperation', 'Error loading stock operation'),
        subtitle: stockOperationError?.message,
        kind: 'error',
      });
    }
    if (typesError) {
      showSnackbar({
        title: t('errorLoadingStockOperationTypes', 'Error loading stock operation types'),
        subtitle: typesError?.message,
        kind: 'error',
      });
    }
  }, [stockOperationError, typesError, t]);

  if (istypesLoading || isStockOperationloading) {
    return <InlineLoading description={t('loading', 'Loading')} />;
  }

  return (
    <a onClick={handleEdit} style={{ cursor: 'pointer' }}>
      {operationNumber}
    </a>
  );
};

export default StockOperationReference;
