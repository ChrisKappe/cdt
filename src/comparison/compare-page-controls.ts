import { CompareProperties } from './compare-properties';
import { IChange, ChangeType } from './change.model';
import IPageControl from 'cal-to-json/models/page-control';

const ElementCollectionName = 'PageControls';
const ElementName = 'PageControl';

export class ComparePageControls {
  static compareCollection(
    baseControls: Array<IPageControl>,
    customControls: Array<IPageControl>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedControls: Array<IPageControl> = [];

    baseControls.forEach(baseControl => {
      let customControl = customControls.find(
        item => item.id === baseControl.id
      );

      if (customControl) {
        comparedControls.push(customControl);
        const change = this.compare(baseControl, customControl);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseControl.id,
          change: ChangeType.DELETE,
        });
      }
    });

    customControls.forEach(customControl => {
      let controlFound = comparedControls.find(
        item => item.id === customControl.id
      );

      if (!controlFound) {
        changes.push({
          element: ElementName,
          id: customControl.id,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseControl: IPageControl,
    customControl: IPageControl
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseControl.id,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseControl) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
        case 'indentation':
        case 'type':
          if (baseControl[key] !== customControl[key]) {
            changes.push({
              element: 'Property',
              name: 'dataType',
              base: baseControl[key],
              custom: customControl[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseControl[key] || [],
            customControl[key] || []
          );
          if (propChange.change !== ChangeType.NONE) changes.push(propChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
