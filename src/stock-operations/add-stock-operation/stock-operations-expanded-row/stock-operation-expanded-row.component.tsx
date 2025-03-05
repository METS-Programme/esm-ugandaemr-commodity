import { Layer, Row } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import styles from './stock-operation-expanded-row.scss';
import StockItemsTable from './stock-items-table';
import StockOpertationStatus from './stock-operations-status';

interface StockOperationExpandedRowProps {
  model: StockOperationDTO;
}

const StockOperationExpandedRow: React.FC<StockOperationExpandedRowProps> = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <Layer className={styles.statusContainer}>
        <Row className={styles.statusContainerRow}>
          {props.model?.dateCreated && (
            <StockOpertationStatus
              status={t('started', 'Started')}
              statusFilledDate={props.model?.dateCreated.toString()}
              statusFillerFamilyName={props.model?.creatorFamilyName}
              statusFillerGivenName={props.model?.creatorGivenName}
            />
          )}
          {props.model.submittedDate && (
            <StockOpertationStatus
              status={t('submitted', 'Submitted')}
              statusFilledDate={props.model?.submittedDate.toString()}
              statusFillerFamilyName={props.model?.submittedByFamilyName}
              statusFillerGivenName={props.model?.submittedByGivenName}
            />
          )}
          {props.model?.dispatchedDate && (
            <StockOpertationStatus
              status={t('dispatched', 'Dispatched')}
              statusFilledDate={props.model?.dispatchedDate.toString()}
              statusFillerFamilyName={props.model?.dispatchedByFamilyName}
              statusFillerGivenName={props.model?.dispatchedByGivenName}
            />
          )}
          {props.model?.returnedDate && (
            <StockOpertationStatus
              status={t('returned', 'Returned')}
              statusFilledDate={props.model?.returnedDate.toString()}
              statusFillerFamilyName={props.model?.returnedByFamilyName}
              statusFillerGivenName={props.model?.returnedByGivenName}
              extraStatusinfo={<span className={styles.text}>{props.model?.returnReason}</span>}
            />
          )}
          {props.model?.completedDate && (
            <StockOpertationStatus
              status={t('completed', 'Completed')}
              statusFilledDate={props.model?.completedDate.toString()}
              statusFillerFamilyName={props.model?.completedByFamilyName}
              statusFillerGivenName={props.model?.completedByGivenName}
            />
          )}
          {props.model?.status === 'CANCELLED' && (
            <StockOpertationStatus
              status={t('cancelled', 'Cancelled')}
              statusFilledDate={props.model?.cancelledDate.toString()}
              statusFillerFamilyName={props.model?.cancelledByFamilyName}
              statusFillerGivenName={props.model?.cancelledByGivenName}
              extraStatusinfo={<span className={styles.text}>{props.model?.cancelReason}</span>}
            />
          )}
          {props.model?.status === 'REJECTED' && (
            <StockOpertationStatus
              status={t('rejected', 'Rejected')}
              statusFilledDate={props.model?.rejectedDate.toString()}
              statusFillerFamilyName={props.model?.rejectedByFamilyName}
              statusFillerGivenName={props.model?.rejectedByGivenName}
              extraStatusinfo={<span>{props.model?.rejectionReason}</span>}
            />
          )}
        </Row>
        <Row className={styles.statusContainerRow}>
          <StockItemsTable items={props.model.stockOperationItems} />
        </Row>
      </Layer>
    </>
  );
};

export default StockOperationExpandedRow;
