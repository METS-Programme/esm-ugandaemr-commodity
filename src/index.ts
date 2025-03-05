import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import appMenu from './stock-app-menu-item/item.component';
import bulkImportComponent from './stock-items/add-bulk-stock-item/stock-items-bulk-import.component';
import deleteUserModalComponent from './stock-user-role-scopes/delete-stock-user-scope-modal.component';
import deleteStockModalComponent from './stock-sources/delete-stock-modal.component';
import stockOperationDialogComponent from './stock-operations/stock-operations-dialog/stock-operations-dialog.component';
import stockManagementComponent from './stock-management.component';
import stockManagementAdminCardLinkComponent from './stock-management-admin-card-link.component';
import deletePackagingUnitModalButtonComponent from './stock-items/add-stock-item/packaging-units/packaging-units-delete-modal-button.component';
import deletePackagingUnitComponent from './stock-items/add-stock-item/packaging-units/packaging-units-delete-modal.component';
import Root from './root.component';
import StockHomeLandingPage from './stock-home/stock-home-landing-page-component';
import { createDashboardLink } from './createDashboardLink';
import SideMenu from './side-menu/side-menu.component';
import StockOperationsComponent from './stock-operations/stock-operations.component';
import StockItems from './stock-items/stock-items.component';
import StockUserScopes from './stock-user-role-scopes/stock-user-role-scopes.component';
import StockSources from './stock-sources/stock-sources.component';
import StockLocations from './stock-locations/stock-locations.component';
import StockReports from './stock-reports/report-list/stock-reports.component';
import StockSettings from './stock-settings/stock-settings.component';
import TransactionsBincardPrintPreview from './stock-items/add-stock-item/transactions/printout/transactions-print-bincard-preview.modal';
import TransactionsStockcardPrintPreview from './stock-items/add-stock-item/transactions/printout/transactions-print-stockcard-preview.modal';

const moduleName = '@openmrs/esm-stock-management-app';

const options = {
  featureName: 'stock-management',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const stockManagementAdminCardLink = getSyncLifecycle(stockManagementAdminCardLinkComponent, options);
export const stockNavMenu = getSyncLifecycle(SideMenu, options);

// t("overview","Overview")
export const stockOverview = getSyncLifecycle(StockHomeLandingPage, options);
export const stockOverviewLink = getSyncLifecycle(
  createDashboardLink({ title: 'Overview', name: 'stock-management' }),
  options,
);

// t("operations","Operations")
export const stockOperations = getSyncLifecycle(StockOperationsComponent, options);
export const stockOperationsLink = getSyncLifecycle(
  createDashboardLink({ title: 'Operations', name: 'operations' }),
  options,
);

// t("items","Items")
export const stockItems = getSyncLifecycle(StockItems, options);
export const stockItemsLink = getSyncLifecycle(createDashboardLink({ title: 'Items', name: 'items' }), options);

// t("useScopes","User role scopes")
export const stockUserScopes = getSyncLifecycle(StockUserScopes, options);
export const stockUserScopesLink = getSyncLifecycle(
  createDashboardLink({ title: 'User role scopes', name: 'user-scopes' }),
  options,
);

// t("sources","Sources")
export const stockSources = getSyncLifecycle(StockSources, options);
export const stockSourcesLink = getSyncLifecycle(createDashboardLink({ title: 'Sources', name: 'sources' }), options);

// t("locations","Locations")
export const stockLocations = getSyncLifecycle(StockLocations, options);
export const stockLocationsLink = getSyncLifecycle(
  createDashboardLink({ title: 'Locations', name: 'locations' }),
  options,
);

// t("reports","Reports")
export const stockReports = getSyncLifecycle(StockReports, options);
export const stockReportsLink = getSyncLifecycle(createDashboardLink({ title: 'Reports', name: 'reports' }), options);

// t("settings","Settings")
export const stockSettings = getSyncLifecycle(StockSettings, options);
export const stockSettingsLink = getSyncLifecycle(
  createDashboardLink({ title: 'Settings', name: 'settings' }),
  options,
);

export const stockManagement = getSyncLifecycle(stockManagementComponent, options);

export const root = getSyncLifecycle(Root, options);

export const deleteStockModal = getAsyncLifecycle(() => import('./stock-sources/delete-stock-modal.component'), {
  featureName: 'delete-stock-modal',
  moduleName,
});

export const deleteUserScopeModal = getAsyncLifecycle(
  () => import('./stock-user-role-scopes/delete-stock-user-scope-modal.component'),
  {
    featureName: 'delete-stock-user-scope-modal',
    moduleName,
  },
);

export const deletePackagingUnitModal = getAsyncLifecycle(
  () => import('./stock-items/add-stock-item/packaging-units/packaging-units-delete-modal.component'),
  {
    featureName: 'delete-packaging-unit-modal',
    moduleName,
  },
);

export const importBulkStockItemsModal = getAsyncLifecycle(
  () => import('./stock-items/add-bulk-stock-item/stock-items-bulk-import.component'),
  {
    featureName: 'import-bulk-stock-items-modal',
    moduleName,
  },
);

export const stockOperationModal = getAsyncLifecycle(
  () => import('./stock-operations/stock-operations-dialog/stock-operations-dialog.component'),
  {
    featureName: 'stock-operation-modal',
    moduleName,
  },
);

export const deletePackagingUnitButton = getSyncLifecycle(deletePackagingUnitModalButtonComponent, {
  featureName: 'delete-packaging-unit-button',
  moduleName,
});

export const stockManagementAppMenuItem = getSyncLifecycle(appMenu, options);

export const stockOperationStockItemForm = getAsyncLifecycle(
  () => import('./stock-operations/stock-operations-forms/stock-item-form/stock-item-form.workspace'),
  options,
);
export const transactionBincardPrintPreviewModal = getSyncLifecycle(TransactionsBincardPrintPreview, options);
export const transactionStockcardPrintPreviewModal = getSyncLifecycle(TransactionsStockcardPrintPreview, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
