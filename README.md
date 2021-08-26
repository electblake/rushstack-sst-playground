# Rush + SST Playground

- https://docs.serverless-stack.com/
- https://rushjs.io/ (https://rushstack.io/)

## How to

Note: this repo was created with vanilla `rush init`

### 1. Select yarn in `rush.json`

```jsonc
{
  // ...
  // "pnpmVersion": "6.7.1",
  // "npmVersion": "4.5.0",
  "yarnVersion": "1.22.11"
  // ...
}
```

```bash
$ rush install
```

Note - I am using the latest version of yarn as of this writing - **not the [yarn2 (berry) option](https://yarnpkg.com/getting-started/install#per-project-install)**


### 2. Create new SST project

```bash
$ cd apps
$ yarn create serverless-stack $NAME --language typescript
$ rm $NAME/package-lock.json # this file is not required, rush manages locks centrally in `common/config/yarn.lock`
```

### 3. Register your project in `rush.json`

This is vanilla, so mine looks like:

```json
  ...
  "projects": [
    {
      "packageName": "reader-api",
      "projectFolder": "apps/reader-api"
    },
    {
      "packageName": "events-core",
      "projectFolder": "apps/events-core"
    }
  ]
  ...
```

```bash
$ rush update # for good measure
```

### 4. Use `rushx` for commands

`rushx start` -> `npm run start` -> `sst start`

and so on..

### 5. Congrats, it works right?

## Known Issus

- only yarn worked - I'm not sure why now, but `pnpm` did not work and rush only supports an old version of `npm` and I'd rather use node12 or 14

## To test and try

- linked package dependencies
- custom `command-line.json` command to perform `sst start`/test and others in all projects
- complex scenarios with eventbridge, streams, multiple apps
- tsconfig paths support
- dev tooling like prettier
- incremental builds
- DEPLOYMENTS