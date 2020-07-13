import {
  ChangeType,
  IDataItemLinkChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { IDataItemLink } from '../cal-to-json/cal/data-item-link-reader';

export class CompareDataItemLinks {
  static compareCollection(
    baseDataItemLinks: Array<IDataItemLink>,
    customDataItemLinks: Array<IDataItemLink>
  ): ICollectionChange<IDataItemLinkChange> {
    const changes: Array<IDataItemLinkChange> = [];
    const change: ICollectionChange<IDataItemLinkChange> = {
      changeType: ChangeType.NONE,
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
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          field: baseDataItemLink.field,
          base: baseDataItemLink,
          custom: null,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customDataItemLinks.forEach(customDataItemLink => {
      let dataItemLinkFound = comparedDataItemLinks.find(
        item => item.field === customDataItemLink.field
      );

      if (!dataItemLinkFound) {
        changes.push({
          field: customDataItemLink.field,
          base: null,
          custom: customDataItemLink,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IDataItemLink,
    customObject: IDataItemLink
  ): IDataItemLinkChange {
    const changes: Array<IMemberChange> = [];
    const change: IDataItemLinkChange = {
      field: baseObject.field,
      base: baseObject,
      custom: customObject,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'field':
        case 'referenceDataItem':
        case 'referenceField':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        default:
          throw new Error(`${member} not implemented`);
      }
    }

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
