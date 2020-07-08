import { CompareVariables } from './compare-variables';
import { ITrigger } from 'cal-to-json/cal/trigger-reader';
import { IChange } from './change.model';

export class CompareTrigger {
  static compare(
    name: string,
    baseTrigger: ITrigger,
    customTrigger: ITrigger
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: name,
      change: 'NONE',
      changes: changes,
    };

    const varChange = CompareVariables.compareCollection(
      baseTrigger.variables || [],
      customTrigger.variables || []
    );
    if (varChange.change !== 'NONE') changes.push(varChange);

    if (baseTrigger.body !== customTrigger.body) {
      changes.push({
        name: 'body',
        base: baseTrigger.body,
        custom: customTrigger.body,
        change: 'MODIFY',
      });
    }

    return change;
  }
}
