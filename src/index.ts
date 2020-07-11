#!/usr/bin/env node --max_old_space_size=8192

import * as path from 'path';
import { ExcelReport } from './report';
import * as fs from 'fs';
import ObjectReader from './cal-to-json/cal/object-reader';
import { CompareAppObjects } from './comparison/compare-app-objects';

export default class Main {
  static start() {
    let baseObjectFileName = path.resolve('src/res/BaseObjects.txt');
    let customObjectFileName = path.resolve('src/res/CustomObjects.txt');

    const baseObjects = ObjectReader.readObjects(baseObjectFileName);
    const customObjects = ObjectReader.readObjects(customObjectFileName);

    console.log('Compare Objects:');
    const changes = CompareAppObjects.compareCollection(
      baseObjects,
      customObjects
    );

    let changesFileName = path.resolve('src/res/changes.json');
    fs.writeFileSync(changesFileName, JSON.stringify(changes, null, 2), 'utf8');
  }

  static generateReport() {
    const changesFileName = path.resolve('src/res/changes.json');
    const changesReportFileName = path.resolve('src/res/changes.xlsx');

    const data = fs.readFileSync(changesFileName);
    const changes = JSON.parse(data.toString()) as any;

    ExcelReport.write(changes, changesReportFileName);
    console.log('completed');
  }
}

Main.start();
