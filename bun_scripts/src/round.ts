import type { ArgumentsCamelCase, Argv, CommandModule } from 'yargs'
import * as start from './cmds/round/start'
import * as lookup from './cmds/round/lookup'
import * as claim from './cmds/round/claim'

export const command = 'round <command>'
export const desc = 'Manage rounds'
export function builder(yargs: Argv<{}>) {
    return yargs.command([start, lookup, claim] as unknown as CommandModule<{}, any>[])
}
export function handler(argv: ArgumentsCamelCase<{}>) { }