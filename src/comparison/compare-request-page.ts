import { CompareProperties } from './compare-properties';
import {
  IChange,
  ChangeType,
  IRequestPageChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import IRequestPage from 'cal-to-json/models/request-page';
import { ComparePageControls } from './compare-page-controls';

export class CompareRequestPage {
  static compare(
    baseObject: IRequestPage,
    customObject: IRequestPage
  ): IChange {
    const changes: Array<IMemberChange> = [];
    const change: IRequestPageChange = {
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
        case 'controls':
          MemberChange.AddChangeObject(
            changes,
            member,
            ComparePageControls.compareCollection(
              baseObject[member] || [],
              customObject[member] || []
            )
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
