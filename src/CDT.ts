import fs from 'fs';
import path from 'path';
import program from 'commander';
import { ExcelReport } from './report';
import ObjectReader, { IAppObject } from './cal-to-json/cal/object-reader';
import { CompareAppObjects } from './comparison/compare-app-objects';
import { IAppObjectChange } from './comparison/change.model';
import chalk from 'chalk';
import { clear } from 'console';
import figlet from 'figlet';

export default class CDT {
  static startCLI() {
    clear();
    console.log(
      chalk.blue(figlet.textSync('CAL CDT', { horizontalLayout: 'full' }))
    );

    program
      .version('0.0.1')
      .description(
        chalk.green(
          'Customization Detection Tool by MSN Raju, All e Technologies Pvt. Ltd.\n'
        )
      )
      .option('-b, --base <filename>', 'Specify the base objects text file.')
      .option(
        '-c, --custom <filename>',
        'Specify the custom objects text file.'
      )
      .option(
        '-o, --output <filename>',
        'Specify the excel output file.',
        'report.xlsx'
      )
      .parse(process.argv);

    if (!process.argv.slice(2).length) {
      program.outputHelp();
    } else {
      console.log(
        chalk.green(
          'Customization Detection Tool by MSN Raju, All e Technologies Pvt. Ltd.\n'
        )
      );

      let baseFileName = path.resolve(program.base);
      let customFileName = path.resolve(program.custom);
      let outputFileName = path.resolve(program.output);
      if (!fs.existsSync(baseFileName)) {
        console.error(`Base object file '${program.base}' does not exist.`);
      } else if (!fs.existsSync(customFileName)) {
        console.error(`Custom object file '${program.custom}' does not exist.`);
      } else {
        CDT.execute(baseFileName, customFileName, outputFileName, '');
      }
    }
  }

  static compareObjectChanges(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>
  ) {
    console.log('Comparing Objects...');
    return CompareAppObjects.compareCollection(baseObjects, customObjects);
  }

  static saveObjectChanges(
    changes: Array<IAppObjectChange>,
    changesFileName: string
  ) {
    console.log('Saving Changes...');
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

  static generateReportFromJson(
    changesFileName: string,
    changesReportFileName: string
  ) {
    const data = fs.readFileSync(changesFileName);
    const changes = JSON.parse(data.toString()) as any;

    ExcelReport.write(changes, [], [], changesReportFileName);
    console.log('completed');
  }

  static generateReport(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>,
    changes: Array<IAppObjectChange>,
    changesReportFileName: string
  ) {
    console.log('Generating Report ...');

    ExcelReport.write(
      changes,
      baseObjects,
      customObjects,
      changesReportFileName
    );
  }

  static execute(
    baseFileName: string,
    customFileName: string,
    reportFileName: string,
    changesFileName: string
  ) {
    if (!fs.existsSync(baseFileName))
      console.error(`Base object file '${program.base}' does not exist.`);
    if (!fs.existsSync(customFileName))
      console.error(`Custom object file '${program.custom}' does not exist.`);

    console.log('Reading Base Objects...');
    const baseObjects = ObjectReader.readObjects(baseFileName);

    console.log('Reading Custom Objects...');
    const customObjects = ObjectReader.readObjects(customFileName);

    const changes = this.compareObjectChanges(baseObjects, customObjects);

    if (changesFileName) {
      this.saveObjectChanges(changes, changesFileName);
    }

    this.generateReport(baseObjects, customObjects, changes, reportFileName);

    console.log('All Done!');
  }

  static start() {
    let baseObjectFileName = path.resolve('D:/NAV/CDT/LF/Base-14.0.35570-W1-all.txt');
    console.log('Reading Base Objects...');
    const baseObjects = ObjectReader.readObjects(baseObjectFileName);

    let customObjectFileName = path.resolve('D:/NAV/CDT/LF/LF8.00-14.0.35570-W1-release-all.txt');
    console.log('Reading Custom Objects...');
    const customObjects = ObjectReader.readObjects(customObjectFileName);

    const changes = this.compareObjectChanges(baseObjects, customObjects);

    let changesFileName = path.resolve('assets/changes.json');
    this.saveObjectChanges(changes, changesFileName);
    const changesReportFileName = path.resolve('assets/changes.xlsx');
    this.generateReport(
      baseObjects,
      customObjects,
      changes,
      changesReportFileName
    );
    console.log('All Done!');
  }
}
