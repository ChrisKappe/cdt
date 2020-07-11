import { CompareProcedures } from './compare-procedures';
import {
  ChangeType,
  ICodeChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareVariables } from './compare-variables';

export class CompareCode {
  static compare(baseObject: any, customObject: any): ICodeChange {
    const changes: Array<IMemberChange> = [];
    const change: ICodeChange = {
      changeType: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'documentation':
          MemberChange.AddChange(
            changes,
            member,
            baseObject.documentation,
            customObject.documentation
          );
          break;
        case 'variables':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareVariables.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        case 'procedures':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareProcedures.compareCollection(
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

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
