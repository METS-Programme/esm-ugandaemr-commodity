import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  NumberInput,
  Stack,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, formatForDatePicker, today } from '../../../constants';
import { operationFromString, StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { useStockItem } from '../../../stock-items/stock-items.resource';
import { BaseStockOperationItemFormData, getStockOperationItemFormSchema } from '../../validation-schema';
import useOperationTypePermisions from '../hooks/useOperationTypePermisions';
import BatchNoSelector from '../input-components/batch-no-selector.component';
import QtyUomSelector from '../input-components/quantity-uom-selector.component';
import styles from './stock-item-form.scss';

export interface StockItemFormProps {
  stockOperationType: StockOperationType;
  stockOperationItem: BaseStockOperationItemFormData;
  onSave?: (data: BaseStockOperationItemFormData) => void;
}

interface Props extends DefaultWorkspaceProps, StockItemFormProps {}
const StockItemForm: React.FC<Props> = ({ closeWorkspace, stockOperationType, stockOperationItem, onSave }) => {
  const operationType = useMemo(() => {
    return operationFromString(stockOperationType.operationType);
  }, [stockOperationType]);
  const formschema = useMemo(() => {
    return getStockOperationItemFormSchema(operationType);
  }, [operationType]);
  const operationTypePermision = useOperationTypePermisions(stockOperationType);

  const fields = formschema.keyof().options;
  const form = useForm<z.infer<typeof formschema>>({
    resolver: zodResolver(formschema),
    defaultValues: stockOperationItem,
    mode: 'all',
  });
  const { t } = useTranslation();
  const { item } = useStockItem(form.getValues('stockItemUuid'));
  const onSubmit = (data: z.infer<typeof formschema>) => {
    onSave?.(data);
    closeWorkspace();
    // Implementation of adding or updating itsms in items table
  };
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        {item?.commonName && <p className={styles.title}>{item?.commonName}</p>}

        {(operationTypePermision.requiresActualBatchInfo || operationTypePermision.requiresBatchUuid) &&
          fields.includes('batchNo' as any) && (
            <Column>
              <Controller
                control={form.control}
                defaultValue={stockOperationItem?.batchNo}
                name={'batchNo' as any}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    {...field}
                    maxLength={50}
                    invalidText={error?.message}
                    invalid={error?.message}
                    placeholder={t('batchNumber', 'Batch Number')}
                    labelText={t('batchNumber', 'Batch Number')}
                  />
                )}
              />
            </Column>
          )}

        {operationTypePermision.requiresBatchUuid && !operationTypePermision.requiresActualBatchInfo && (
          <Column>
            <Controller
              control={form.control}
              name={'stockBatchUuid' as any}
              render={({ field, fieldState: { error } }) => (
                <BatchNoSelector
                  intiallvalue={stockOperationItem?.stockBatchUuid}
                  onValueChange={field.onChange}
                  stockItemUuid={stockOperationItem.stockItemUuid}
                  error={error?.message}
                />
              )}
            />
          </Column>
        )}
        {(operationTypePermision.requiresActualBatchInfo || operationTypePermision.requiresBatchUuid) &&
          fields.includes('expiration' as any) && (
            <Column>
              <Controller
                control={form.control}
                name={'expiration' as any}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    id={`expiration`}
                    datePickerType="single"
                    minDate={formatForDatePicker(today())}
                    locale="en"
                    className={styles.datePickerInput}
                    dateFormat={DATE_PICKER_CONTROL_FORMAT}
                    {...field}
                    onChange={([newDate]) => {
                      field.onChange(newDate);
                    }}
                  >
                    <DatePickerInput
                      autoComplete="off"
                      id={`expiration-input`}
                      name="operationDate"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText={t('expiriation', 'Expiration Date')}
                      invalid={error?.message}
                    />
                  </DatePicker>
                )}
              />
            </Column>
          )}

        <Column>
          <Controller
            control={form.control}
            name="quantity"
            render={({ field, fieldState: { error } }) => (
              <NumberInput
                allowEmpty
                className="small-placeholder-text"
                disableWheel
                hideSteppers
                id={`qty`}
                {...field}
                label={t('qty', 'Qty')}
                invalidText={error?.message}
                invalid={error?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name={'stockItemPackagingUOMUuid'}
            render={({ field, fieldState: { error } }) => (
              <QtyUomSelector
                stockItemUuid={stockOperationItem?.stockItemUuid}
                intiallvalue={field.value}
                error={error?.message}
                onValueChange={field.onChange}
              />
            )}
          />
        </Column>

        {operationTypePermision?.canCaptureQuantityPrice && fields.includes('purchasePrice' as any) && (
          <Column>
            <Controller
              control={form.control}
              name={'purchasePrice' as any}
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  {...field}
                  labelText={t('purchasePrice', 'Purchase Price')}
                  invalid={error?.message}
                  invalidText={error?.message}
                  id={`purchaseprice`}
                  placeholder={t('purchasePrice', 'Purchase Price')}
                />
              )}
            />
          </Column>
        )}
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StockItemForm;
