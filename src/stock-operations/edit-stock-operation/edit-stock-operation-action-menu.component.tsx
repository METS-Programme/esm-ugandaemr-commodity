import React, { useCallback, useEffect, useMemo } from 'react';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { launchAddOrEditDialog } from '../stock-operation.utils';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import useFilteredOperationTypesByRoles from '../stock-operations-forms/hooks/useFilteredOperationTypesByRoles';
import { InlineLoading } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';

interface EditStockOperationActionMenuProps {
  stockOperation: StockOperationDTO;
  showIcon?: boolean;
  showprops?: boolean;
}

const EditStockOperationActionMenu: React.FC<EditStockOperationActionMenuProps> = ({
  stockOperation,
  showIcon = true,
  showprops = true,
}) => {
  const { t } = useTranslation();
  const { error, isLoading, operationTypes } = useFilteredOperationTypesByRoles();
  const activeOperationType = useMemo(
    () => operationTypes?.find((op) => op?.uuid === stockOperation?.operationTypeUuid),
    [operationTypes, stockOperation],
  );

  const handleEdit = useCallback(() => {
    launchAddOrEditDialog(t, activeOperationType, stockOperation, false);
  }, [t, activeOperationType, stockOperation]);

  useEffect(() => {
    if (error) {
      showSnackbar({
        kind: 'error',
        title: t('stockOperationError', 'Error loading stock operation types'),
        subtitle: error?.message,
      });
    }
  }, [error, t]);

  if (isLoading) return <InlineLoading status="active" iconDescription="Loading" />;

  if (error) return <>--</>;

  return (
    <Button
      kind="ghost"
      size="sm"
      onClick={handleEdit}
      iconDescription={t('editStockOperation', 'Edit Stock Operation')}
      renderIcon={showIcon ? Edit : undefined}
    >
      {showprops && stockOperation?.operationNumber}
    </Button>
  );
};

export default EditStockOperationActionMenu;
