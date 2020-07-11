import { ChangeType, IOrderByChange } from './change.model';
import { IOrderBy } from 'cal-to-json/cal/order-by-reader';

const ElementName = 'OrderBy';

export class CompareOrderBy {
  static compare(
    propertyName: string,
    baseItems: Array<IOrderBy>,
    customItems: Array<IOrderBy>
  ): IOrderByChange {
    const change: IOrderByChange = {
      element: ElementName,
      propertyName: propertyName,
      base: baseItems,
      custom: customItems,
      change: ChangeType.NONE,
    };

    let base = this.orderByToString(baseItems);
    let custom = this.orderByToString(customItems);
    if (base !== custom) {
      return {
        element: ElementName,
        propertyName: propertyName,
        base: baseItems,
        custom: customItems,
        change: ChangeType.MODIFY,
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
