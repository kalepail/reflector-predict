import Table from "cli-table";
import type { ArgumentsCamelCase } from "yargs";
import { oracle } from "../utils";

async function listAssets() {
    const { result: assets } = await oracle.assets()
    
    const table = new Table({ head: ['Assets'] });

    assets.forEach((asset) => table.push([asset.values[0]]))

    console.log(table.toString())
}

export const command = 'assets'
export const desc = 'List all available assets'
export function handler(argv: ArgumentsCamelCase<{}>) {
    return listAssets()
}