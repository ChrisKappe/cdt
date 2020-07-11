import { CompareVariables } from './compare-variables';
import { ITrigger } from 'cal-to-json/cal/trigger-reader';
import {
  ChangeType,
  ITriggerChange,
  IMemberChange,
  MemberChange,
} from './change.model';

export class CompareTrigger {
  static compare(
    triggerName: string,
    baseTrigger: ITrigger,
    customTrigger: ITrigger
  ): ITriggerChange {
    const changes: Array<IMemberChange> = [];
    const change: ITriggerChange = {
      propertyName: triggerName,
      base: baseTrigger,
      custom: customTrigger,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    MemberChange.AddChangeObject(
      changes,
      'Variables',
      CompareVariables.compareCollection(
        'Variables',
        baseTrigger.variables || [],
        customTrigger.variables || []
      )
    );

    MemberChange.AddChange(
      changes,
      'Code',
      baseTrigger.body,
      customTrigger.body
    );

    return change;
  }
}
