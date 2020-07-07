#!/usr/bin/env node --max_old_space_size=8192

import * as path from "path";

import ObjectReader from './cal-to-json/cal/object-reader';
import { CompareObjects } from 'comparison/compare-objects';

export default class Main {
  static start() {
    try {
            
      let baseObjectFileName = path.resolve('src/res/BaseObjects.txt');
      let customObjectFileName = path.resolve('src/res/CustomObjects.txt');
      const baseObjects = ObjectReader.readObjects(baseObjectFileName);
      const customObjects = ObjectReader.readObjects(customObjectFileName);
      
      CompareObjects.compareObjects(baseObjects, customObjects);
      // let outFileName = path.resolve('src/res/BaseObjects.json');
      // fs.writeFileSync(
      //   outFileName,
      //   JSON.stringify(baseObjects, null, 2),
      //   'utf8'
      // );
    } catch (ex) {
      console.error(ex.message);
    }
  }
}

Main.start();
