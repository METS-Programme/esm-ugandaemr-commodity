import React from 'react';

import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { DeliveryTruck } from '@carbon/react/icons';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { launchAddOrEditDialog } from '../stock-operation.utils';

interface StockOperationIssueStockButtonProps {
  operation: StockOperationDTO;
}

const StockOperationIssueStockButton: React.FC<StockOperationIssueStockButtonProps> = ({ operation }) => {
  const { t } = useTranslation();
  const type: StockOperationType = {
    uuid: '',
    name: 'Stock Issue',
    description: '',
    operationType: 'stockissue',
    hasSource: false,
    sourceType: 'Location',
    hasDestination: false,
    destinationType: 'Location',
    hasRecipient: false,
    recipientRequired: false,
    availableWhenReserved: false,
    allowExpiredBatchNumbers: false,
    stockOperationTypeLocationScopes: [],
    creator: undefined,
    dateCreated: undefined,
    changedBy: undefined,
    dateChanged: undefined,
    dateVoided: undefined,
    voidedBy: undefined,
    voidReason: '',
    voided: false,
  };

  const modifiedOperation = addRequisitionStockOperation(operation);
  const handleButtonClick = () => {
    launchAddOrEditDialog(t, type, modifiedOperation, false);
  };

  return (
    <Button onClick={handleButtonClick} kind="tertiary" renderIcon={(props) => <DeliveryTruck size={16} {...props} />}>
      {t('issueStock', 'Issue Stock ')}
    </Button>
  );
};
function addRequisitionStockOperation(stockOperation) {
  const { uuid } = stockOperation;
  return {
    ...stockOperation,
    requisitionStockOperationUuid: uuid,
  };
}

export default StockOperationIssueStockButton;
