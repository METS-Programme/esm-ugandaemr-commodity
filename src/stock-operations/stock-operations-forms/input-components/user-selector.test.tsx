import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useUser } from '../../../stock-lookups/stock-lookups.resource';
import useSearchUser from '../hooks/useSearchUser';
import UsersSelector from './users-selector.component';
import { otherUser } from '../../../core/utils/utils';
import userEvent from '@testing-library/user-event';

jest.mock('../hooks/useSearchUser');
jest.mock('../../../stock-lookups/stock-lookups.resource');
jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
  Controller: ({ render }) => render({ field: {}, fieldState: {} }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseSearchUser = useSearchUser as jest.Mock;
const mockUseUser = useUser as jest.Mock;
const mockUseFormContext = useFormContext as jest.Mock;

describe('UsersSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormContext.mockReturnValue({
      control: {},
      watch: jest.fn().mockImplementation((field) => {
        if (field === 'responsiblePersonUuid') return 'responsibleperson.uuid';
        if (field === 'responsiblePersonOther') return 'responsiblepersonother.uuid';
        return '';
      }),
      resetField: jest.fn(),
    });
  });

  it('renders loading state', async () => {
    mockUseSearchUser.mockReturnValue({ isLoading: true, userList: [], setSearchString: jest.fn() });
    mockUseUser.mockReturnValue({ isLoading: true, data: null, error: null });

    render(<UsersSelector />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Error message';
    mockUseSearchUser.mockReturnValue({ isLoading: false, userList: [], setSearchString: jest.fn() });
    mockUseUser.mockReturnValue({ isLoading: false, data: null, error: new Error(errorMessage) });
    render(<UsersSelector />);
    expect(screen.getByText('responsiblePersonError')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders ComboBox with user list', async () => {
    mockUseSearchUser.mockReturnValue({
      isLoading: false,
      userList: [
        { uuid: '1', person: { display: 'User 1' } },
        { uuid: '2', person: { display: 'User 2' } },
      ],
      setSearchString: jest.fn(),
    });

    mockUseUser.mockReturnValue({ isLoading: false, data: null, error: null });
    render(<UsersSelector />);
    expect(screen.getByText('responsiblePerson')).toBeInTheDocument();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  it('renders TextInput for other user', async () => {
    mockUseSearchUser.mockReturnValue({ isLoading: false, userList: [], setSearchString: jest.fn() });
    mockUseFormContext.mockReturnValue({
      control: {},
      watch: jest.fn().mockImplementation((field) => {
        if (field === 'responsiblePersonUuid') return otherUser.uuid;
        if (field === 'responsiblePersonOther') return '';
        return '';
      }),
      resetField: jest.fn(),
    });
    mockUseUser.mockReturnValue({ isLoading: false, data: null, error: null });

    render(<UsersSelector />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('pleaseSpecify')).toBeInTheDocument();
  });

  it('calls setSearchString on input change after delay simulating debounce timout', async () => {
    const setSearchString = jest.fn();
    mockUseSearchUser.mockReturnValue({
      isLoading: false,
      userList: [],
      setSearchString,
    });

    mockUseUser.mockReturnValue({ isLoading: false, data: null, error: null });

    render(<UsersSelector />);
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.type(combobox, 'test');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate debounce
    expect(setSearchString).toHaveBeenCalledWith('test');
  });
});
