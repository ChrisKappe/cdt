import { CompareProperties } from './compare-properties';
import {
  ChangeType,
  IPageControlChange,
  IMemberChange,
  ICollectionChange,
  MemberChange,
} from './change.model';
import IPageControl from 'cal-to-json/models/page-control';

const ElementCollectionName = 'PageControls';
const ElementName = 'PageControl';

export class ComparePageControls {
  static compareCollection(
    propertyName: string,
    baseControls: Array<IPageControl>,
    customControls: Array<IPageControl>
  ): ICollectionChange<IPageControlChange> {
    const changes: Array<IPageControlChange> = [];
    const change: ICollectionChange<IPageControlChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
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
          base: baseControl,
          custom: null,
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
          base: null,
          custom: customControl,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IPageControl,
    customObject: IPageControl
  ): IPageControlChange {
    const changes: Array<IMemberChange> = [];
    const change: IPageControlChange = {
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
        case 'type':
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
