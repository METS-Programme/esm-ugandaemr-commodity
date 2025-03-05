import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import {
  operationFromString,
  OperationType,
  StockOperationType,
  StockOperationTypeHasPrint,
} from '../../core/api/types/stockOperation/StockOperationType';
import StockOperationApprovalButton from '../stock-operations-dialog/stock-operations-approve-button.component';
import StockOperationApproveDispatchButton from '../stock-operations-dialog/stock-operations-approve-dispatch-button.component';
import StockOperationCancelButton from '../stock-operations-dialog/stock-operations-cancel-button.component';
import StockOperationCompleteDispatchButton from '../stock-operations-dialog/stock-operations-completed-dispatch-button.component';
import StockOperationIssueStockButton from '../stock-operations-dialog/stock-operations-issue-stock-button.component';
import StockOperationPrintButton from '../stock-operations-dialog/stock-operations-print-button.component';
import StockOperationRejectButton from '../stock-operations-dialog/stock-operations-reject-button.component';
import StockOperationReturnButton from '../stock-operations-dialog/stock-operations-return-button.component';
import { operationStatusColor } from '../stock-operations.resource';
import useOperationTypePermisions from './hooks/useOperationTypePermisions';
import useStockOperationLinks from './hooks/useStockOperationLinks';
import styles from './stock-operation-form.scss';
import StockOperationRelatedLink from './stock-operation-related-link.component';
import StockOperationStatusRow from '../stock-operation-status/stock-operation-status-row';

type Props = {
  stockOperation: StockOperationDTO;
  stockOperationType: StockOperationType;
};

const StockOperationFormHeader: React.FC<Props> = ({ stockOperationType, stockOperation }) => {
  const operationTypePermision = useOperationTypePermisions(stockOperationType);
  const operationType = useMemo(() => {
    return operationFromString(stockOperationType.operationType);
  }, [stockOperationType]);
  const requisitionOperationUuid = useMemo(() => {
    if (
      stockOperationType?.operationType === OperationType.REQUISITION_OPERATION_TYPE ||
      stockOperation?.operationType === OperationType.REQUISITION_OPERATION_TYPE ||
      stockOperationType?.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE ||
      stockOperation?.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE
    ) {
      return stockOperation.uuid;
    }
    return null;
  }, [stockOperationType, stockOperation]);
  const { error, isLoading, operationLinks } = useStockOperationLinks(requisitionOperationUuid);
  const { t } = useTranslation();
  if (isLoading || error) return null;

  return (
    <div>
      <div className={styles.statusBody}>
        <div className={styles.operationlinkscontainer}>
          <div className={styles.statusLabel}>
            <span className={styles.textHeading}>{t('status', 'Status ')}:</span>
            <span
              style={{
                marginLeft: '2px',
                color: `${operationStatusColor(stockOperation?.status)}`,
              }}
            >
              {stockOperation?.status}
            </span>
          </div>
          <StockOperationStatusRow stockOperation={stockOperation} />
        </div>

        {((!stockOperation.permission?.canEdit &&
          (stockOperation.permission?.canApprove || stockOperation.permission?.canReceiveItems)) ||
          stockOperation.permission?.canEdit ||
          StockOperationTypeHasPrint(operationType) ||
          (stockOperation?.permission?.isRequisitionAndCanIssueStock ?? false) ||
          stockOperation.permission?.isRequisitionAndCanIssueStock) && (
          <div className={styles.actionBtns}>
            <>
              {!stockOperation.permission?.canEdit && stockOperation.permission?.canApprove && (
                <>
                  {!operationTypePermision.requiresDispatchAcknowledgement && (
                    <StockOperationApprovalButton operation={stockOperation} />
                  )}

                  {operationTypePermision.requiresDispatchAcknowledgement && (
                    <StockOperationApproveDispatchButton operation={stockOperation} />
                  )}

                  <StockOperationRejectButton operation={stockOperation} />
                  <StockOperationReturnButton operation={stockOperation} />
                  <StockOperationCancelButton operation={stockOperation} />
                </>
              )}

              {!stockOperation.permission?.canEdit && stockOperation.permission?.canReceiveItems && (
                <>
                  <StockOperationCompleteDispatchButton operation={stockOperation} reason={false} />
                  <StockOperationReturnButton operation={stockOperation} />
                </>
              )}

              {stockOperation.permission?.canEdit && <StockOperationCancelButton operation={stockOperation} />}
              {stockOperation.permission?.isRequisitionAndCanIssueStock && (
                <StockOperationIssueStockButton operation={stockOperation} />
              )}
              {(stockOperation.permission?.isRequisitionAndCanIssueStock ||
                stockOperation.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE ||
                stockOperation.operationType === OperationType.REQUISITION_OPERATION_TYPE ||
                stockOperation.operationType === OperationType.RECEIPT_OPERATION_TYPE ||
                stockOperation.operationType === OperationType.TRANSFER_OUT_OPERATION_TYPE) && (
                <StockOperationPrintButton operation={stockOperation} />
              )}
            </>
          </div>
        )}
      </div>
      {operationLinks && operationLinks.length > 0 && (
        <div className={styles.operationlinkscontainer}>
          <h6 className={styles.relatedTransactionHeader}>Related Transactions:</h6>
          {operationLinks.map(
            (item) =>
              (stockOperation.uuid === item?.parentUuid || stockOperationType?.uuid === item?.parentUuid) && (
                <React.Fragment key={item.uuid}>
                  <span>{item?.childOperationTypeName}</span>
                  <span className={item?.childVoided ? 'voided' : ''}>
                    {' '}
                    {item?.childVoided && item?.childOperationNumber}
                    {!item?.childVoided && (
                      <span className={styles.relatedLink}>
                        <StockOperationRelatedLink
                          stockOperationUuid={item?.childUuid}
                          operationNumber={item?.childOperationNumber}
                        />
                      </span>
                    )}
                  </span>{' '}
                  <span>[{item?.childStatus}]</span>
                </React.Fragment>
              ),
          )}
          <span> </span>
          {operationLinks.map(
            (item) =>
              (stockOperation.uuid === item?.childUuid || stockOperationType.uuid === item?.childUuid) && (
                <React.Fragment key={item.uuid}>
                  <span>{item?.parentOperationTypeName}</span>
                  <span className={item?.parentVoided ? 'voided' : ''}>
                    {' '}
                    {item?.parentVoided && item?.parentOperationNumber}
                    {!item?.parentVoided && (
                      <span className={styles.relatedLink}>
                        <StockOperationRelatedLink
                          stockOperationUuid={item?.parentUuid}
                          operationNumber={item?.parentOperationNumber}
                        />
                      </span>
                    )}
                  </span>{' '}
                  <span>[{item?.parentStatus}]</span>
                </React.Fragment>
              ),
          )}
        </div>
      )}
    </div>
  );
};

export default StockOperationFormHeader;
