import { showModal, showSnackbar } from '@openmrs/esm-framework';
import React from 'react';
import { TFunction } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { extractErrorMessagesFromResponse } from '../constants';
import { StockOperationDTO } from '../core/api/types/stockOperation/StockOperationDTO';
import { OperationType, StockOperationType } from '../core/api/types/stockOperation/StockOperationType';
import { launchOverlay } from '../core/components/overlay/hook';
import StockOperationForm from './stock-operations-forms/stock-operation-form.component';

export const addOrEditStockOperation = async (
  t: TFunction,
  stockOperation: StockOperationDTO,
  isEditing: boolean,
  operation?: StockOperationType,
) => {
  const payload = stockOperation;
  try {
    if (operation.operationType === 'requisition') {
      delete payload.destinationName;
    }
    if (operation.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE) {
      const stockIssueOpsTypeUuid = '66666666-6666-6666-6666-666666666666';
      delete payload.completedDate;
      delete payload.completedBy;
      delete payload.completedByFamilyName;
      delete payload.completedByGivenName;
      delete payload.operationTypeUuid;
      delete payload.permission;
      delete payload.locked;

      payload['operationTypeUuid'] = stockIssueOpsTypeUuid;
    }
    // const response: FetchResponse<StockOperationDTO> = await (isEditing ? updateStockOperation : createStockOperation)(
    //   payload,
    // );

    // if (response?.data) {
    //   handleMutate(`${restBaseUrl}/stockmanagement/stockoperation`);
    //   showSnackbar({
    //     isLowContrast: true,
    //     title: isEditing
    //       ? t('editStockOperation', 'Edit stock operation')
    //       : t('addStockOperation', 'Add stock operation'),
    //     kind: 'success',
    //     subtitle: isEditing
    //       ? t('stockOperationEdited', 'Stock operation edited successfully')
    //       : t('stockOperationAdded', 'Stock operation added successfully'),
    //   });

    //   closeOverlay();
    // }
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showSnackbar({
      subtitle: errorMessages.join(', '),
      title: t('errorSavingForm', 'Error on saving form'),
      kind: 'error',
      isLowContrast: true,
    });
  }
};

export const launchAddOrEditDialog = (
  t: TFunction,
  operationType: StockOperationType,
  stockOperation?: StockOperationDTO,
  canPrint?: boolean,
) => {
  const printEnabled = canPrint !== undefined ? canPrint : stockOperation?.status === 'COMPLETED';

  launchOverlay(
    stockOperation
      ? t('editOperationTitle', 'Edit {{operationType}}', {
          operationType: stockOperation?.operationTypeName,
        })
      : t('newOperationTitle', 'New: {{operationName}}', {
          operationName: operationType?.name,
        }),
    <StockOperationForm stockOperationType={operationType} stockOperation={stockOperation} />,
  );
};

export const useUrlQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

export function getStockOperationUniqueId() {
  return `${new Date().getTime()}-${Math.random().toString(36).substring(2, 16)}`;
}

export const showActionDialogButton = (title: string, requireReason: boolean, operation: StockOperationDTO) => {
  const dispose = showModal('stock-operation-dialog', {
    title: title,
    operation: operation,
    requireReason: requireReason,
    closeModal: () => dispose(),
  });
};
