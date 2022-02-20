#!/usr/bin/env node
import {Command} from "commander";
import {translate} from "./main";

import * as pkg from "../package.json"

const program = new Command();
program
  .version(pkg.version, '-v, --version', 'output the current version')
  .name('f')
  .usage('<English>')
  .argument('<English>', 'translate English to Chinese')
  .action((english) => {
    translate(english)
  })

program.parse(process.argv)