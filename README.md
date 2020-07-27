# Customization Detection Tool - Microsoft Dynamics NAV

![npm](https://img.shields.io/npm/v/@msnraju/cdt)
![GitHub](https://img.shields.io/github/license/msnraju/cdt)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/msnraju/cdt/Build%20CDT)
![npm](https://img.shields.io/npm/dt/@msnraju/cdt)

This tool helps you to identify customizations done in the Microsoft Dynamics NAV database.

This will provide the following details in an excel report:

* List of All Modified Objects
* List of All Modified Functions
* List of All Modified Triggers
* List of All Automation / DotNet / OCX controls used.
* List of All Objects from the Base / Standard
* List of All Objects from the Custom / Customer
* List of All Fields from Base / Standard
* List of All Fields from Custom / Standard
* List of All Functions from Base / Standard
* List of All Functions from Custom / Standard

These details are very useful for understanding the customizations done and estimating the effort to migrate to the newer version like Business Central. 

**Note:** This supports objects exported from NAV 2013R2 onwards.

## How to Use

1. Export all objects from the customer database as a text file.
2. Export all objects from the standard database (not customized) as a text file.
3. Download and Install [Node](https://nodejs.org/en/download/) (latest version)
4. Run the following command

`npx cdt --base <<base object file>> --custom <<custom object file>> --output <output file>.xlsx`


## Options

```
Options:
  -V, --version            output the version number
  -b, --base <filename>    Specify the base objects text file.
  -c, --custom <filename>  Specify the custom objects text file.
  -o, --output <filename>  Specify the excel output file. (default: "report.xlsx")
  -h, --help               display help for command
```

## Issues

You may get 'out of memory' error, if the object file size is very big. 

Work around:

split your object file into multiple files like- base-tables.txt, custom-tables.txt, base-codeunits.txt, custom-codeunits.txt and so on.


## Report an issue
You can report issues on [Github](https://github.com/msnraju/cdt/issues)
