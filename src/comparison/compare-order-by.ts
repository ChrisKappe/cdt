import { IChange } from './change.model';
import { IOrderBy } from 'cal-to-json/cal/order-by-reader';

const ElementName = 'OrderBy';

export class CompareOrderBy {
  static compare(
    baseItems: Array<IOrderBy>,
    customItems: Array<IOrderBy>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      change: 'NONE',
      changes: changes,
    };

    let base = this.orderByToString(baseItems);
    let custom = this.orderByToString(customItems);
    if (base !== custom) {
      return {
        element: ElementName,
        change: 'MODIFY',
        base: baseItems,
        custom: customItems,
      };
    }

    return change;
  }

  static orderByToString(items: Array<IOrderBy>) {
    const items2: Array<string> = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.direction) items2.push(`${item.column} ${item.direction}`);
      else items2.push(item.column);
    }

    return items2.join(', ');
  }
}
