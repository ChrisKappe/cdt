import ITableKey from 'cal-to-json/cal/table-key';
import { IChange, ChangeType } from './change.model';
import { CompareProperties } from './compare-properties';

const ElementCollectionName = 'TableKeys';
const ElementName = 'TableKey';

export class CompareTableKeys {
  static compareCollection(
    baseKeys: Array<ITableKey>,
    customKeys: Array<ITableKey>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
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
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(baseKey: ITableKey, customKey: ITableKey): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      fields: baseKey.fields.join(', '),
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseKey) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'fields':
        case 'enabled':
          if (baseKey.enabled !== customKey.enabled) {
            changes.push({
              element: 'Property',
              name: 'enables',
              base: baseKey.enabled,
              custom: customKey.enabled,
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'properties':
          const propsChange = CompareProperties.compareCollection(
            key,
            baseKey[key] || [],
            customKey[key] || []
          );
          if (propsChange.change !== ChangeType.NONE) changes.push(propsChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
