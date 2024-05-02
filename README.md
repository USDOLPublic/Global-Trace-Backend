<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## NOTE
We are using some private package so you need get some GITLAB_DIGINEX_TOKEN from leader

* Window
```shell
SETX GITLAB_DIGINEX_TOKEN tokenValue
```

* Linux
```shell
export GITLAB_DIGINEX_TOKEN=tokenValue
```

## Folder structure

```
.
├── charts                      -> Helm chart
│   └── usdol-backend
│       ├── charts
│       ├── environments
│       └── templates
├── src
│   ├── config
│   ├── core
│   │   ├── databases
│   │   ├── entities
│   │   ├── exceptions
│   │   ├── http
│   │   │   ├── controllers
│   │   │   └── guards
│   │   ├── repositories
│   │   │   ├── criterias
│   │   │   └── eloquents
│   │   ├── requests
│   │   ├── services
│   │   ├── tests
│   │   └── transformers
│   ├── mails
│   │   ├── adapters
│   │   ├── constants
│   │   ├── interfaces
│   │   ├── mails
│   │   └── services
│   └── users                   -> Module user
│       ├── databases
│       │   ├── factories       -> Contains factories
│       │   └── migrations      -> Contains migrations
│       ├── entities            -> Contains entities
│       ├── enums               -> Contains enums
│       ├── http
│       │   ├── controllers     -> Contains controllers
│       │   ├── guards          -> Contains guards
│       │   ├── midlewares      -> Contains midlewares
│       │   └── requests        -> Contains request
│       ├── mails               -> Contains emails
│       ├── repositories        -> Contains repositories
│       ├── resources           -> Contains information such as views, fonts, css...
│       │   └── mails           -> Contains views for email
│       ├── services            -> Contains services
│       ├── tests               -> Contains unit test, e2e test
│       └── transformers        -> Contains transformers
└── test

```

### File structure conventions

Some code examples display a file that has one or more similarly named companion files. For
example, `hero.controller.ts` and `hero.service.ts`

### Single responsibility

Apply the single responsibility principle (SRP) to all components, services, and other symbols. This helps make the app
cleaner, easier to read and maintain, and more testable.

## Code Rule

Nestjs is inspired by Angular, so you can use some rules from Angular.

##### Small functions

Do define small functions

Consider limiting to no more than 75 lines.

Consider limiting files to 400 lines of code.

#### Naming

##### General Naming Guidelines

Do use consistent names for all symbols.

Do follow a pattern that describes the symbol's feature then its type. The recommended pattern is `feature.type.ts`.

##### Separate file names with dots and dashes

Do use dashes to separate words in the descriptive name.

Do use dots to separate the descriptive name from the type.

Do use consistent type names for all components following a pattern that describes the component's feature then its
type. A recommended pattern is `feature.type.ts`.

Do use conventional type names including `.service, .component, .pipe, .module`, and `.directive`. Invent additional
type names if you must but take care not to create too many.

##### Symbols and file names

Do use consistent names for all assets named after what they represent.

Do use upper camel case for class names.

Do match the name of the symbol to the name of the file.

Do append the symbol name with the conventional suffix (such as Component, Directive, Module, Pipe, or Service) for a
thing of that type.

Do give the filename the conventional suffix (such as `.component.ts`, `.directive.ts`, `.module.ts`, `.pipe.ts`,
or `.service.ts`) for a file of that type.

##### Unit test

Do name test specification files the same as the component they test.

Do name test specification files with a suffix of `.spec.ts`

##### E2E test

Do name end-to-end test specification files after the feature they test with a suffix of `.e2e-spec.ts`

## Database rule
Normally, naming the database will be an underscore (like `user_plan`), but to synchronize the entire standard on the system with NestJs, we will use camelCase for column and PascalCase for table.
Example: `user_plan` -> `userPlan` or `UserPlan`
>This will cause some problems when querying pure, be careful with it.

#### Table name: 

* Must be singular

* Must be a noun

* Must be PascalCase

#### Column name

* Must be camelCase

#### Index name

* columnNameTableNameIndex

#### Foreign key

* columnNameTableNameFk

## Datetime

* All inputs and outputs must be in universal time.

* Must be timestamp

## Requirements

> All APIs must have an e2e test.
>
>Complex functions must have unit tests.
>

#### Version

> Postgres: 11

## Docker

```$xslt
docker-compose up -d
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Command
You need link cli first `npm link`

##### Make migration
```shell script
wz-command make-migration create-user-table -- --module=<module-name> --create=User --update=User
```

##### Make module
```shell script
wz-command make-module
```

##### Make e2e test
```shell script
wz-command make-e2e-test user-controller -- --module=<module-name>
```

##### Make service
```shell script
wz-command make-service user -- --module=<module-name>
```

##### Make entity
```shell script
wz-command make-entity user -- --module=<module-name>
```

##### Make controller
```shell script
wz-command make-controller user -- --module=<module-name>
```

##### Make dto
```shell script
wz-command make-dto user -- --module=<module-name>
```

##### Make repository
```shell script
wz-command make-repository user -- --module=<module-name>
```
## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Response

#### Success

Return a data object

```json

```

#### Validate error - 422

```json
{
  "message": null,
  "errors": {
    "email": {
      "messages": [
        "email should not be empty"
      ]
    },
    "password": {
      "messages": [
        "password must be longer than or equal to 15 characters",
        "password must be a string"
      ]
    },
    "test": {
      "children": {
        "email": {
          "messages": [
            "email should not be empty"
          ]
        },
        "password": {
          "messages": [
            "password must be longer than or equal to 15 characters",
            "password must be a string"
          ]
        }
      },
      "messages": []
    }
  }
}
```

#### Entities not found - 404
```json
{
    "message": "Enterprise not found",
    "errors": null
}
```

#### Unauthorized - 401
```json
{
    "message": "Unauthorized",
    "errors": null
}
```


## Update role, permissions 
### New roles or permissions
When adding new roles or permissions, we need to:
- Create new role, permission file following by format: `roles|permissions-DD-MM-YYYY-v(n)`
- Add role_permission_mapping object in the ROLE_PERMISSION_MAPPING too
- Generate (n) migrations to:
  1. (Optional) Add role if adding new role
  2. (Optional) Add permission if adding new permission
  3. (Required) Add role permission mapping if adding new role or permission

### Change in existed role permission mapping
When adding or removing role in existed role_permission_mapping object, we need to:
- Generate migration to update these changes


### Resources in the application

#### Locations
At local: You can run this command to crawl the locations
```shell script
wz-command crawl-location
```
After having built the application, you need to execute to the docker container then run this command which is a little different
```shell script
node dist/cli.js crawl-location
```

### Environment variables

#### WHITELIST_DOMAINS
- There are the list of domains that Backend will accept and let it pass to request to server.
- Example: We have the uat domain is `usdol.uat.dgnx.io` so that we need to add it in the list split by the comma `,`
with no `space`. At the local, such as the FE run at localhost:3010 we will have the WHITELIST_DOMAINS like this: `usdol.uat.dgnx.io,localhost:3010`

#### MAIL_SEND_FROM: 
- This is the mail address that will be shown as the sender when our application send invitation mail or any mail to our suppliers
- Example: `Global Trace Protocol <global-trace-protocol@dev.dgnx.io>`

#### FIREBASE_*...*
- `FIREBASE_DYNAMIC_LINK_DOMAIN, FIREBASE_DYNAMIC_LINK_API_KEY, FIREBASE_DYNAMIC_LINK_APN, FIREBASE_DYNAMIC_LINK_IBI`
- These are variables which used to generate the deep link to take use go to the App store or CH Play to download the application immediately depend on their operating system 

#### WEB_2_PDF
- In our application, to generate the PDF file we're using a technique that will scratch and take screenshots of the UI page. To use it, we need to connect its API because it's host on another server. That's why we need its domain `WEB_2_PDF_API_URL` and its private key for security stuff `WEB_2_PDF_API_KEY`

#### RAPID
- This is the 3rd party that we use them to crawl the countries, provinces and districts for our application. 
