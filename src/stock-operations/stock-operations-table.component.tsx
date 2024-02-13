import React, { useEffect, useMemo, useState } from "react";
import { useStockOperationPages } from "./stock-operations-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import {
  DataTable,
  TabPanel,
  DataTableSkeleton,
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
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import { formatDisplayDate } from "../core/utils/datetimeUtils";
import styles from "../stock-items/stock-items-table.scss";
import {
  StockOperationStatusCancelled,
  StockOperationStatusNew,
  StockOperationStatusRejected,
  StockOperationStatusReturned,
} from "../core/api/types/stockOperation/StockOperationStatus";
import { isDesktop, showModal } from "@openmrs/esm-framework";
import StockOperationTypesSelector from "./stock-operation-types-selector/stock-operation-types-selector.component";
import { launchAddOrEditDialog } from "./stock-operation.utils";
import { initialStockOperationValue } from "../core/utils/utils";
import { StockOperationType } from "../core/api/types/stockOperation/StockOperationType";
import { useTranslation } from "react-i18next";
import EditStockOperationActionMenu from "./edit-stock-operation/edit-stock-operation-action-menu.component";
import { handleMutate } from "./swr-revalidation";
import AdvancedFiltersList from "./advanced-filters/advanced-filters-menu.component";
import AdvancedFiltersMenuModal from "./advanced-filters/advanced-filters-menu-modal.component";

interface StockOperationsTableProps {
  status?: string;
}

const StockOperations: React.FC<StockOperationsTableProps> = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    header: "",
    type: false,
    status: false,
    date: false,
    operationTypes: [],
    statuses: [],
    onApplyFilter: () => {
      //empty function
    },
  });
  const [filterOptions, setFilterOptions] = useState({
    operationTypes: [],
    statuses: [],
  });
  const [filters, setFilters] = useState({
    type: "",
    status: "",
  });

  const operation: StockOperationType = useMemo(
    () => ({
      uuid: "",
      name: "",
      description: "",
      operationType: "",
      hasSource: false,
      sourceType: "Location",
      hasDestination: false,
      destinationType: "Location",
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
      voidReason: "",
      voided: false,
    }),
    []
  );

  const {
    items,
    tableHeaders,
    currentPage,
    pageSizes,
    totalItems,
    goTo,
    currentPageSize,
    setPageSize,
    isLoading,
  } = useStockOperationPages({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });

  useEffect(() => {
    const operationTypesSet = new Set(
      items?.map((item) => item.operationTypeName)
    );
    const statusesSet = new Set(items?.map((item) => item.status));

    const operationTypes = Array.from(operationTypesSet).sort();
    const statuses = Array.from(statusesSet).sort();

    setFilterOptions({ operationTypes, statuses });
  }, [filterOptions, items]);

  const handleApplyFilter = (newFilters) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      return updatedFilters;
    });
  };

  const openModalWithConfig = (config, header) => {
    setModalConfig({
      ...config,
      header,
      operationTypes: filterOptions.operationTypes,
      statuses: filterOptions.statuses,
      onApplyFilter: handleApplyFilter,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    return items?.filter((item) => {
      return (
        (!filters.type || item.operationTypeName === filters.type) &&
        (!filters.status || item.status === filters.status)
      );
    });
  }, [items, filters]);
  // console.info(filteredItems);

  let operations: StockOperationType[] | null | undefined;
  const handleOnComplete = () => {
    const dispose = showModal("stock-operation-dialog", {
      title: "complete",
      operation: operation,
      requireReason: "",
      closeModal: () => dispose(),
    });
    handleMutate("ws/rest/v1/stockmanagement/stockoperation");
  };
  const tableRows = useMemo(() => {
    return items?.map((stockOperation, index) => ({
      ...stockOperation,
      id: stockOperation?.uuid,
      key: `key-${stockOperation?.uuid}`,
      operationTypeName: `${stockOperation?.operationTypeName}`,
      operationNumber: (
        <EditStockOperationActionMenu
          model={items[index]}
          operations={operations}
        />
      ),
      status: `${stockOperation?.status}`,
      source: `${stockOperation?.sourceName ?? ""}`,
      destination: `${stockOperation?.destinationName ?? ""}`,
      location: (
        <>
          {" "}
          {stockOperation?.sourceName ?? ""}{" "}
          {stockOperation?.sourceName && stockOperation?.destinationName ? (
            <ArrowRight size={16} />
          ) : (
            ""
          )}{" "}
          {stockOperation?.destinationName ?? ""}{" "}
        </>
      ),
      responsiblePerson: `${
        stockOperation?.responsiblePersonFamilyName ??
        stockOperation?.responsiblePersonOther ??
        ""
      } ${stockOperation?.responsiblePersonGivenName ?? ""}`,
      operationDate: formatDisplayDate(stockOperation?.operationDate),
      details: (
        <div className="tbl-expand-display-fields">
          <div className="field-label">
            <span className="field-title">Created</span>
            <span className="field-desc">
              <span className="action-date">
                {formatDisplayDate(stockOperation?.dateCreated)}
              </span>{" "}
              By
              <span className="action-by">
                {stockOperation.creatorFamilyName ?? ""}{" "}
                {stockOperation.creatorGivenName ?? ""}
              </span>
            </span>
          </div>
          {stockOperation?.status !== StockOperationStatusNew &&
            stockOperation?.status !== StockOperationStatusReturned &&
            stockOperation?.submittedDate && (
              <div className="field-label">
                <span className="field-title">Submitted</span>
                <span className="field-desc">
                  <span className="action-date">
                    {formatDisplayDate(stockOperation?.submittedDate)}
                  </span>{" "}
                  By
                  <span className="action-by">
                    {stockOperation.submittedByFamilyName ?? ""}{" "}
                    {stockOperation.submittedByGivenName ?? ""}
                  </span>
                </span>
              </div>
            )}

          {stockOperation?.completedDate && (
            <div className="field-label">
              <span className="field-title">Completed</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.completedDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.completedByFamilyName ?? ""}{" "}
                  {stockOperation.completedByGivenName ?? ""}
                </span>
              </span>
            </div>
          )}

          {stockOperation?.status === StockOperationStatusCancelled && (
            <div className="field-label">
              <span className="field-title">Cancelled</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.cancelledDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.cancelledByFamilyName ?? ""}{" "}
                  {stockOperation.cancelledByGivenName ?? ""}
                </span>
                <p>{stockOperation.cancelReason}</p>
              </span>
            </div>
          )}

          {stockOperation?.status === StockOperationStatusRejected && (
            <div className="field-label">
              <span className="field-title">Rejected</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.rejectedDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.rejectedByFamilyName ?? ""}{" "}
                  {stockOperation.rejectedByGivenName ?? ""}
                </span>
                <p>{stockOperation.rejectionReason}</p>
              </span>
            </div>
          )}

          {stockOperation?.status === StockOperationStatusReturned && (
            <div className="field-label">
              <span className="field-title">Returned</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.returnedDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.returnedByFamilyName ?? ""}{" "}
                  {stockOperation.returnedByGivenName ?? ""}
                </span>
                <p>{stockOperation.returnReason}</p>
              </span>
            </div>
          )}
        </div>
      ),
      actions: (
        <OverflowMenu flipped={"true"} aria-label="overflow-menu">
          <OverflowMenuItem itemText="Complete" onClick={handleOnComplete} />
          <OverflowMenuItem
            itemText="Edit"
            onClick={() => {
              launchAddOrEditDialog(
                items[index],
                true,
                operation,
                operations,
                false
              );
            }}
          />
        </OverflowMenu>
      ),
    }));
  }, [
    items,
    filters.type,
    filters.status,
    operations,
    handleOnComplete,
    operation,
  ]);

  if (isLoading) {
    return (
      <DataTableSkeleton
        className={styles.dataTableSkeleton}
        showHeader={false}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );
  }

  return (
    <div className={styles.tableOverride}>
      <TabPanel>Stock operations to track movement of stock.</TabPanel>
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
        }) => (
          <TableContainer>
            <TableToolbar
              style={{
                position: "static",
                overflow: "visible",
                backgroundColor: "color",
              }}
            >
              <TableToolbarContent className={styles.toolbarContent}>
                <AdvancedFiltersList
                  onFilterSelect={openModalWithConfig}
                  operationTypes={filterOptions.operationTypes}
                  statuses={filterOptions.statuses}
                />
                {isModalOpen && (
                  <AdvancedFiltersMenuModal
                    config={modalConfig}
                    closeModal={closeModal}
                  />
                )}
                <TableToolbarSearch
                  className={styles.patientListSearch}
                  onChange={onInputChange}
                  placeholder="Filter Table"
                  size="sm"
                />
                <StockOperationTypesSelector
                  onOperationTypeSelected={(operation) => {
                    launchAddOrEditDialog(
                      initialStockOperationValue(),
                      false,
                      operation,
                      operations,
                      false
                    );
                  }}
                  onOperationLoaded={(ops) => {
                    operations = ops;
                  }}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map(
                    (header) =>
                      header.key !== "details" && (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                          className={
                            isDesktop
                              ? styles.desktopHeader
                              : styles.tabletHeader
                          }
                          key={`${header.key}`}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      )
                  )}
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableExpandRow
                        className={
                          isDesktop ? styles.desktopRow : styles.tabletRow
                        }
                        {...getRowProps({ row })}
                      >
                        {row.cells.map(
                          (cell) =>
                            cell?.info?.header !== "details" && (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            )
                        )}
                      </TableExpandRow>
                      <TableExpandedRow colSpan={headers.length + 2}>
                        <>
                          <StructuredListHead>
                            <StructuredListRow head>
                              <StructuredListCell head>
                                Date Created
                              </StructuredListCell>
                              <StructuredListCell head>
                                Date Completed
                              </StructuredListCell>
                              <StructuredListCell head>
                                Batch Number
                              </StructuredListCell>
                              <StructuredListCell head>Qty</StructuredListCell>
                            </StructuredListRow>
                          </StructuredListHead>
                          <StructuredListBody>
                            <StructuredListRow>
                              <StructuredListCell noWrap>
                                {items[index]?.dateCreated
                                  ? formatDisplayDate(items[index]?.dateCreated)
                                  : ""}
                                &nbsp;
                                {items[index]?.dateCreated ? "By" : ""}
                                &nbsp;
                                {items[index]?.dateCreated
                                  ? items[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.completedDate
                                  ? formatDisplayDate(
                                      items[index]?.completedDate
                                    )
                                  : ""}
                                &nbsp;
                                {items[index]?.completedDate ? "By" : ""}
                                &nbsp;
                                {items[index]?.completedDate
                                  ? items[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.stockOperationItems
                                  ? items[index].stockOperationItems
                                      ?.map((item) => item.batchNo)
                                      .join(" ")
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.stockOperationItems
                                  ? items[index].stockOperationItems
                                      ?.map((item) => item.quantity)
                                      .join(" ")
                                  : ""}
                              </StructuredListCell>
                            </StructuredListRow>
                          </StructuredListBody>
                        </>
                      </TableExpandedRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t("noOperationsToDisplay", "No Stock Items to display")}
                    </p>
                    <p className={styles.helper}>
                      {t("checkFilters", "Check the filters above")}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </TableContainer>
        )}
      ></DataTable>
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
    </div>
  );
};

export default StockOperations;
