import { CompareProperties } from './compare-properties';
import {
  ChangeType,
  IPageActionChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { IPageAction } from 'cal-to-json/models/page-action';

const ElementCollectionName = 'PageActions';
const ElementName = 'PageAction';

export class ComparePageActions {
  static compareCollection(
    propertyName: string,
    baseActions: Array<IPageAction>,
    customActions: Array<IPageAction>
  ): ICollectionChange<IPageActionChange> {
    const changes: Array<IPageActionChange> = [];
    const change: ICollectionChange<IPageActionChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedActions: Array<IPageAction> = [];

    baseActions.forEach(baseAction => {
      let customAction = customActions.find(item => item.id === baseAction.id);

      if (customAction) {
        comparedActions.push(customAction);
        const change = this.compare(baseAction, customAction);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseAction.id,
          base: baseAction,
          custom: null,
          change: ChangeType.DELETE,
        });
      }
    });

    customActions.forEach(customAction => {
      let actionFound = comparedActions.find(
        item => item.id === customAction.id
      );

      if (!actionFound) {
        changes.push({
          element: ElementName,
          id: customAction.id,
          base: null,
          custom: customAction,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IPageAction,
    customObject: IPageAction
  ): IPageActionChange {
    const changes: Array<IMemberChange> = [];
    const change: IPageActionChange = {
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
