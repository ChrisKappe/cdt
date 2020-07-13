import { CompareProperties } from './compare-properties';
import {
  ChangeType,
  IPageActionChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { IPageAction } from 'cal-to-json/models/page-action';

export class ComparePageActions {
  static compareCollection(
    baseActions: Array<IPageAction>,
    customActions: Array<IPageAction>
  ): ICollectionChange<IPageActionChange> {
    const changes: Array<IPageActionChange> = [];
    const change: ICollectionChange<IPageActionChange> = {
      changeType: ChangeType.NONE,
      changes: changes,
    };

    const comparedActions: Array<IPageAction> = [];

    baseActions.forEach(baseAction => {
      let customAction = customActions.find(item => item.id === baseAction.id);

      if (customAction) {
        comparedActions.push(customAction);
        const change = this.compare(baseAction, customAction);
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          id: baseAction.id,
          base: baseAction,
          custom: null,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customActions.forEach(customAction => {
      let actionFound = comparedActions.find(
        item => item.id === customAction.id
      );

      if (!actionFound) {
        changes.push({
          id: customAction.id,
          base: null,
          custom: customAction,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IPageAction,
    customObject: IPageAction
  ): IPageActionChange {
    const changes: Array<IMemberChange> = [];
    const change: IPageActionChange = {
      id: baseObject.id,
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
              baseObject[member] || [],
              customObject[member] || []
            )
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
