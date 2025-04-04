# Available Drivers

- [lupdo-mysql](https://www.npmjs.com/package/lupdo-mysql)
- [lupdo-sqlite](https://www.npmjs.com/package/lupdo-sqlite)
- [lupdo-postgres](https://www.npmjs.com/package/lupdo-postgres)
- [lupdo-mssql](https://www.npmjs.com/package/lupdo-mssql)

## WRITE CUSTOM DRIVER

Custom Lupdo Driver must implements a sql syntax; only string can be used to perform query against a database.

Please follow this rules if you can:

- supports all Lupdo validBindings

  - number
  - string
  - bigint
  - Buffer
  - Date
  - boolean
  - null
  - BaseTypedBinding
  - (number|string|bigint|Buffer|Date|boolean|null|BaseTypedBinding)[]

- supports the syntax of named parameters `:key` and the syntax of numeric parameters `?`, adds documentation for other syntax types.

- **date** from database should be returned as javascript `String`.
- **time** from database should be returned as javascript `String`.
- **bigint** from database should be returned as javascript `String`.
- **decimal** from database should be returned as javascript `String`.
- **numeric int** from database shold be returned as javascript `Number`.
- **numeric float** from database should be returned as javascript `String`.
- **boolean** should be returned as javascript `Boolean`.
- **json** should be always returned as `String` not an `Object`.
- **array** should be returned as Javascript `Array` and value of array should respect rules above.

- you should only expose custom Driver APIs if necessary to integrate basic database functionality.
- you should override/suppress third party configuration if they can change lupdo core behaviour based on unsecure parameter of createConnection (see example).
- you are free to add ATTRIBUTES if necessary _please prefix all attributes with unique driver name_.
- you must avoid to override any core funtionality, you can open a discussion or propose a pull-request.
- import or require of the library must automatically register the driver within Lupdo.
- driver should export a function `create{driver}Pdo` that return a new instance of Pdo for the driver to improve options typing.
- you can create a new version of existing driver using another thirdy party library, you should avoid to implements duplicated version with same third party driver, instead try to improve the existing one.
- you can add a new type parameter to be used on `TypedBinding` and implement `TypedBindingOptions` for all `TypeBinding`, please document all options and the new accepted type.

> **Note**
> As soon as it will be stable, Lupdo will accept [Temporal](https://tc39.es/proposal-temporal/docs/) as validBindings.

## FULL EXAMPLE

```ts
import {
    ATTR_DEBUG,
    DEBUG_ENABLED,
    Pdo,
    PdoConnection,
    PdoConnectionI,
    PdoDriver,
    PdoRawConnection,
    PdoRawConnectionI
} from 'lupdo';
import PdoAffectingData from 'lupdo/dist/typings/types/pdo-affecting-data';
import PdoAttributes from 'lupdo/dist/typings/types/pdo-attributes';
import PdoColumnData from 'lupdo/dist/typings/types/pdo-column-data';
import { DriverOptions } from 'lupdo/dist/typings/types/pdo-driver';
import { PoolConnection, PoolOptions } from 'lupdo/dist/typings/types/pdo-pool';
import { ValidBindingsSingle } from 'lupdo/dist/typings/types/pdo-prepared-statement';
import PdoRowData from 'lupdo/dist/typings/types/pdo-raw-data';

interface ThirdPartyConnectionOptions extends DriverOptions {
    [key: string]: any;
}

class ThirdPartyConnectionToDB implements PoolConnection {
    // __lupdo_xxx property are used internally from lupdo
    // should be defined like this
    __lupdo_uuid = '';
    __lupdo_killed = false;
    constructor(public options: ThirdPartyConnectionOptions) {}
}

class ThirdPartyStatement {}

// FakeConnection should be used only to set session variables on the connection before it gets used.
class FakeConnection extends PdoConnection {
    constructor(public readonly connection: ThirdPartyConnectionToDB) {
        super();
    }

    async query(sql: string): Promise<void> {
        // execute third party query
    }
}

class FakeRawConnection extends PdoRawConnection {
    protected async doBeginTransaction(connection: ThirdPartyConnectionToDB): Promise<void> {
        // exec third party connection begin transaction
    }

    protected async doCommit(connection: ThirdPartyConnectionToDB): Promise<void> {
        // exec third party connection commit
    }

    protected async doRollback(connection: ThirdPartyConnectionToDB): Promise<void> {
        // exec third party connection rollback
    }

    protected async getStatement(sql: string, connection: ThirdPartyConnectionToDB): Promise<ThirdPartyStatement> {
        // return third party connection statement
        return new ThirdPartyStatement();
    }

    protected async executeStatement(
        statement: ThirdPartyStatement,
        bindings: string[] | { [key: string]: string },
        connection: ThirdPartyConnectionToDB
    ): Promise<[string, PdoAffectingData, PdoRowData[], PdoColumnData[]]> {
        // return adapted data from third party statement execution
        // sql returned must be sql string propagated to the driver
        return [sql, {}, [], []];
    }

    protected async closeStatement(
        statement: ThirdPartyStatement,
        connection: ThirdPartyConnectionToDB
    ): Promise<void> {
        // close third party statement
    }

    protected async doQuery(
        connection: ThirdPartyConnectionToDB,
        sql: string
    ): Promise<[PdoAffectingData, PdoRowData[], PdoColumnData[]]> {
        // return adapted data from third party query execution
        return [{}, [], []];
    }

    protected adaptBindValue(value: ValidBindingsSingle): ValidBindingsSingle {
        // adapt parameter bindings before execute third party statement
        return value;
    }
}

class FakeDriver extends PdoDriver {
    constructor(
        driver: string,
        protected options: ThirdPartyConnectionOptions,
        poolOptions: PoolOptions,
        attributes: PdoAttributes
    ) {
        super(driver, poolOptions, attributes);
    }

    protected async createConnection(unsecure?: boolean): Promise<ThirdPartyConnectionToDB> {
        const { ...thirdPartyOptions } = this.options;
        // debugmode must be enabled only through ATTR_DEBUG
        const debugMode = this.getAttribute(ATTR_DEBUG) as number;

        if (!unsecure) {
            // unsecure is true only if pdo.getRawDriverConnection() is called
            // in that case the connection it's not acquired from the pool
            // so it will never be reused by lupdo core apis
            // and you can skip overrides, it's up to the user manage connection
            thirdPartyOptions.doNotReturnColumns = false;
            thirdPartyOptions.numberAlwaysString = false;
        }

        return new ThirdPartyConnectionToDB({
            ...thirdPartyOptions,
            debug: debugMode === DEBUG_ENABLED
        });
    }

    protected createPdoConnection(connection: ThirdPartyConnectionToDB): PdoConnectionI {
        // return new PdoConnection
        // it should be a basic connection that can execute only not prepared sql
        // it should be used only to set session variables on the third party connection before it gets used.

        return new FakeConnection(connection);
    }

    protected async closeConnection(connection: ThirdPartyConnectionToDB): Promise<void> {
        // close connection
    }

    protected async destroyConnection(connection: ThirdPartyConnectionToDB): Promise<void> {
        // if available get new connection to force kill pending connection
    }

    protected validateRawConnection(): boolean {
        // validate third party connection before will be used by the pool
        return true;
    }

    public getRawConnection(): PdoRawConnectionI {
        return new FakeRawConnection(this.pool);
    }

    public async getVersion(): Promise<string> {
        return '1.0.0-fake';
    }
}

Pdo.addDriver('fake', FakeDriver);

export function createFakePdo(
    options: ThirdPartyConnectionOptions,
    poolOptions?: PoolOptions,
    attributes?: PdoAttributes
): Pdo {
    return new Pdo('fake', options, poolOptions, attributes);
}
```
