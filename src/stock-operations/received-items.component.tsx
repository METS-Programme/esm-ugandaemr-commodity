import React from 'react';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../core/api/types/stockOperation/StockOperationDTO';
import {
  DataTable,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  DataTableSkeleton,
} from '@carbon/react';

const formatDate = (date: Date | string | null) => {
  if (!date) return ' ';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

interface ReceivedItemsProps {
  model?: StockOperationDTO;
}

const ReceivedItems: React.FC<ReceivedItemsProps> = ({ model }) => {
  const { t } = useTranslation();

  const headers = [
    { key: 'item', header: t('item', 'Item') },
    { key: 'requested', header: t('requested', 'Requested') },
    { key: 'batch', header: t('batch', 'Batch No') },
    { key: 'expiry', header: t('expiry', 'Expiry Date') },
    { key: 'qtySent', header: t('quantitySent', 'Quantity Sent') },
    { key: 'qtyReceived', header: t('quantityReceived', 'Quantity Received') },
    {
      key: 'qtyUoM',
      header: t('quantityUoM', 'Quantity Unit of Measurement(UoM)'),
    },
  ];

  const rows =
    model?.stockOperationItems?.map((item) => ({
      id: item.uuid,
      item: item.stockItemName,
      requested: item.quantityRequested || ' ',
      batch: item.batchNo,
      expiry: formatDate(item.expiration),
      qtySent: item.quantity || ' ',
      qtyReceived: item.quantityReceived || ' ',
      qtyUoM: item.quantityReceivedPackagingUOMName,
    })) || [];

  if (!model) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <div style={{ margin: '10px' }}>
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default ReceivedItems;
