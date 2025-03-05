import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { useConfig } from '@openmrs/esm-framework';
import { useFormContext } from 'react-hook-form';
import { useConcept } from '../../../stock-lookups/stock-lookups.resource';
import StockOperationReasonSelector from './stock-operation-reason-selector.component';

// Mock the hooks
jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
  Controller: ({ render }) => render({ field: {}, fieldState: {} }),
}));
jest.mock('../../../stock-lookups/stock-lookups.resource');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseConcept = useConcept as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;
const mockUseFormContext = useFormContext as jest.Mock;

describe('StockoperationReasonSelector', () => {
  const mockConcepts = {
    uuid: '3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25',
    display: 'Stock Adjustment Reason',
    name: {
      display: 'Stock Adjustment Reason',
      uuid: '4eb6556a-a2d4-4e85-9b62-4d076a1063fc',
      name: 'Stock Adjustment Reason',
      locale: 'en',
      localePreferred: true,
      conceptNameType: 'FULLY_SPECIFIED',
      links: [
        {
          rel: 'self',
          uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25/name/4eb6556a-a2d4-4e85-9b62-4d076a1063fc',
          resourceAlias: 'name',
        },
        {
          rel: 'full',
          uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25/name/4eb6556a-a2d4-4e85-9b62-4d076a1063fc?v=full',
          resourceAlias: 'name',
        },
      ],
      resourceVersion: '1.9',
    },
    datatype: {
      uuid: '8d4a48b6-c2cc-11de-8d13-0010c6dffd0f',
      display: 'Coded',
      links: [
        {
          rel: 'self',
          uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/conceptdatatype/8d4a48b6-c2cc-11de-8d13-0010c6dffd0f',
          resourceAlias: 'conceptdatatype',
        },
      ],
    },
    conceptClass: {
      uuid: '8d491e50-c2cc-11de-8d13-0010c6dffd0f',
      display: 'Question',
      links: [
        {
          rel: 'self',
          uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/conceptclass/8d491e50-c2cc-11de-8d13-0010c6dffd0f',
          resourceAlias: 'conceptclass',
        },
      ],
    },
    set: false,
    version: null,
    retired: false,
    names: [
      {
        uuid: '4eb6556a-a2d4-4e85-9b62-4d076a1063fc',
        display: 'Stock Adjustment Reason',
        links: [
          {
            rel: 'self',
            uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25/name/4eb6556a-a2d4-4e85-9b62-4d076a1063fc',
            resourceAlias: 'name',
          },
        ],
      },
      {
        uuid: '36eb0855-c810-4816-9bed-1de5c615e702',
        display: 'Stock Adjustment Reason',
        links: [
          {
            rel: 'self',
            uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25/name/36eb0855-c810-4816-9bed-1de5c615e702',
            resourceAlias: 'name',
          },
        ],
      },
    ],
    descriptions: [
      {
        uuid: '67311e07-1935-448b-8305-7d11abf0de63',
        display: 'Stock Adjustment Reason',
        links: [
          {
            rel: 'self',
            uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25/description/67311e07-1935-448b-8305-7d11abf0de63',
            resourceAlias: 'description',
          },
        ],
      },
    ],
    mappings: [],
    answers: [
      {
        uuid: '165420AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Drug not available due to expired medication',
        links: [
          {
            rel: 'self',
            uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/165420AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            resourceAlias: 'concept',
          },
        ],
      },
      {
        uuid: '160584AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Lost or ran out of medication',
        links: [
          {
            rel: 'self',
            uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/160584AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            resourceAlias: 'concept',
          },
        ],
      },
      {
        uuid: '122835AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Work Shift Change',
        links: [
          {
            rel: 'self',
            uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/122835AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            resourceAlias: 'concept',
          },
        ],
      },
      {
        uuid: '160561AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'New drug available',
        links: [
          {
            rel: 'self',
            uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/160561AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            resourceAlias: 'concept',
          },
        ],
      },
    ],
    setMembers: [],
    attributes: [],
    links: [
      {
        rel: 'self',
        uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25',
        resourceAlias: 'concept',
      },
      {
        rel: 'full',
        uri: 'http://qa.kenyahmis.org/openmrs/ws/rest/v1/concept/3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25?v=full',
        resourceAlias: 'concept',
      },
    ],
    resourceVersion: '2.0',
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue({ stockAdjustmentReasonUUID: 'uuid' });
    mockUseConcept.mockReturnValue({
      isLoading: false,
      items: mockConcepts,
    });
  });

  it('should display loading state while loading reason concepts', () => {
    mockUseFormContext.mockReturnValue({ control: {} });
    mockUseConcept.mockReturnValue({
      isLoading: true,
      items: mockConcepts,
    });
    render(<StockOperationReasonSelector />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  it('should display error notification when error encountered while fetching concepts', () => {
    const errorMessahe = 'Error message';
    mockUseConcept.mockReturnValue({
      isLoading: false,
      items: mockConcepts,
      error: new Error(errorMessahe),
    });
    render(<StockOperationReasonSelector />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(errorMessahe)).toBeInTheDocument();
  });

  it('renders ComboBox with reasons', async () => {
    render(<StockOperationReasonSelector />);
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    mockConcepts.answers.forEach((ans) => {
      expect(screen.getByText(`${ans?.display}`)).toBeInTheDocument();
    });
  });
});
