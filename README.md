slashbot
========
A fun IRC bot for role playing and stuff.

Running it
==========
- Install and run a mongoDB instance locally (https://docs.mongodb.com/manual/installation/)
- Type `npm install` and then  `npm start`

Features (TBD)
==============

### Financial Quotes
Get quick insight from stock and other financial markets. 

Usage: "need quote from NASDAQ:AAPL" will print "Last week's quote from NASDAQ:AAPL: open: 159.1, high: 163.88, low: 156, close: 156.49, volume: 72738522".  

## Development Configuration

The purpose of this section is to provide information about how the developers that are interested in collaborate with this proyect can set up their editor to fit better with the code style

### Editorconfig

[Editorconfig](http://editorconfig.org/) will allow your editor to auto apply the rules given in the _.editor_ config file.
- **install the editor config plugin for your editor fron this link [Get the plugin](http://editorconfig.org/#download)**

### ESLint

[ESLint](https://eslint.org/) is a linting tool that will evaluate the code and give feedback about the code style
- **To use the ESLint, please install the plugin to your editor and set up the pluging to use the .eslintre.json file [Get the plugin](https://eslint.org/docs/user-guide/integrations)**
- **If you dont want to use a plugin, you can still run the linter from the command line using `npm run lint`**

