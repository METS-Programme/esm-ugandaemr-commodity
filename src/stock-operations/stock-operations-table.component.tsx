import {
  DataTable,
  DataTableSkeleton,
  DatePicker,
  DatePickerInput,
  InlineLoading,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
  TabPanel,
  Tile,
} from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { isDesktop, restBaseUrl } from '@openmrs/esm-framework';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, StockFilters } from '../constants';
import { ResourceRepresentation } from '../core/api/api';
import { StockOperationType } from '../core/api/types/stockOperation/StockOperationType';
import { formatDisplayDate } from '../core/utils/datetimeUtils';
import { initialStockOperationValue } from '../core/utils/utils';
import { handleMutate } from '../utils';
import EditStockOperationActionMenu from './edit-stock-operation/edit-stock-operation-action-menu.component';
import StockOperationTypesSelector from './stock-operation-types-selector/stock-operation-types-selector.component';
import { launchAddOrEditDialog } from './stock-operation.utils';
import StockOperationsFilters from './stock-operations-filters.component';
import { useStockOperationPages } from './stock-operations-table.resource';

import { Link } from '@carbon/react';
import StockOperationExpandedRow from './add-stock-operation/stock-operations-expanded-row/stock-operation-expanded-row.component';
import styles from './stock-operations-table.scss';

interface StockOperationsTableProps {
  status?: string;
}

const StockOperations: React.FC<StockOperationsTableProps> = () => {
  const { t } = useTranslation();
  const handleRefresh = () => {
    handleMutate(`${restBaseUrl}/stockmanagement/stockoperation`);
  };
  const operation: StockOperationType = useMemo(
    () => ({
      uuid: '',
      name: '',
      description: '',
      operationType: '',
      hasSource: false,
      sourceType: 'Location',
      hasDestination: false,
      destinationType: 'Location',
      hasRecipient: false,
      recipientRequired: false,
      availableWhenReserved: false,
      allowExpiredBatchNumbers: false,
      stockOperationTypeLocationScopes: [],
      creator: undefined,
      dateCreated: undefined,
      changedBy: undefined,
      dateChanged: undefined,
      dateVoided: undefined,
      voidedBy: undefined,
      voidReason: '',
      voided: false,
    }),
    [],
  );

  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);

  const { items, tableHeaders, currentPage, pageSizes, totalItems, goTo, currentPageSize, setPageSize, isLoading } =
    useStockOperationPages({
      v: ResourceRepresentation.Full,
      totalCount: true,
      operationDateMin: selectedFromDate?.toISOString(),
      operationDateMax: selectedToDate?.toISOString(),
      status: selectedStatus.join(','),
      sourceTypeUuid: selectedSources.join(','),
      operationTypeUuid: selectedOperations.join(','),
    });

  const filterApplied =
    selectedFromDate || selectedToDate || selectedSources.length || selectedStatus.length || selectedOperations.length;

  const [operations, setOperations] = useState<StockOperationType[]>([]);

  const handleOnFilterChange = useCallback((selectedItems, filterType) => {
    if (filterType === StockFilters.SOURCES) {
      setSelectedSources(selectedItems);
    } else if (filterType === StockFilters.OPERATION) {
      setSelectedOperations(selectedItems);
    } else {
      setSelectedStatus(selectedItems);
    }
  }, []);

  const handleDateFilterChange = ([startDate, endDate]) => {
    if (startDate) {
      setSelectedFromDate(startDate);
      if (selectedToDate && startDate && selectedToDate < startDate) {
        setSelectedToDate(startDate);
      }
    }
    if (endDate) {
      setSelectedToDate(endDate);
      if (selectedFromDate && endDate && selectedFromDate > endDate) {
        setSelectedFromDate(endDate);
      }
    }
  };

  const handleEditClick = useCallback(
    (stockOperation, isEditing) => {
      launchAddOrEditDialog(t, stockOperation, isEditing, operation, operations, false);
    },
    [t, operation, operations],
  );

  const tableRows = useMemo(() => {
    return items?.map((stockOperation, index) => {
      const threshHold = 1;
      const itemCountGreaterThanThreshhold = (stockOperation?.stockOperationItems?.length ?? 0) > threshHold;
      const commonNames =
        stockOperation?.stockOperationItems
          ?.slice(0, itemCountGreaterThanThreshhold ? threshHold : undefined)
          .map((item) => item.commonName)
          .join(', ') ?? '';

      return {
        ...stockOperation,
        id: stockOperation?.uuid,
        key: `key-${stockOperation?.uuid}`,
        operationTypeName: `${stockOperation?.operationTypeName}`,
        operationNumber: (
          <EditStockOperationActionMenu
            model={stockOperation}
            operations={operations}
            operationUuid={operation.uuid}
            operationNumber={''}
            onEdit={() => handleEditClick(stockOperation, true)}
            showIcon={false}
            showprops={true}
          />
        ),
        stockOperationItems: {
          commonNames,
          more: itemCountGreaterThanThreshhold ? stockOperation?.stockOperationItems?.length - threshHold : 0,
        },
        status: `${stockOperation?.status}`,
        source: `${stockOperation?.sourceName ?? ''}`,
        destination: `${stockOperation?.destinationName ?? ''}`,
        location: (
          <>
            {stockOperation?.sourceName ?? ''}
            {stockOperation?.sourceName && stockOperation?.destinationName ? <ArrowRight size={16} /> : ''}{' '}
            {stockOperation?.destinationName ?? ''}
          </>
        ),
        responsiblePerson: `${
          stockOperation?.responsiblePersonFamilyName ?? stockOperation?.responsiblePersonOther ?? ''
        } ${stockOperation?.responsiblePersonGivenName ?? ''}`,
        operationDate: formatDisplayDate(stockOperation?.operationDate),
        actions: (
          <EditStockOperationActionMenu
            model={stockOperation}
            operations={operations}
            operationUuid={operation.uuid}
            operationNumber={''}
            onEdit={() => handleEditClick(stockOperation, true)}
            showIcon={true}
            showprops={false}
          />
        ),
      };
    });
  }, [items, operations, handleEditClick, operation]);

  if (isLoading && !filterApplied) {
    return (
      <DataTableSkeleton className={styles.dataTableSkeleton} showHeader={false} rowCount={5} columnCount={5} zebra />
    );
  }

  return (
    <div className={styles.tableOverride}>
      <TabPanel>{t('stockOperationTrackMovement', 'Stock operations to track movement of stock.')}</TabPanel>
      <div id="table-tool-bar">
        <div></div>
        <div className="right-filters"></div>
      </div>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable={true}
        useZebraStyles={true}
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          onInputChange,
          getExpandedRowProps,
          expandRow,
        }) => (
          <TableContainer>
            <TableToolbar
              style={{
                position: 'static',
                overflow: 'visible',
                backgroundColor: 'color',
              }}
            >
              <TableToolbarContent className={styles.toolbarContent}>
                <TableToolbarSearch
                  className={styles.patientListSearch}
                  expanded
                  onChange={onInputChange}
                  placeholder="Filter Table"
                  size="sm"
                />
                <div className={styles.filterContainer}>
                  <DatePicker
                    className={styles.dateAlign}
                    datePickerType="range"
                    dateFormat={DATE_PICKER_CONTROL_FORMAT}
                    value={[selectedFromDate, selectedToDate]}
                    onChange={([startDate, endDate]) => {
                      handleDateFilterChange([startDate, endDate]);
                    }}
                  >
                    <DatePickerInput placeholder={DATE_PICKER_FORMAT} />
                    <DatePickerInput placeholder={DATE_PICKER_FORMAT} />
                  </DatePicker>

                  <StockOperationsFilters filterName={StockFilters.SOURCES} onFilterChange={handleOnFilterChange} />

                  <StockOperationsFilters filterName={StockFilters.STATUS} onFilterChange={handleOnFilterChange} />

                  <StockOperationsFilters filterName={StockFilters.OPERATION} onFilterChange={handleOnFilterChange} />
                </div>
                <TableToolbarMenu>
                  <TableToolbarAction onClick={handleRefresh}>Refresh</TableToolbarAction>
                </TableToolbarMenu>

                <StockOperationTypesSelector
                  onOperationTypeSelected={(operation) => {
                    launchAddOrEditDialog(t, initialStockOperationValue(), false, operation, operations, false);
                  }}
                  onOperationLoaded={(ops) => {
                    setOperations(ops);
                  }}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map(
                    (header: any) =>
                      header.key !== 'details' && (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                          className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                          key={`${header.key}`}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ),
                  )}
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows?.map((row: any, index) => {
                  const props = getRowProps({ row });
                  const expandedRowProps = getExpandedRowProps({ row });
                  return (
                    <React.Fragment key={row.id}>
                      <TableExpandRow className={isDesktop ? styles.desktopRow : styles.tabletRow} {...props}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell?.info?.header === 'stockOperationItems' ? (
                              <span>
                                <span>{cell.value.commonNames}</span>
                                {cell.value.more > 0 && (
                                  <Link onClick={() => expandRow(row.id)}>{`...(${cell.value.more} more)`}</Link>
                                )}
                              </span>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow colSpan={headers.length + 2} {...expandedRowProps}>
                          <StockOperationExpandedRow model={items[index]} />
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 && !isLoading ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noOperationsToDisplay', 'No Stock Items to display')}</p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
            {filterApplied && isLoading && (
              <div className={styles.rowLoadingContainer}>
                <InlineLoading description={t('loading', 'Loading...')} />
              </div>
            )}
          </TableContainer>
        )}
      ></DataTable>
      {items.length > 0 && (
        <Pagination
          page={currentPage}
          pageSize={currentPageSize}
          pageSizes={pageSizes}
          totalItems={totalItems}
          onChange={({ pageSize, page }) => {
            if (pageSize !== currentPageSize) {
              setPageSize(pageSize);
            }
            if (page !== currentPage) {
              goTo(page);
            }
          }}
          className={styles.paginationOverride}
        />
      )}
    </div>
  );
};

export default StockOperations;
