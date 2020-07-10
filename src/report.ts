import { IChange } from 'comparison/change.model';
import * as Excel from 'exceljs';

export class ExcelReport {
  static write(changes: Array<IChange>, filePath: string) {
    console.log(changes.length);
    let workbook = new Excel.Workbook();

    ExcelReport.AddModifiedObjects(workbook, changes);
    ExcelReport.AddModifiedProcedures(workbook, changes);
    ExcelReport.AddDebtors(workbook);

    workbook.xlsx.writeFile(filePath);
  }

  private static AddModifiedProcedures(
    workbook: Excel.Workbook,
    changes: Array<IChange>
  ) {
    let worksheet = workbook.addWorksheet('Modified Procedures');
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Procedure ID', key: 'procedureId' },
      { header: 'Procedure Name', key: 'procedureName' },
      { header: 'Change Type', key: 'changeType' },
    ];

    worksheet.columns[0].width = 10;
    worksheet.columns[1].width = 10;
    worksheet.columns[2].width = 30;
    worksheet.columns[3].width = 10;
    worksheet.columns[4].width = 30;
    worksheet.columns[5].width = 10;

    changes.forEach(appObjectChange => {
      if (appObjectChange.changes) {
        const codeChange = appObjectChange.changes.find(
          i => i.element === 'Code'
        );

        if (codeChange && codeChange.changes) {
          const proceduresChange = codeChange.changes.find(
            i => i.element === 'Procedures'
          );

          if (proceduresChange && proceduresChange.changes) {
            proceduresChange.changes.forEach(procedureChange => {
              worksheet.addRow(
                {
                  objectType: appObjectChange.type,
                  objectId: Number(appObjectChange.id),
                  objectName: appObjectChange.name,
                  procedureId: Number(procedureChange.id),
                  procedureName: procedureChange.name,
                  changeType: appObjectChange.change,
                },
                ''
              );
            });
          }
        }
      }
    });
  }

  private static AddModifiedObjects(
    workbook: Excel.Workbook,
    changes: Array<IChange>
  ) {
    let worksheet = workbook.addWorksheet('Modified Objects');
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Change Type', key: 'changeType' },
    ];

    worksheet.columns[0].width = 10;
    worksheet.columns[1].width = 10;
    worksheet.columns[2].width = 30;
    worksheet.columns[3].width = 10;
    changes.forEach(change => {
      worksheet.addRow(
        {
          objectType: change.type,
          objectId: Number(change.id),
          objectName: change.name,
          changeType: change.change,
        },
        ''
      );
    });

    worksheet.getColumn(1).numFmt = '$0.00';
  }

  private static AddDebtors(workbook: Excel.Workbook) {
    let worksheet = workbook.addWorksheet('Debtors');
    worksheet.columns = [
      { header: 'First Name', key: 'firstName' },
      { header: 'Last Name', key: 'lastName' },
      { header: 'Purchase Price', key: 'purchasePrice' },
      { header: 'Payments Made', key: 'paymentsMade' },
      { header: 'Amount Remaining', key: 'amountRemaining' },
      { header: '% Remaining', key: 'percentRemaining' },
    ];

    // force the columns to be at least as long as their header row.
    // Have to take this approach because ExcelJS doesn't have an autofit property.
    worksheet.columns.forEach(column => {
      const header = column.header || '';
      column.width = header.length < 12 ? 12 : header.length;
    });

    const data = [
      {
        firstName: 'John',
        lastName: 'Bailey',
        purchasePrice: 1000,
        paymentsMade: 100,
      },
      {
        firstName: 'Leonard',
        lastName: 'Clark',
        purchasePrice: 1000,
        paymentsMade: 150,
      },
      {
        firstName: 'Phil',
        lastName: 'Knox',
        purchasePrice: 1000,
        paymentsMade: 200,
      },
      {
        firstName: 'Sonia',
        lastName: 'Glover',
        purchasePrice: 1000,
        paymentsMade: 250,
      },
      {
        firstName: 'Adam',
        lastName: 'Mackay',
        purchasePrice: 1000,
        paymentsMade: 350,
      },
      {
        firstName: 'Lisa',
        lastName: 'Ogden',
        purchasePrice: 1000,
        paymentsMade: 400,
      },
      {
        firstName: 'Elizabeth',
        lastName: 'Murray',
        purchasePrice: 1000,
        paymentsMade: 500,
      },
      {
        firstName: 'Caroline',
        lastName: 'Jackson',
        purchasePrice: 1000,
        paymentsMade: 350,
      },
      {
        firstName: 'Kylie',
        lastName: 'James',
        purchasePrice: 1000,
        paymentsMade: 900,
      },
      {
        firstName: 'Harry',
        lastName: 'Peake',
        purchasePrice: 1000,
        paymentsMade: 1000,
      },
    ];

    // Dump all the data into Excel
    data.forEach((e, index) => {
      // row 1 is the header.
      const rowIndex = index + 2;

      // By using destructuring we can easily dump all of the data into the row without doing much
      // We can add formulas pretty easily by providing the formula property.
      worksheet.addRow(
        {
          ...e,
          amountRemaining: {
            formula: `=C${rowIndex}-D${rowIndex}`,
          },
          percentRemaining: {
            formula: `=E${rowIndex}/C${rowIndex}`,
          },
        },
        ''
      );
    });

    // Set the way columns C - F are formatted
    const figureColumns = [3, 4, 5, 6];
    figureColumns.forEach(i => {
      worksheet.getColumn(i).numFmt = '$0.00';
      worksheet.getColumn(i).alignment = { horizontal: 'center' };
    });

    // Column F needs to be formatted as a percentage.
    worksheet.getColumn(6).numFmt = '0.00%';

    // loop through all of the rows and set the outline style.
    worksheet.eachRow({ includeEmpty: false }, function(_row, rowNumber) {
      worksheet.getCell(`A${rowNumber}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: undefined },
      };

      const insideColumns = ['B', 'C', 'D', 'E'];
      insideColumns.forEach(v => {
        worksheet.getCell(`${v}${rowNumber}`).border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: undefined },
          right: { style: undefined },
        };
      });

      worksheet.getCell(`F${rowNumber}`).border = {
        top: { style: 'thin' },
        left: { style: undefined },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }
}
