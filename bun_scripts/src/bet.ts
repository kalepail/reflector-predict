import type { ArgumentsCamelCase, Argv, CommandModule } from 'yargs'
import * as place from './cmds/bet/place'
import * as lookup from './cmds/bet/lookup'

export const command = 'bet <command>'
export const desc = 'Manage bets'
export function builder(yargs: Argv<{}>) {
    return yargs
        .command([place, lookup] as unknown as CommandModule<{}, any>[])
}
export function handler(argv: ArgumentsCamelCase<{}>) { }
