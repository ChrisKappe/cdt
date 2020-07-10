import { CompareProperties } from './compare-properties';
import { IChange, ChangeType } from './change.model';
import IReportLabel from 'cal-to-json/models/report-label';

const ElementCollectionName = 'ReportLabels';
const ElementName = 'ReportLabel';

export class CompareReportLabels {
  static compareCollection(
    baseLabels: Array<IReportLabel>,
    customLabels: Array<IReportLabel>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedLabels: Array<IReportLabel> = [];

    baseLabels.forEach(baseLabel => {
      let customLabel = customLabels.find(
        item => item.id === baseLabel.id && item.name === baseLabel.name
      );

      if (customLabel) {
        comparedLabels.push(customLabel);
        const change = this.compare(baseLabel, customLabel);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseLabel.id,
          name: baseLabel.name,
          change: ChangeType.DELETE,
        });
      }
    });

    customLabels.forEach(customLabel => {
      let labelFound = comparedLabels.find(
        item => item.id === customLabel.id && item.name === customLabel.name
      );

      if (!labelFound) {
        changes.push({
          element: ElementName,
          id: customLabel.id,
          name: customLabel.name,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(baseLabel: IReportLabel, customLabel: IReportLabel): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseLabel.id,
      name: baseLabel.name,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseLabel) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
        case 'name':
          if (baseLabel[key] !== customLabel[key]) {
            changes.push({
              element: 'Property',
              name: 'dataType',
              base: baseLabel[key],
              custom: customLabel[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseLabel[key] || [],
            customLabel[key] || []
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
