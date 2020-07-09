import { IAppObject } from 'cal-to-json/cal/object-reader';
import { IChange } from './change.model';
import { CompareProperties } from './compare-properties';
import { CompareTableFields } from './compare-table-fields';
import { CompareTableKeys } from './compare-table-keys';
import { CompareFieldGroups } from './compare-field-groups';
import { CompareCode } from './compare-code';
import { ComparePageControls } from './compare-page-controls';

const ElementName = 'ApplicationObject';

export class CompareAppObjects {
  static compareCollection(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>
  ): Array<IChange> {
    const changes: Array<IChange> = [];
    const comparedObjects: Array<IAppObject> = [];

    baseObjects.forEach(baseObject => {
      let customObject = customObjects.find(
        item => item.id === baseObject.id && item.type === baseObject.type
      );

      if (customObject) {
        comparedObjects.push(customObject);
        const change = this.compare(baseObject, customObject);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseObject.id,
          type: baseObject.type,
          name: baseObject.name,
          change: 'DELETE',
        });
      }
    });

    customObjects.forEach(customObject => {
      let objectFound = comparedObjects.find(
        item => item.id === customObject.id && item.type === customObject.type
      );

      if (!objectFound) {
        changes.push({
          element: ElementName,
          id: customObject.id,
          type: customObject.type,
          name: customObject.name,
          change: 'ADD',
        });
      }
    });

    return changes;
  }

  static compare(baseObject: IAppObject, customObject: IAppObject): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseObject.id,
      type: baseObject.type,
      name: baseObject.name,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseObject) {
      switch (key) {
        case 'type':
        case 'id':
        case 'name':
          if (baseObject[key] !== customObject[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseObject[key],
              custom: customObject[key],
              change: 'MODIFY',
            });
          }
          break;
        case 'OBJECT-PROPERTIES':
        case 'PROPERTIES':
          const propsChange = CompareProperties.compareCollection(
            key,
            baseObject[key],
            customObject[key]
          );
          if (propsChange.change !== 'NONE') changes.push(propsChange);
          break;
        case 'FIELDS':
          const fieldsChange = CompareTableFields.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (fieldsChange.change !== 'NONE') changes.push(fieldsChange);
          break;
        case 'KEYS':
          const keysChange = CompareTableKeys.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (keysChange.change !== 'NONE') changes.push(keysChange);
          break;
        case 'FIELDGROUPS':
          const fieldGroupChange = CompareFieldGroups.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (fieldGroupChange.change !== 'NONE')
            changes.push(fieldGroupChange);
          break;
        case 'CONTROLS':
          const pageControlsChange = ComparePageControls.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (pageControlsChange.change !== 'NONE')
            changes.push(pageControlsChange);
          break;
        case 'CODE':
          const codeChange = CompareCode.compare(
            baseObject[key],
            customObject[key]
          );

          if (codeChange.change !== 'NONE') changes.push(codeChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
