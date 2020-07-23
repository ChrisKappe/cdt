# CDT

![GitHub](https://img.shields.io/github/license/msnraju/cdt)
![GitHub package.json version](https://img.shields.io/github/package-json/v/msnraju/cdt)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/msnraju/cdt/BuildApplication)
![npm](https://img.shields.io/npm/dt/@msnraju/cdt)

Dynamics NAV customization detection tool.

This tool will take NAV object files exported as text from Base / Standard database, Custom / Customer databases and generate an Excel Report with the following details.

* List of All Modified Objects
* List of All Modified Functions
* List of All Modified Triggers
* List of All Automation / DotNet / OCX controls used.

and also
* List of All Objects from the Base / Standard
* List of All Objects from the Custom / Customer
* List of All Fields from Base / Standard
* List of All Fields from Custom / Standard
* List of All Functions from Base / Standard
* List of All Functions from Custom / Standard


## Installation

```sh
npm install @msnraju/cdt -g
```

## Usage

```sh
cdt --base <<base object file>> --custom <<custom object file>> --output <output file>.xlsx`
```

```
Usage: cdt [options]

Options:
  -V, --version            output the version number
  -b, --base <filename>    Specify the base objects text file.
  -c, --custom <filename>  Specify the custom objects text file.
  -o, --output <filename>  Specify the excel output file. (default: "report.xlsx")
  -h, --help               display help for command
```

