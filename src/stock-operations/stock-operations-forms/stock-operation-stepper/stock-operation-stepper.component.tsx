import { Layer } from '@carbon/react';
import React from 'react';
import styles from './stepper.scss';
export type Step = {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  component: React.ReactElement;
  disabled?: boolean;
};

type StockOperationStepperProps = {
  steps: Step[];
  title?: string;
  hasContainer?: boolean;
  selectedIndex?: number;
  onChange?: (index: number) => void;
};
const StockOperationStepper: React.FC<StockOperationStepperProps> = ({
  steps,
  hasContainer,
  onChange,
  selectedIndex,
  title,
}) => {
  return (
    <Layer className={styles.layer}>
      <ol className={styles.stepperContainer}>
        {steps.map(({ title, subTitle, icon, disabled }, index) => {
          const active = selectedIndex >= index;
          return (
            <li
              role="button"
              className={`${styles.stepperItem} ${active ? styles.stepperItemActive : ''}`}
              key={index}
              onClick={!disabled ? () => onChange?.(index) : undefined}
            >
              {icon}
              <div>
                <p className={styles.title}>{title}</p>
                <p className={styles.subtTitle}>{subTitle}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <Layer>{steps[selectedIndex].component}</Layer>
    </Layer>
  );
};

export default StockOperationStepper;
