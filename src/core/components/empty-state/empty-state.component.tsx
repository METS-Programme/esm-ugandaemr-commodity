import { Button, Layer, Tile } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import React from 'react';
import { EmptyDataIllustration } from './empty-illustration';
import styles from './empty-state.scss';

type Props = {
  headerTitle: string;
  handleAdd?: () => void;
  message: string;
};
const EmptyState: React.FC<Props> = ({ headerTitle, handleAdd, message }) => {
  return (
    <Layer className={styles.layer}>
      <Tile className={styles.tile}>
        <div className={styles.heading}>
          <h4>{headerTitle}</h4>
          {typeof handleAdd === 'function' && (
            <Button onClick={handleAdd} renderIcon={Add} kind="primary">
              Add stock operation item
            </Button>
          )}
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>{message}</p>
        {typeof handleAdd === 'function' && (
          <Button onClick={handleAdd} renderIcon={Add} kind="ghost">
            Add {headerTitle}
          </Button>
        )}
      </Tile>
    </Layer>
  );
};

export default EmptyState;
