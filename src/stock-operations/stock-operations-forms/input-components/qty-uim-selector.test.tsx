import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useStockItem } from '../../../stock-items/stock-items.resource';
import QtyUomSelector from './quantity-uom-selector.component';

jest.mock('../../../stock-items/stock-items.resource');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseStockItem = useStockItem as jest.Mock;

describe('QtyUOMSelector', () => {
  const mockOnValueChange = jest.fn();
  const mockStockItemUuid = 'test-uuid';
  const mockitem = {
    uuid: '33225466-93c8-4720-b110-4f445f3764c6',
    drugUuid: '1776AFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    drugName: 'Ibuprofen Injection solution  5mg/mL ',
    conceptUuid: '77897AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    conceptName: 'IBUPROFEN',
    hasExpiration: true,
    preferredVendorUuid: 'b7e481ef-06e7-46ba-8a7c-ab077aa3355f',
    preferredVendorName: 'Kenya Medical Supplies Authority',
    purchasePrice: 100.0,
    purchasePriceUoMUuid: '65dc9ec7-0663-4cf0-a35c-6a2d2cf99eee',
    purchasePriceUoMName: 'Box',
    purchasePriceUoMFactor: 10.0,
    dispensingUnitName: 'Tablet',
    dispensingUnitUuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dispensingUnitPackagingUoMUuid: '65dc9ec7-0663-4cf0-a35c-6a2d2cf99eee',
    dispensingUnitPackagingUoMName: 'Box',
    dispensingUnitPackagingUoMFactor: 10.0,
    defaultStockOperationsUoMUuid: null,
    defaultStockOperationsUoMName: null,
    defaultStockOperationsUoMFactor: null,
    categoryUuid: '183f9497-b72e-4ebe-ae17-5dcf110ff3b6',
    categoryName: 'Other Lymph Node Comments',
    commonName: 'Ibuprofen 5 MG/ML Injectable Solution',
    acronym: null,
    reorderLevel: null,
    reorderLevelUoMUuid: null,
    reorderLevelUoMName: null,
    reorderLevelUoMFactor: null,
    dateCreated: '2024-09-03T09:46:47.000+0300',
    creatorGivenName: 'Mark',
    creatorFamilyName: 'Miller',
    voided: false,
    expiryNotice: 180,
    permission: {
      canView: true,
      canEdit: true,
    },
    packagingUnits: [
      {
        uuid: '8023ef7d-56da-442f-bc74-319f000840b4',
        factor: 1.0,
        packagingUomUuid: '162382AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        packagingUomName: 'Vial',
        stockItemUuid: '33225466-93c8-4720-b110-4f445f3764c6',
        isDefaultStockOperationsUoM: false,
        isDispensingUnit: false,
        links: [
          {
            rel: 'full',
            uri: 'http://hie.kenyahmis.org/openmrs/ws/rest/v1/stockmanagement/stockitempackaginguom/8023ef7d-56da-442f-bc74-319f000840b4?v=full',
            resourceAlias: 'stockitempackaginguom',
          },
        ],
        resourceVersion: '1.8',
      },
      {
        uuid: '65dc9ec7-0663-4cf0-a35c-6a2d2cf99eee',
        factor: 10.0,
        packagingUomUuid: '162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        packagingUomName: 'Box',
        stockItemUuid: '33225466-93c8-4720-b110-4f445f3764c6',
        isDefaultStockOperationsUoM: false,
        isDispensingUnit: true,
        links: [
          {
            rel: 'full',
            uri: 'http://hie.kenyahmis.org/openmrs/ws/rest/v1/stockmanagement/stockitempackaginguom/65dc9ec7-0663-4cf0-a35c-6a2d2cf99eee?v=full',
            resourceAlias: 'stockitempackaginguom',
          },
        ],
        resourceVersion: '1.8',
      },
    ],
    references: [],
    links: [
      {
        rel: 'self',
        uri: 'http://hie.kenyahmis.org/openmrs/ws/rest/v1/stockmanagement/stockitem/33225466-93c8-4720-b110-4f445f3764c6',
        resourceAlias: 'stockitem',
      },
    ],
    resourceVersion: '1.8',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStockItem.mockReturnValue({
      isLoading: false,
      item: mockitem,
    });
  });
  it('should render Skeleton when loading stock item', () => {
    mockUseStockItem.mockReturnValue({ isLoading: true });
    render(<QtyUomSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  it('should render Inline notification error when error ocuured while fetching item', () => {
    const errorMessage = 'error loading stock item';
    mockUseStockItem.mockReturnValue({ isLoading: false, error: new Error(errorMessage) });
    render(<QtyUomSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  it('should render Inline notification error when error ocuured while fetching item', () => {
    const errorMessage = 'error loading stock item';
    mockUseStockItem.mockReturnValue({ isLoading: false, error: new Error(errorMessage) });
    render(<QtyUomSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'This is an error';
    render(<QtyUomSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  it('should display error message when error prop is provided', () => {
    const errorMessage = 'This is an error';
    render(<QtyUomSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render packing uom options', async () => {
    render(<QtyUomSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    mockitem.packagingUnits.forEach(({ factor, packagingUomName }) => {
      expect(screen.getByText(`${packagingUomName} - ${factor}`)).toBeInTheDocument();
    });
  });
  it('should packing uom selection', async () => {
    const itemToSelect = mockitem.packagingUnits[1];
    render(<QtyUomSelector stockItemUuid={mockStockItemUuid} onValueChange={mockOnValueChange} />);
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    const option = screen.getByText(`${itemToSelect.packagingUomName} - ${itemToSelect.factor}`);
    await userEvent.click(option);
    expect(mockOnValueChange).toHaveBeenCalledWith(itemToSelect.uuid);
  });
});
