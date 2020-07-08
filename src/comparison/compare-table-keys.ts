import ITableKey from 'cal-to-json/cal/table-key';
import { IChange } from './change.model';
import { CompareProperties } from './compare-properties';

export class CompareTableKeys {
  static compareCollection(
    baseKeys: Array<ITableKey>,
    customKeys: Array<ITableKey>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'Keys',
      change: 'NONE',
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
        if (keyChange.change !== 'NONE') changes.push(keyChange);
      } else
        changes.push({
          name: baseKey.fields.join(','),
          change: 'DELETE',
        });
    });

    customKeys.forEach(customKey => {
      let keyFound = comparedKeys.find(
        item => item.fields.join(',') === customKey.fields.join(',')
      );

      if (!keyFound) {
        changes.push({
          name: customKey.fields.join(', '),
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(baseKey: ITableKey, customKey: ITableKey): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: baseKey.fields.join(', '),
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseKey) {
      switch (key) {
        case 'className':
        case 'constructor':
        case 'fields':
          break;
        case 'enabled':
          if (baseKey.enabled !== customKey.enabled) {
            changes.push({
              name: 'enables',
              base: baseKey.enabled,
              custom: customKey.enabled,
              change: 'MODIFY',
            });
          }
          break;
        case 'properties':
          const propsChange = CompareProperties.compareCollection(
            key,
            baseKey[key] || [],
            customKey[key] || []
          );
          if (propsChange.change !== 'NONE') changes.push(propsChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
