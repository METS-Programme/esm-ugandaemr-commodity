import { Button, Column, InlineLoading, RadioButton, RadioButtonGroup, Stack } from '@carbon/react';
import { Departure, ListChecked, Save, SendFilled } from '@carbon/react/icons';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import React, { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { extractErrorMessagesFromResponse } from '../../../constants';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationItemDTO } from '../../../core/api/types/stockOperation/StockOperationItemDTO';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { otherUser } from '../../../core/utils/utils';
import { handleMutate } from '../../../utils';
import { showActionDialogButton } from '../../stock-operation.utils';
import { createStockOperation, deleteStockOperationItem, updateStockOperation } from '../../stock-operations.resource';
import { StockOperationItemDtoSchema } from '../../validation-schema';
import useOperationTypePermisions from '../hooks/useOperationTypePermisions';
import styles from '../stock-operation-form.scss';

type StockOperationSubmissionFormStepProps = {
  onPrevious?: () => void;
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};
const StockOperationSubmissionFormStep: React.FC<StockOperationSubmissionFormStepProps> = ({
  onPrevious,
  stockOperationType,
  stockOperation,
}) => {
  const { t } = useTranslation();
  const operationTypePermision = useOperationTypePermisions(stockOperationType);
  const editable = useMemo(() => !stockOperation || stockOperation.status === 'NEW', [stockOperation]);
  const form = useFormContext<StockOperationItemDtoSchema>();
  const [approvalRequired, setApprovalRequired] = useState<boolean | null>(stockOperation?.approvalRequired);
  const handleRadioButtonChange = (selectedItem: boolean) => {
    setApprovalRequired(selectedItem);
  };

  const handleSave = useCallback(async () => {
    let result: StockOperationDTO; // To store the result for returning
    await form.handleSubmit(async (formData) => {
      try {
        // Get deleted items (items in stock operation bt not i form data)
        const itemsToDelete =
          stockOperation?.stockOperationItems?.reduce<Array<StockOperationItemDTO>>((prev, curr) => {
            const itemDoNotExistInFormData =
              formData.stockOperationItems.findIndex((item) => item.uuid === curr.uuid) === -1;
            if (itemDoNotExistInFormData) {
              return [...prev, curr];
            }
            return prev;
          }, []) ?? [];
        // Delete them from backend asynchronosely
        const deleted = await Promise.allSettled(itemsToDelete.map((item) => deleteStockOperationItem(item.uuid)));
        // Give delete status on completion
        deleted.forEach((del, index) => {
          showSnackbar({
            kind: del.status === 'rejected' ? 'error' : 'success',
            title:
              del.status === 'rejected'
                ? t('stockoperationItemDeleteError', 'Error deleting stock operation item {{item}}', {
                    item: itemsToDelete[index].commonName,
                  })
                : t('success', 'Success'),
            subtitle:
              del.status === 'rejected'
                ? del.reason?.message
                : t('stockoperationItemDeletSuccess', 'Stock operation item {{item}} deleted succesfully', {
                    item: itemsToDelete[index].commonName,
                  }),
          });
        });
        // construct update payload
        const payload = {
          ...formData,
          // Remove other uuid if responsible person is set to other
          responsiblePersonUuid:
            formData.responsiblePersonUuid === otherUser.uuid ? undefined : formData.responsiblePersonUuid,
          approvalRequired: approvalRequired ? true : false,
          stockOperationItems: [
            ...formData.stockOperationItems.map((item) => ({
              ...item,
              uuid: item.uuid.startsWith('new-item-') ? undefined : item.uuid, // Remove uuid for newly inserted items to avoid foreign key constraint lookup error
            })),
          ],
        };
        const resp = await (stockOperation
          ? updateStockOperation(stockOperation, payload as any)
          : createStockOperation(payload as any));
        result = resp.data; // Store the response data
        handleMutate(`${restBaseUrl}/stockmanagement/stockoperation`);
        showSnackbar({
          isLowContrast: true,
          title: stockOperation
            ? t('editStockOperation', 'Edit stock operation')
            : t('addStockOperation', 'Add stock operation'),
          kind: 'success',
          subtitle: stockOperation
            ? t('stockOperationEdited', 'Stock operation edited successfully')
            : t('stockOperationAdded', 'Stock operation added successfully'),
        });
      } catch (error) {
        const errorMessages = extractErrorMessagesFromResponse(error);
        showSnackbar({
          subtitle: errorMessages.join(', '),
          title: t('errorSavingForm', 'Error on saving form'),
          kind: 'error',
          isLowContrast: true,
        });
        throw error;
      }
    })(); // Call handleSubmit to trigger validation and submission
    return result; // Return the result after handleSubmit completes
  }, [form, stockOperation, t, approvalRequired]);

  const handleComplete = useCallback(() => {
    handleSave().then((operation) => {
      showActionDialogButton('Complete', false, { ...operation, status: 'COMPLETED' });
    });
  }, [handleSave]);
  const handleSubmitForReview = useCallback(() => {
    handleSave().then((operation) => {
      showActionDialogButton('Submit', false, { ...operation, status: 'SUBMITTED' });
    });
  }, [handleSave]);
  const handleDispatch = useCallback(() => {
    handleSave().then((operation) => {
      showActionDialogButton('Dispatch', false, { ...operation, status: 'DISPATCHED' });
    });
  }, [handleSave]);

  return (
    <Stack gap={4} className={styles.grid}>
      <div className={styles.heading}>
        <h4>
          {operationTypePermision?.requiresDispatchAcknowledgement
            ? t('submitAndDispatch', 'Submit/Dispatch')
            : t('submitAndComplete', 'Submit/Complete')}
        </h4>
        <div className={styles.btnSet}>
          {typeof onPrevious === 'function' && (
            <Button kind="secondary" onClick={onPrevious}>
              Previous
            </Button>
          )}
        </div>
      </div>

      <Column>
        <RadioButtonGroup
          name="rbgApprovelRequired"
          legendText={t('doesThisTransactionRequireApproval', 'Does the transaction require approval ?')}
          onChange={handleRadioButtonChange}
          readOnly={!editable}
          valueSelected={approvalRequired === true}
        >
          <RadioButton value={true} id="rbgApprovelRequired-true" labelText={t('yes', 'Yes')} />
          <RadioButton value={false} id="rbgApprovelRequired-false" labelText={t('no', 'No')} />
        </RadioButtonGroup>
      </Column>
      {editable && (
        <Column>
          {approvalRequired != null && (
            <>
              {!operationTypePermision.requiresDispatchAcknowledgement && !approvalRequired && (
                <Button
                  name="complete"
                  type="button"
                  style={{ margin: '4px' }}
                  className="submitButton"
                  kind="primary"
                  onClick={handleComplete}
                  renderIcon={ListChecked}
                >
                  {t('complete', 'Complete')}
                </Button>
              )}
              {operationTypePermision.requiresDispatchAcknowledgement && !approvalRequired && (
                <Button
                  name="dispatch"
                  type="button"
                  style={{ margin: '4px' }}
                  className="submitButton"
                  kind="primary"
                  onClick={handleDispatch}
                  renderIcon={Departure}
                >
                  {form.formState.isSubmitting ? (
                    <InlineLoading description={t('dispatching', 'Dispatching')} />
                  ) : (
                    t('dispatch', 'Dispatch')
                  )}
                </Button>
              )}
              {approvalRequired && (
                <Button
                  name="submit"
                  type="button"
                  style={{ margin: '4px' }}
                  className="submitButton"
                  kind="primary"
                  onClick={handleSubmitForReview}
                  renderIcon={SendFilled}
                >
                  {form.formState.isSubmitting ? (
                    <InlineLoading description={t('submittingForReview', 'Submitting for review')} />
                  ) : (
                    t('submitForReview', 'Submit For Review')
                  )}
                </Button>
              )}
            </>
          )}
          <Button
            name="save"
            type="button"
            className="submitButton"
            style={{ margin: '4px' }}
            disabled={form.formState.isSubmitting}
            kind="secondary"
            onClick={handleSave}
            renderIcon={Save}
          >
            {form.formState.isSubmitting ? <InlineLoading /> : t('save', 'Save')}
          </Button>
        </Column>
      )}
    </Stack>
  );
};

export default StockOperationSubmissionFormStep;
