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

## Rush+SST Commands

For definition of follow commands, checkout [command-line.json](common/config/rush/command-line.json)

```bash
$ rush cdk-version
$ ...
$ 1.114.0
```

```bash
$ rush create-sst --help

usage: rush create-sst [-h] -n SST_PROJECT_NAME -p SST_PROJECT_PATH

create a new compatible sst project

Optional arguments:
  -h, --help            Show this help message and exit.
  -n SST_PROJECT_NAME, --name SST_PROJECT_NAME
                        name of new sst project
  -p SST_PROJECT_PATH, --path SST_PROJECT_PATH
                        path of new sst project. ex. '--path apps'
```

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