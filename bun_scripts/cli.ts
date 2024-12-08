#! /usr/bin/env bun

declare module "bun" {
    interface Env {
      SECRET: string;
    }
  }

import "./src/index.ts";