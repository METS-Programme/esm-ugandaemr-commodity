import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { StockItemInventory } from '../../../core/api/types/stockItem/StockItemInventory';
import { useStockItemBatchInformationHook } from '../../../stock-items/add-stock-item/batch-information/batch-information.resource';
import { useStockItemBatchNumbers } from '../hooks/useStockItemBatchNumbers';
import BatchNoSelector from './batch-no-selector.component';

jest.mock('../hooks/useStockItemBatchNumbers');
jest.mock('../../../stock-items/add-stock-item/batch-information/batch-information.resource');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseStockItemBatchNumbers = useStockItemBatchNumbers as jest.Mock;
const mockUseStockItemBatchInformationHook = useStockItemBatchInformationHook as jest.Mock;

describe('BatchNoSelector', () => {
  const mockOnValueChange = jest.fn();
  const mockStockItemUuid = 'test-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStockItemBatchNumbers.mockReturnValue({
      isLoading: false,
      stockItemBatchNos: [
        { uuid: '1', batchNo: 'BATCH-001', quantity: 10 },
        { uuid: '2', batchNo: 'BATCH-002', quantity: 20 },
      ],
    });
    mockUseStockItemBatchInformationHook.mockReturnValue({
      items: [
        { batchNumber: 'BATCH-001', quantity: 10 },
        { batchNumber: 'BATCH-002', quantity: 20 },
      ] as StockItemInventory[],
      setStockItemUuid: jest.fn(),
    });
  });

  it('should render loading skeleton when isLoading is true', () => {
    mockUseStockItemBatchNumbers.mockReturnValue({ isLoading: true, stockItemBatchNos: [] });
    mockUseStockItemBatchInformationHook.mockReturnValue({ isLoading: true, items: [], setStockItemUuid: jest.fn() });
    render(<BatchNoSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render combobox with batch numbers', async () => {
    render(<BatchNoSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('batchNo')).toBeInTheDocument();
  });

  it('should handle batch selection', async () => {
    render(<BatchNoSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.type(combobox, 'BATCH-001');
    const option = screen.getByText('BATCH-001 | Qty: 10');
    await userEvent.click(option);
    expect(mockOnValueChange).toHaveBeenCalledWith('1');
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'This is an error';
    render(
      <BatchNoSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} error={errorMessage} />,
    );
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should filter out batches with zero or undefined quantity', async () => {
    mockUseStockItemBatchNumbers.mockReturnValue({
      isLoading: false,
      stockItemBatchNos: [
        { uuid: '1', batchNo: 'BATCH-001', quantity: 10 },
        { uuid: '2', batchNo: 'BATCH-002', quantity: 0 },
        { uuid: '3', batchNo: 'BATCH-003', quantity: undefined },
      ],
    });

    render(<BatchNoSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);

    expect(screen.queryByText('BATCH-002')).not.toBeInTheDocument();
    expect(screen.queryByText('BATCH-003')).not.toBeInTheDocument();
  });
});
