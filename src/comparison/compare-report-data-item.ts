import { CompareProperties } from './compare-properties';
import { IChange } from './change.model';
import IReportDataItem from 'cal-to-json/models/report-data-item';

const ElementCollectionName = 'ReportDataItems';
const ElementName = 'ReportDataItem';

export class CompareReportDataItems {
  static compareCollection(
    baseDataItems: Array<IReportDataItem>,
    customDataItems: Array<IReportDataItem>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: 'NONE',
      changes: changes,
    };

    const comparedDataItems: Array<IReportDataItem> = [];

    baseDataItems.forEach(baseDataItem => {
      let customDataItem = customDataItems.find(
        item => item.id === baseDataItem.id
      );

      if (customDataItem) {
        comparedDataItems.push(customDataItem);
        const change = this.compare(baseDataItem, customDataItem);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseDataItem.id,
          change: 'DELETE',
        });
      }
    });

    customDataItems.forEach(customDataItem => {
      let dataItemFound = comparedDataItems.find(
        item => item.id === customDataItem.id
      );

      if (!dataItemFound) {
        changes.push({
          element: ElementName,
          id: customDataItem.id,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(
    baseDataItem: IReportDataItem,
    customDataItem: IReportDataItem
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseDataItem.id,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseDataItem) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
        case 'indentation':
        case 'name':
        case 'dataType':
          if (baseDataItem[key] !== customDataItem[key]) {
            changes.push({
              element: 'Property',
              name: 'dataType',
              base: baseDataItem[key],
              custom: customDataItem[key],
              change: 'MODIFY',
            });
          }
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseDataItem[key] || [],
            customDataItem[key] || []
          );
          if (propChange.change !== 'NONE') changes.push(propChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
