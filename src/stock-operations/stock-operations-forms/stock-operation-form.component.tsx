import { CircleDash } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useEffect, useMemo, useState } from 'react';
import { FieldError, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../../config-schema';
import { today } from '../../constants';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import {
  operationFromString,
  OperationType,
  StockOperationType,
  StockOperationTypeIsStockIssue,
} from '../../core/api/types/stockOperation/StockOperationType';
import { TabItem } from '../../core/components/tabs/types';
import { otherUser, pick } from '../../core/utils/utils';
import ReceivedItems from '../received-items.component';
import {
  getStockOperationFormSchema,
  getStockOperationItemFormSchema,
  StockOperationItemDtoSchema,
} from '../validation-schema';
import useOperationTypePermisions from './hooks/useOperationTypePermisions';
import BaseOperationDetailsFormStep from './steps/base-operation-details-form-step';
import StockOperationItemsFormStep from './steps/stock-operation-items-form-step.component';
import StockOperationSubmissionFormStep from './steps/stock-operation-submission-form-step.component';
import StockOperationFormHeader from './stock-operation-form-header.component';
import StockOperationStepper from './stock-operation-stepper/stock-operation-stepper.component';

/**
 * Props interface for the StockOperationForm component
 * @interface StockOperationFormProps
 * @property {StockOperationType} [stockOperationType] - The stock operation type being created or edited.
 * @property {StockOperationDTO} [stockOperation] - The stock operation data transfer object.
 * When undefined or null, the form will be in creation mode.
 */
type StockOperationFormProps = {
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};

const StockOperationForm: React.FC<StockOperationFormProps> = ({ stockOperation, stockOperationType }) => {
  const { t } = useTranslation();
  const operationType = useMemo(() => {
    return operationFromString(stockOperationType.operationType);
  }, [stockOperationType]);
  const operationTypePermision = useOperationTypePermisions(stockOperationType);
  const stockOperationItemFormSchema = useMemo(() => {
    return getStockOperationItemFormSchema(operationType);
  }, [operationType]);
  const formschema = useMemo(() => {
    return getStockOperationFormSchema(operationType);
  }, [operationType]);
  const steps: TabItem[] = useMemo(() => {
    return [
      {
        name: stockOperation ? `${stockOperationType?.name} Details` : `${stockOperationType?.name} Details`,
        component: (
          <BaseOperationDetailsFormStep
            stockOperation={stockOperation}
            stockOperationType={stockOperationType}
            onNext={() => setSelectedIndex(1)}
          />
        ),
        disabled: true,
      },
      {
        name: t('stockItems', 'Stock Items'),
        component: (
          <StockOperationItemsFormStep
            stockOperation={stockOperation}
            stockOperationType={stockOperationType}
            onNext={() => setSelectedIndex(2)}
            onPrevious={() => setSelectedIndex(0)}
          />
        ),
        disabled: true,
      },
      {
        name: operationTypePermision?.requiresDispatchAcknowledgement ? 'Submit/Dispatch' : 'Submit/Complete',
        component: (
          <StockOperationSubmissionFormStep
            stockOperation={stockOperation}
            stockOperationType={stockOperationType}
            onPrevious={() => setSelectedIndex(1)}
          />
        ),
        disabled: true,
      },
    ].concat(
      StockOperationTypeIsStockIssue(stockOperation?.operationType as OperationType) ||
        stockOperation?.permission.canDisplayReceivedItems
        ? stockOperation.status === 'DISPATCHED' || stockOperation.status === 'COMPLETED'
          ? [
              {
                name: t('receivedItems', 'Received Items'),
                component: <ReceivedItems model={stockOperation} />,
                disabled: true,
              },
            ]
          : []
        : [],
    ) as TabItem[];
  }, [stockOperation, stockOperationType, t, operationTypePermision]);
  const {
    user: { uuid: defaultLoggedUserUuid },
  } = useSession();
  const { autoPopulateResponsiblePerson } = useConfig<ConfigObject>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const form = useForm<StockOperationItemDtoSchema>({
    // defaultValues: operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE ? issueStockOperation : model,
    defaultValues: {
      responsiblePersonUuid:
        stockOperation?.responsiblePersonUuid ?? // if person uuid exist, make it default
        (stockOperation?.responsiblePersonOther ? otherUser.uuid : undefined) ?? // if other resp person exist, default other user uuid
        (autoPopulateResponsiblePerson ? defaultLoggedUserUuid : undefined), //Else default login user if configured
      operationDate: stockOperation?.operationDate ? parseDate(stockOperation!.operationDate as any) : today(),
      remarks: stockOperation?.remarks ?? '',

      operationTypeUuid: stockOperation?.operationTypeUuid ?? stockOperationType?.uuid,
      reasonUuid: stockOperation?.reasonUuid ?? '',
      responsiblePersonOther: stockOperation?.responsiblePersonOther ?? '',
      stockOperationItems:
        stockOperation?.stockOperationItems?.map((item) =>
          pick(
            { ...item, expiration: item.expiration ? parseDate(item.expiration as any) : undefined },
            stockOperationItemFormSchema.keyof().options,
          ),
        ) ?? [],
      sourceUuid: stockOperation?.sourceUuid ?? '',
      destinationUuid: stockOperation?.destinationUuid ?? '',
    },
    mode: 'all',
    resolver: zodResolver(formschema),
  });

  useEffect(() => {
    // Show error snackbar
    Object.entries(form.formState.errors ?? {}).forEach(([key, val]) => {
      if (['stockOperationItems', 'operationTypeUuid'].includes(key)) {
        showSnackbar({ kind: 'error', title: key, subtitle: (val[key] as FieldError)?.message });
      }
    });
    // Navigate to step where the error is
    const fieldSteps = [
      [
        'responsiblePersonUuid',
        'operationDate',
        'remarks',
        'sourceUuid',
        'destinationUuid',
        'reasonUuid',
        'responsiblePersonOther',
      ],
      ['stockOperationItems'],
    ];
    for (let step = 0; step < fieldSteps.length; step++) {
      const hasError = fieldSteps[step].some((field) => field in form.formState.errors);
      if (hasError) {
        setSelectedIndex(step);
        break;
      }
    }
  }, [form.formState.errors]);

  return (
    <FormProvider {...form}>
      {stockOperation && (
        <StockOperationFormHeader stockOperationType={stockOperationType} stockOperation={stockOperation} />
      )}
      <StockOperationStepper
        steps={steps.map((tab, index) => ({
          title: tab.name,
          component: tab.component,
          disabled: tab.disabled,
          // subTitle: `Subtitle  for ${tab.name}`,
          icon: <CircleDash />,
        }))}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
      />
    </FormProvider>
  );
};

export default StockOperationForm;
