import { IChange, ChangeType } from './change.model';
import { IDataItemLink } from 'cal-to-json/cal/data-item-link-reader';

const ElementCollectionName = 'DataItemLinks';
const ElementName = 'DataItemLink';

export class CompareDataItemLinks {
  static compareCollection(
    baseDataItemLinks: Array<IDataItemLink>,
    customDataItemLinks: Array<IDataItemLink>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedDataItemLinks: Array<IDataItemLink> = [];

    baseDataItemLinks.forEach(baseDataItemLink => {
      let customDataItemLink = customDataItemLinks.find(
        item => item.field === baseDataItemLink.field
      );

      if (customDataItemLink) {
        comparedDataItemLinks.push(customDataItemLink);
        const change = this.compare(baseDataItemLink, customDataItemLink);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          field: baseDataItemLink.field,
          change: ChangeType.DELETE,
        });
      }
    });

    customDataItemLinks.forEach(customDataItemLink => {
      let dataItemLinkFound = comparedDataItemLinks.find(
        item => item.field === customDataItemLink.field
      );

      if (!dataItemLinkFound) {
        changes.push({
          element: ElementName,
          field: customDataItemLink.field,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseDataItemLink: IDataItemLink,
    customDataItemLink: IDataItemLink
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      field: baseDataItemLink.field,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseDataItemLink) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'field':
        case 'referenceDataItem':
        case 'referenceField':
          if (baseDataItemLink[key] !== customDataItemLink[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseDataItemLink[key],
              custom: customDataItemLink[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
