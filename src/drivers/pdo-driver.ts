import EventEmitter from 'node:events';
import { v4 as uuidv4 } from 'uuid';

import {
    ATTR_CASE,
    ATTR_DEBUG,
    ATTR_DEFAULT_FETCH_MODE,
    ATTR_DRIVER_NAME,
    ATTR_NULLS,
    CASE_NATURAL,
    DEBUG_DISABLED,
    DEBUG_ENABLED,
    FETCH_NUM,
    NULL_NATURAL
} from '../constants';
import { PdoAvailableDriver } from '../types/pdo';
import PdoAttributes from '../types/pdo-attributes';
import PdoConnectionI from '../types/pdo-connection';
import PdoDriverI, { instances } from '../types/pdo-driver';
import { FetchFunctionClosure } from '../types/pdo-fetch';
import { InternalPdoPoolOptions, PoolConnection, PoolI, PoolOptions, RawPoolConnection } from '../types/pdo-pool';
import PdoPreparedStatementI from '../types/pdo-prepared-statement';
import PdoRawConnectionI from '../types/pdo-raw-connection';
import PdoStatementI from '../types/pdo-statement';
import PdoTransactionI from '../types/pdo-transaction';
import PdoPool from './pdo-pool';
import PdoPreparedStatement from './pdo-prepared-statement';
import PdoStatement from './pdo-statement';
import PdoTransaction from './pdo-transaction';

abstract class PdoDriver extends EventEmitter implements PdoDriverI {
    protected instances: instances = {
        transaction: PdoTransaction,
        preparedStatement: PdoPreparedStatement,
        statement: PdoStatement
    };

    protected attributes: PdoAttributes = {
        [ATTR_CASE]: CASE_NATURAL,
        [ATTR_DEFAULT_FETCH_MODE]: FETCH_NUM,
        [ATTR_NULLS]: NULL_NATURAL,
        [ATTR_DEBUG]: DEBUG_DISABLED
    };

    protected pool: PoolI<PoolConnection>;

    constructor(driver: PdoAvailableDriver, poolOptions: PoolOptions, attributes: PdoAttributes) {
        super();
        Object.assign(this.attributes, attributes, {
            [ATTR_DRIVER_NAME]: driver
        });
        const { created, destroyed, acquired, released, killed, ...otherOptions } = poolOptions;
        const debugMode = this.getAttribute(ATTR_DEBUG) as number;
        const hasDebug = (debugMode & DEBUG_ENABLED) !== 0;
        const pdoPoolOptions: InternalPdoPoolOptions<PoolConnection> = {
            min: 2,
            max: 10,
            acquireTimeoutMillis: 10000,
            createTimeoutMillis: 5000,
            ...otherOptions,
            propagateCreateError: false,
            validate: (connection: PoolConnection) => {
                return this.validateRawConnection(connection);
            },
            create: async (): Promise<PoolConnection> => {
                const connection = await this.createConnection();
                const uuid = uuidv4();

                if (typeof created === 'function') {
                    await created(uuid, this.createPdoConnection(connection));
                }
                connection.__lupdo_uuid = uuid;
                connection.__lupdo_killed = false;

                if (hasDebug) {
                    console.log(`Pdo Pool Resource Created: ${connection.__lupdo_uuid}`);
                }

                return connection;
            },
            kill: async (connection: PoolConnection) => {
                if (connection !== undefined) {
                    await this.destroyConnection(connection);
                    connection.__lupdo_killed = true;

                    if (typeof killed === 'function') {
                        killed(connection.__lupdo_uuid);
                    }

                    if (hasDebug) {
                        console.log(`Pdo Pool Resource Killed: ${connection.__lupdo_uuid}`);
                    }
                }
            },
            destroy: async (connection: PoolConnection) => {
                if (connection !== undefined && !connection.__lupdo_killed) {
                    const uuid: string = connection.__lupdo_uuid;

                    await this.closeConnection(connection);

                    if (typeof destroyed === 'function') {
                        await destroyed(uuid);
                    }

                    if (hasDebug) {
                        console.log(`Pdo Pool Resource Destroyed: ${connection.__lupdo_uuid}`);
                    }
                }
            },
            log: (message: any, logLevel?: any): void => {
                logLevel = logLevel != null ? (logLevel === 'warn' ? 'warning' : logLevel) : 'debug';
                this.emit('log', message, logLevel);
            }
        };

        this.pool = new PdoPool<PoolConnection>(pdoPoolOptions);

        this.pool.on('acquireSuccess', (eventId: number, connection: PoolConnection) => {
            if (typeof acquired === 'function') {
                acquired(connection.__lupdo_uuid, eventId);
            }

            if (hasDebug) {
                console.log(`Pdo Pool Resource Acquired: ${connection.__lupdo_uuid}`);
            }
        });

        this.pool.on('release', (connection: PoolConnection) => {
            if (typeof released === 'function') {
                released(connection.__lupdo_uuid);
            }

            if (hasDebug) {
                console.log(`Pdo Pool Resource Released: ${connection.__lupdo_uuid}`);
            }
        });
    }

    protected abstract createConnection(): Promise<PoolConnection>;
    protected abstract getRawConnection(): PdoRawConnectionI;
    protected abstract closeConnection(connection: PoolConnection): Promise<void>;
    protected abstract destroyConnection(connection: PoolConnection): Promise<void>;
    protected abstract createPdoConnection(connection: PoolConnection): PdoConnectionI;
    protected abstract validateRawConnection(connection: PoolConnection): boolean;

    public async disconnect(): Promise<void> {
        await this.pool.destroy();
        this.pool.removeAllListeners('acquireSuccess');
        this.pool.removeAllListeners('release');
    }

    public async beginTransaction(): Promise<PdoTransactionI> {
        const connection = this.getRawConnection();
        await connection.beginTransaction();
        return new this.instances.transaction(connection, this.attributes);
    }

    public async prepare(sql: string, attributes: PdoAttributes = {}): Promise<PdoPreparedStatementI> {
        const connection = this.getRawConnection();
        await connection.prepare(sql);
        return new this.instances.preparedStatement(connection, Object.assign({}, this.attributes, attributes));
    }

    public async query(
        sql: string,
        fetchMode?: number,
        numberOrClassOrFnOrObject?: number | FetchFunctionClosure | FunctionConstructor | object,
        constructorArgs?: any[]
    ): Promise<PdoStatementI> {
        const connection = this.getRawConnection();
        await connection.query(sql);
        return new this.instances.statement(
            connection,
            this.attributes,
            fetchMode,
            numberOrClassOrFnOrObject,
            constructorArgs
        );
    }

    public getAttribute(attribute: string): string | number {
        return this.attributes[attribute];
    }

    public setAttribute(attribute: string, value: number | string): boolean {
        if (attribute in this.attributes) {
            this.attributes[attribute] = value;
            return true;
        }
        return false;
    }

    public async getRawPoolConnection(): Promise<RawPoolConnection> {
        const connection = (await this.pool.acquire().promise) as RawPoolConnection;
        connection.release = async () => {
            await this.pool.release(connection);
        };
        return connection;
    }
}

export default PdoDriver;
