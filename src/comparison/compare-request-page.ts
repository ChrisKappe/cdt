import { CompareProperties } from './compare-properties';
import { IChange, ChangeType } from './change.model';
import IRequestPage from 'cal-to-json/models/request-page';
import { ComparePageControls } from './compare-page-controls';

const ElementName = 'RequestPage';

export class CompareRequestPage {
  static compare(
    baseRequestPage: IRequestPage,
    customRequestPage: IRequestPage
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseRequestPage) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'controls':
          const controlsChange = ComparePageControls.compareCollection(
            baseRequestPage[key] || [],
            customRequestPage[key] || []
          );
          if (controlsChange.change !== ChangeType.NONE)
            changes.push(controlsChange);
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseRequestPage[key] || [],
            customRequestPage[key] || []
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
