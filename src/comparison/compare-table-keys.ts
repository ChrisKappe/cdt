import ITableKey from 'cal-to-json/cal/table-key';
import {
  ChangeType,
  ITableKeyChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareProperties } from './compare-properties';

const ElementCollectionName = 'TableKeys';
const ElementName = 'TableKey';

export class CompareTableKeys {
  static compareCollection(
    propertyName: string,
    baseKeys: Array<ITableKey>,
    customKeys: Array<ITableKey>
  ): ICollectionChange<ITableKeyChange> {
    const changes: Array<ITableKeyChange> = [];
    const change: ICollectionChange<ITableKeyChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedKeys: Array<ITableKey> = [];

    baseKeys.forEach(baseKey => {
      let customKey = customKeys.find(
        item => item.fields.join(',') === baseKey.fields.join(',')
      );

      if (customKey) {
        comparedKeys.push(customKey);

        const keyChange = this.compare(baseKey, customKey);
        if (keyChange.change !== ChangeType.NONE) changes.push(keyChange);
      } else
        changes.push({
          element: ElementName,
          fields: baseKey.fields.join(','),
          base: baseKey,
          custom: null,
          change: ChangeType.DELETE,
        });
    });

    customKeys.forEach(customKey => {
      let keyFound = comparedKeys.find(
        item => item.fields.join(',') === customKey.fields.join(',')
      );

      if (!keyFound) {
        changes.push({
          element: ElementName,
          fields: customKey.fields.join(', '),
          base: null,
          custom: customKey,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(baseKey: ITableKey, customKey: ITableKey): ITableKeyChange {
    const changes: Array<IMemberChange> = [];
    const change: ITableKeyChange = {
      element: ElementName,
      fields: baseKey.fields.join(', '),
      base: baseKey,
      custom: customKey,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseKey) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'fields':
          MemberChange.AddChange(
            changes,
            member,
            baseKey.fields.join(','),
            customKey.fields.join(',')
          );
          break;
        case 'enabled':
          MemberChange.AddChange(
            changes,
            member,
            baseKey[member],
            customKey[member]
          );
          break;
        case 'properties':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareProperties.compareCollection(
              member,
              baseKey[member] || [],
              customKey[member] || []
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
