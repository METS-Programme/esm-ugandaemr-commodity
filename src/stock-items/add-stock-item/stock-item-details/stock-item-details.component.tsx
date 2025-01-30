import React, { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from '@carbon/react/icons';

import { Button, FormGroup, InlineLoading } from '@carbon/react';
import { StockItemDTO } from '../../../core/api/types/stockItem/StockItem';
import DrugSelector from '../drug-selector/drug-selector.component';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockItemDetailsSchema, StockItemFormData } from '../../validationSchema';
import ControlledRadioButtonGroup from '../../../core/components/carbon/controlled-radio-button-group/controlled-radio-button-group.component';
import ControlledNumberInput from '../../../core/components/carbon/controlled-number-input/controlled-number-input.component';
import ControlledTextInput from '../../../core/components/carbon/controlled-text-input/controlled-text-input.component';
import DispensingUnitSelector from '../dispensing-unit-selector/dispensing-unit-selector.component';
import PreferredVendorSelector from '../preferred-vendor-selector/preferred-vendor-selector.component';
import StockItemCategorySelector from '../stock-item-category-selector/stock-item-category-selector.component';
import StockItemUnitsEdit from '../stock-item-units-edit/stock-item-units-edit.component';
import { SaveStockItem } from '../../types';
import ConceptsSelector from '../concepts-selector/concepts-selector.component';
import styles from '../../add-stock-item/add-stock-item.scss';
import { closeOverlay } from '../../../core/components/overlay/hook';
import { expirationOptions, radioOptions } from './stock-item-details.resource';
import { restBaseUrl } from '@openmrs/esm-framework';
import { handleMutate } from '../../../utils';

interface StockItemDetailsProps {
  model: StockItemDTO;
  onSave: SaveStockItem;
  isEditing?: boolean;
  handleTabChange: (index) => void;
}

const StockItemDetails = forwardRef<never, StockItemDetailsProps>(({ model, onSave, isEditing, handleTabChange }) => {
  const { t } = useTranslation();
  const { handleSubmit, control, formState } = useForm<StockItemFormData>({
    defaultValues: model,
    mode: 'all',
    resolver: zodResolver(stockItemDetailsSchema),
  });

  const { errors } = formState;
  const handleSave = async (item: StockItemDTO) => {
    try {
      setIsSaving(true);

      // Restore uuid
      item.uuid = model.uuid;
      await onSave(item);
      handleTabChange(1);
      handleMutate(`${restBaseUrl}/stockmanagement/stockitem`);
    } catch (e) {
      // Show notification
    } finally {
      setIsSaving(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isDrug, setIsDrug] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);

  useEffect(() => {
    setIsDrug(model.isDrug ?? false);
    setHasExpiration(model.hasExpiration ?? false);
  }, [model.hasExpiration, model.isDrug]);

  return (
    <form className={`${styles.formContainer} ${styles.verticalForm}`}>
      {!isEditing && (
        <FormGroup
          className="clear-margin-bottom"
          legendText={t('itemType', 'Item Type')}
          title={t('itemType', 'Item Type')}
        >
          <ControlledRadioButtonGroup
            control={control}
            name="isDrug"
            controllerName="isDrug"
            legendText=""
            invalid={!!errors.isDrug}
            invalidText={errors.isDrug && errors?.isDrug?.message}
            onChange={(selection: any) => {
              const selectedOption = radioOptions.find((option) => option.value === selection);
              const selectedLabel = selectedOption ? selectedOption.label : '';
              setIsDrug(selection);
              setSelectedItemType(selectedLabel);
            }}
            options={radioOptions} // Pass radioOptions directly
          />
        </FormGroup>
      )}
      {selectedItemType === 'Pharmaceuticals' ? (
        <DrugSelector
          name="drugUuid"
          controllerName="drugUuid"
          control={control}
          title={t('pleaseSpecify', 'Please specify:')}
          placeholder="Choose a drug"
          drugUuid={model.drugUuid}
          invalid={!!errors.drugUuid}
          invalidText={errors.drugUuid && errors?.drugUuid?.message}
        />
      ) : selectedItemType === 'Non Pharmaceuticals' ? (
        <ConceptsSelector
          name="conceptUuid"
          controllerName="conceptUuid"
          control={control}
          title={t('pleaseSpecify', 'Please specify') + ':'}
          placeholder={t('chooseAnItem', 'Choose an item')}
          invalid={!!errors.drugUuid}
          invalidText={errors.drugUuid && errors?.drugUuid?.message}
        />
      ) : null}
      <ControlledTextInput
        id="commonName"
        name="commonName"
        control={control}
        controllerName="commonName"
        maxLength={255}
        size={'md'}
        value={`${model?.commonName ?? ''}`}
        labelText={t('commonName', 'Common name') + ':'}
        invalid={!!errors.commonName}
        invalidText={errors.commonName && errors?.commonName?.message}
      />
      <ControlledTextInput
        id="acronym"
        maxLength={255}
        name="acronym"
        control={control}
        controllerName="acronym"
        size={'md'}
        labelText={t('abbreviation', 'Abbreviation') + ':'}
        invalid={!!errors.acronym}
        invalidText={errors.acronym && errors?.acronym?.message}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          justifyContent: 'center',
        }}
      >
        <FormGroup
          className="clear-margin-bottom"
          legendText={t('hasExpiration', 'Does the item expire?')}
          title={t('hasExpiration', 'Does the item expire?')}
        >
          <ControlledRadioButtonGroup
            name="hasExpiration"
            controllerName="hasExpiration"
            control={control}
            legendText=""
            invalid={!!errors.hasExpiration}
            invalidText={errors.hasExpiration && errors?.hasExpiration?.message}
            onChange={(selection: any) => {
              setHasExpiration(selection);
            }}
            options={expirationOptions} // Pass expirationOptions directly
          />
        </FormGroup>

        {hasExpiration && (
          <FormGroup
            className="clear-margin-bottom"
            legendText={t('expirationNotice', 'Expiration Notice (days)')}
            title={t('expirationNotice', 'Expiration Notice (days)')}
          >
            <ControlledNumberInput
              id="expiryNotice"
              name="expiryNotice"
              control={control}
              controllerName="expiryNotice"
              min={0}
              hideSteppers={true}
              size={'md'}
              allowEmpty={true}
              label={t('expiryNoticeDays', 'Expiration Notice (days)')}
              invalid={!!errors.expiryNotice}
              invalidText={errors.expiryNotice && errors?.expiryNotice?.message}
            />
          </FormGroup>
        )}
      </div>
      <PreferredVendorSelector
        name="preferredVendorUuid"
        controllerName="preferredVendorUuid"
        control={control}
        title={t('whoIsThePreferredVendor', 'Who is the preferred vendor?')}
        placeholder={t('chooseVendor', 'Choose vendor')}
        invalid={!!errors.preferredVendorUuid}
        invalidText={errors.preferredVendorUuid && errors?.preferredVendorUuid?.message}
      />
      <StockItemCategorySelector
        name="categoryUuid"
        controllerName="categoryUuid"
        control={control}
        itemType={
          selectedItemType === 'Pharmaceuticals'
            ? 'Drugs'
            : selectedItemType === 'Non Pharmaceuticals'
            ? 'Non Drugs'
            : undefined
        }
        title={t('category', 'Category') + ':'}
        placeholder={t('chooseACategory', 'Choose a category')}
        invalid={!!errors.categoryUuid}
        invalidText={errors.categoryUuid && errors?.categoryUuid?.message}
      />
      {isDrug && (
        <DispensingUnitSelector
          name="dispensingUnitUuid"
          controllerName="dispensingUnitUuid"
          control={control}
          title={t('dispensingUnit', 'Dispensing Unit') + ':'}
          placeholder={t('dispensingUnitHolder', 'Choose a dispensing unit')}
          invalid={!!errors.dispensingUnitUuid}
          invalidText={errors.dispensingUnitUuid && errors?.dispensingUnitUuid?.message}
        />
      )}
      {isDrug && isEditing && <StockItemUnitsEdit control={control} formState={formState} stockItemUuid={model.uuid} />}

      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button
          name="save"
          type="button"
          className="submitButton"
          onClick={handleSubmit(handleSave)}
          kind="primary"
          renderIcon={Save}
        >
          {isSaving ? <InlineLoading /> : t('save', 'Save')}
        </Button>
        <Button kind="secondary" onClick={closeOverlay}>
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </form>
  );
});

export default StockItemDetails;
