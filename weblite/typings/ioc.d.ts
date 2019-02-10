// tslint:disable
declare module "platform/ioc" {
    export function Singleton(target: Function): void;
    export function Scoped(scope: Scope): (target: Function) => void;
    export function Provided(provider: Provider): (target: Function) => void;
    export function Provides(target: Function): (to: Function) => void;
    export function AutoWired(target: Function): any;
    export function Inject(...args: any[]): any;
    export class Container {
        static bind(source: Function): Config;
        static get<T>(arg: {new (): T} | Function): T;
    }
    export interface Config {
        to(target: Object): Config;
        provider(provider: Provider): Config;
        scope(scope: Scope): Config;
        withParams(...paramTypes: any[]): Config;
    }
    export interface Provider {
        get(): Object;
    }
    export abstract class Scope {
        static Local: Scope;
        static Singleton: Scope;
        abstract resolve(provider: Provider, source: Function): any;
        reset(source: Function): void;
    }
}
// tslint:enable