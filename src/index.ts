#!/usr/bin/env node --max_old_space_size=8192

import * as path from 'path';
import { ExcelReport } from './report';
import * as fs from 'fs';
import ObjectReader, { IAppObject } from './cal-to-json/cal/object-reader';
import { CompareAppObjects } from './comparison/compare-app-objects';
import { IAppObjectChange } from 'comparison/change.model';

export default class Main {
  static compareObjectChanges(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>
  ) {
    console.log('Comparing Objects...');
    return CompareAppObjects.compareCollection(baseObjects, customObjects);
  }

  static saveObjectChanges(changes: Array<IAppObjectChange>) {
    console.log('Saving Changes...');
    let changesFileName = path.resolve('src/res/changes.json');
    fs.writeFileSync(
      changesFileName,
      JSON.stringify(
        changes,
        (key, value) => {
          if (
            (key === 'base' || key === 'custom') &&
            (!value || value instanceof Object)
          ) {
          } else {
            return value;
          }
        },
        2
      ),
      'utf8'
    );
  }

  static generateReportFromJson() {
    const changesFileName = path.resolve('src/res/changes.json');
    const changesReportFileName = path.resolve('src/res/changes.xlsx');

    const data = fs.readFileSync(changesFileName);
    const changes = JSON.parse(data.toString()) as any;

    ExcelReport.write(changes, [], [], changesReportFileName);
    console.log('completed');
  }

  static generateReport(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>,
    changes: Array<IAppObjectChange>
  ) {
    console.log('Generating Report ...');
    const changesReportFileName = path.resolve('src/res/changes.xlsx');
    ExcelReport.write(
      changes,
      baseObjects,
      customObjects,
      changesReportFileName
    );
  }

  static start() {
    let baseObjectFileName = path.resolve('src/res/BaseObjects.txt');
    console.log('Reading Base Objects...');
    const baseObjects = ObjectReader.readObjects(baseObjectFileName);

    let customObjectFileName = path.resolve('src/res/CustomObjects.txt');
    console.log('Reading Custom Objects...');
    const customObjects = ObjectReader.readObjects(customObjectFileName);

    const changes = this.compareObjectChanges(baseObjects, customObjects);
    this.saveObjectChanges(changes);
    this.generateReport(baseObjects, customObjects, changes);
    console.log('All Done!');
  }
}

Main.start();
