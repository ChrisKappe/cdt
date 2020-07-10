import { CompareVariables } from './compare-variables';
import { ITrigger } from 'cal-to-json/cal/trigger-reader';
import { IChange, ChangeType } from './change.model';

const ElementName = 'Trigger';

export class CompareTrigger {
  static compare(
    triggerName: string,
    baseTrigger: ITrigger,
    customTrigger: ITrigger
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      name: triggerName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const varChange = CompareVariables.compareCollection(
      baseTrigger.variables || [],
      customTrigger.variables || []
    );
    if (varChange.change !== ChangeType.NONE) changes.push(varChange);

    if (baseTrigger.body !== customTrigger.body) {
      changes.push({
        element: 'Property',
        name: 'body',
        base: baseTrigger.body,
        custom: customTrigger.body,
        change: ChangeType.MODIFY,
      });
    }

    return change;
  }
}
