import { $ } from 'bun';
import yargs, { type CommandModule } from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as login from './cmds/login.ts';
import * as assets from './cmds/assets.ts';
import * as betCmds from './bet.ts';
import * as roundCmds from './round.ts';

yargs(hideBin(process.argv))
    .scriptName('betn')
    .command([login, assets] as unknown as CommandModule<{}, any>[])
    .command([roundCmds, betCmds])
    .command('*', '', {}, async () => console.log(await $`betn help`.text()))
    .demandCommand(1)
    .showHelpOnFail(false)
    .help('help')
    .alias('help', 'h')
    .version(false)
    .strict()
    .parse();