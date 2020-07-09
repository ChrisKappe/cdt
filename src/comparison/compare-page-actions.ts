import { CompareProperties } from './compare-properties';
import { IChange } from './change.model';
import { IPageAction } from 'cal-to-json/models/page-action';

const ElementCollectionName = 'PageActions';
const ElementName = 'PageAction';

export class ComparePageActions {
  static compareCollection(
    baseActions: Array<IPageAction>,
    customActions: Array<IPageAction>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: 'NONE',
      changes: changes,
    };

    const comparedActions: Array<IPageAction> = [];

    baseActions.forEach(baseAction => {
      let customAction = customActions.find(
        item => item.id === baseAction.id 
      );

      if (customAction) {
        comparedActions.push(customAction);
        const change = this.compare(baseAction, customAction);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseAction.id,
          change: 'DELETE',
        });
      }
    });

    customActions.forEach(customField => {
      let actionFound = comparedActions.find(
        item => item.id === customField.id
      );

      if (!actionFound) {
        changes.push({
          element: ElementName,
          id: customField.id,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(baseAction: IPageAction, customAction: IPageAction): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseAction.id,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseAction) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
          if (baseAction[key] !== customAction[key]) {
            changes.push({
              element: 'Property',
              name: 'dataType',
              base: baseAction[key],
              custom: customAction[key],
              change: 'MODIFY',
            });
          }
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseAction[key] || [],
            customAction[key] || []
          );
          if (propChange.change !== 'NONE') changes.push(propChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
