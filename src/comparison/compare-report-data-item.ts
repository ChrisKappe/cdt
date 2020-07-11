import { CompareProperties } from './compare-properties';
import {
  ChangeType,
  IReportDataItemChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import IReportDataItem from 'cal-to-json/models/report-data-item';

const ElementCollectionName = 'ReportDataItems';
const ElementName = 'ReportDataItem';

export class CompareReportDataItems {
  static compareCollection(
    propertyName: string,
    baseDataItems: Array<IReportDataItem>,
    customDataItems: Array<IReportDataItem>
  ): ICollectionChange<IReportDataItemChange> {
    const changes: Array<IReportDataItemChange> = [];
    const change: ICollectionChange<IReportDataItemChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
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
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseDataItem.id,
          base: baseDataItem,
          custom: null,
          change: ChangeType.DELETE,
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
          base: null,
          custom: customDataItem,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IReportDataItem,
    customObject: IReportDataItem
  ): IReportDataItemChange {
    const changes: Array<IMemberChange> = [];
    const change: IReportDataItemChange = {
      element: ElementName,
      id: baseObject.id,
      base: baseObject,
      custom: customObject,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
        case 'indentation':
        case 'name':
        case 'dataType':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'properties':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareProperties.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        default:
          throw new Error(`${member} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
