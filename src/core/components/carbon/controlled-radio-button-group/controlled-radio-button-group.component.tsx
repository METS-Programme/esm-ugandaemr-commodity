import React from 'react';
import { RadioButtonGroupProps } from '@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { RadioOption } from '../../../../stock-items/add-stock-item/stock-item-details/stock-item-details.resource';

interface ControlledRadioButtonGroupProps<T> extends RadioButtonGroupProps {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  options: RadioOption[]; // Change the type to RadioOption[]
}

const ControlledRadioButtonGroup = <T,>(props: ControlledRadioButtonGroupProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <RadioButtonGroup
          {...props}
          onChange={(selection: string | number, name: string, event: any) => {
            onChange(selection, name, event);

            // Fire prop change
            if (props.onChange) {
              props.onChange(selection, name, event);
            }
          }}
          id={props.name}
          ref={ref}
          defaultSelected={props.id}
          value={value}
        >
          {props.options.map((option, index) => (
            <RadioButton
              key={`${index}-${props.name}-${option.value}`}
              id={`${props.name}-${option.value}`}
              labelText={option.label}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              ref={ref}
            />
          ))}
        </RadioButtonGroup>
      )}
    />
  );
};

export default ControlledRadioButtonGroup;
