declare class Vue {

    constructor(options?: ComponentOptions<Vue>);

    $data: Object;
    readonly $el: HTMLElement;
    readonly $options: ComponentOptions<this>;
    readonly $parent: Vue;
    readonly $root: Vue;
    readonly $children: Vue[];
    readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[] };
    readonly $slots: { [key: string]: VNode[] };
    readonly $scopedSlots: { [key: string]: ScopedSlot };

    $mount(elementOrSelector?: Element | String, hydrating?: boolean): this;
    $forceUpdate(): void;
    $destroy(): void;
    $set: typeof Vue.set;
    $delete: typeof Vue.delete;
    $watch(
        expOrFn: string,
        callback: WatchHandler<this, any>,
        options?: WatchOptions
    ): (() => void);
    $watch<T>(
        expOrFn: (this: this) => T,
        callback: WatchHandler<this, T>,
        options?: WatchOptions
    ): (() => void);
    $on(event: string | string[], callback: Function): this;
    $once(event: string, callback: Function): this;
    $off(event?: string | string[], callback?: Function): this;
    $emit(event: string, ...args: any[]): this;
    $nextTick(callback: (this: this) => void): void;
    $nextTick(): Promise<void>;
    $createElement: CreateElement;

    static nextTick(callback: () => void, context?: any[]): void;
    static nextTick(): Promise<void>

    static set<T>(object: Object, key: string, value: T): T;
    static set<T>(array: T[], key: number, value: T): T;
    static delete(object: Object, key: string): void;
    static delete<T>(array: T[], key: number): void;

    static directive(id: string, definition?: DirectiveOptions | DirectiveFunction): DirectiveOptions;

    static component(tag: string, component: typeof Vue): void;
    static filter(tag: string, callback: Function): any;

    static use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): void;
    static use(plugin: PluginObject<any> | PluginFunction<any>, ...options: any[]): void;
}

type PluginFunction<T> = (Vue: Vue, options?: T) => void;
type Component = typeof Vue | ComponentOptions<Vue> | FunctionalComponentOptions;
type AsyncComponent = (resolve: (component: Component) => void, reject: (reason?: any) => void) => Promise<Component> | Component | void;

type DefaultProps = Record<string, any>;
type Prop<T> = { (): T } | { new (...args: any[]): T & object }
type PropValidator<T> = PropOptions<T> | Prop<T> | Prop<T>[];

interface PropOptions<T=any> {
  type?: Prop<T> | Prop<T>[];
  required?: boolean;
  default?: T | null | undefined | (() => object);
  validator?(value: T): boolean;
}

type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>
}
type ArrayPropsDefinition<T> = (keyof T)[];
type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;

interface PluginObject<T> {
    install: PluginFunction<T>;
    [key: string]: any;
}

interface ComponentOptions<V extends Vue> {
    data?: Object | ((this: V) => Object);
    props?: PropsDefinition<DefaultProps>;
    propsData?: Object;
    computed?: { [key: string]: ((this: V) => any) | ComputedOptions<V> };
    methods?: { [key: string]: (this: V, ...args: any[]) => any };
    watch?: { [key: string]: ({ handler: WatchHandler<V, any> } & WatchOptions) | WatchHandler<V, any> | string };

    el?: Element | String;
    template?: string;

    beforeCreate?(this: V): void;
    created?(this: V): void;
    beforeDestroy?(this: V): void;
    destroyed?(this: V): void;
    beforeMount?(this: V): void;
    mounted?(this: V): void;
    beforeUpdate?(this: V): void;
    updated?(this: V): void;
    activated?(this: V): void;
    deactivated?(this: V): void;

    directives?: { [key: string]: DirectiveOptions | DirectiveFunction };
    components?: { [key: string]: Component | AsyncComponent };
    transitions?: { [key: string]: Object };
    filters?: { [key: string]: Function };

    provide?: Object | (() => Object);
    inject?: { [key: string]: string | symbol } | Array<string>;

    model?: {
        prop?: string;
        event?: string;
    };

    parent?: Vue;
    mixins?: (ComponentOptions<Vue> | typeof Vue)[];
    name?: string;
    extends?: ComponentOptions<Vue> | typeof Vue;
    delimiters?: [string, string];
}

// router extends
interface ComponentOptions<V extends Vue> {
    router?: VueRouter;
    beforeRouteEnter?: VueRouter.NavigationGuard;
    beforeRouteLeave?: VueRouter.NavigationGuard;
    beforeRouteUpdate?: VueRouter.NavigationGuard;
    store?: Vuex.Store<any>;
}

interface Vue {
    $router: VueRouter;
    $route: VueRouter.Route;
    $store: Vuex.Store<any>;
}

interface FunctionalComponentOptions {
    props?: any[];
    functional: boolean;

    render(this: never, createElement: CreateElement, context: RenderContext): VNode;

    name?: string;
}

interface RenderContext {
    props: any;
    children: VNode[];
    slots(): any;
    data: VNodeData;
    parent: Vue;
    injections: any
}

interface ComputedOptions<V> {
    get?(this: V): any;
    set?(this: V, value: any): void;
    cache?: boolean;
}

type WatchHandler<V, T> = (this: V, val: T, oldVal: T) => void;

interface WatchOptions {
    deep?: boolean;
    immediate?: boolean;
}

type DirectiveFunction = (el: HTMLElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode) => void;

interface DirectiveOptions {
    bind?: DirectiveFunction;
    inserted?: DirectiveFunction;
    update?: DirectiveFunction;
    componentUpdated?: DirectiveFunction;
    unbind?: DirectiveFunction;
}

type ScopedSlot = (props: any) => VNodeChildrenArrayContents | string;

type VNodeChildren = VNodeChildrenArrayContents | [ScopedSlot] | string;

interface VNodeChildrenArrayContents {
    [x: number]: VNode | string | VNodeChildren;
}


interface VNode {
    tag?: string;
    data?: VNodeData;
    children?: VNode[];
    text?: string;
    elm?: Node;
    ns?: string;
    context?: Vue;
    key?: string | number;
    componentOptions?: VNodeComponentOptions;
    componentInstance?: Vue;
    parent?: VNode;
    raw?: boolean;
    isStatic?: boolean;
    isRootInsert: boolean;
    isComment: boolean;
}

interface VNodeComponentOptions {
    Ctor: typeof Vue;
    propsData?: Object;
    listeners?: Object;
    children?: VNodeChildren;
    tag?: string;
}

interface VNodeData {
    key?: string | number;
    slot?: string;
    scopedSlots?: { [key: string]: ScopedSlot };
    ref?: string;
    tag?: string;
    staticClass?: string;
    class?: any;
    staticStyle?: { [key: string]: any };
    style?: Object[] | Object;
    props?: { [key: string]: any };
    attrs?: { [key: string]: any };
    domProps?: { [key: string]: any };
    hook?: { [key: string]: Function };
    on?: { [key: string]: Function | Function[] };
    nativeOn?: { [key: string]: Function | Function[] };
    transition?: Object;
    show?: boolean;
    inlineTemplate?: {
        render: Function;
        staticRenderFns: Function[];
    };
    directives?: VNodeDirective[];
    keepAlive?: boolean;
}

interface VNodeDirective {
    readonly name: string;
    readonly value: any;
    readonly oldValue: any;
    readonly expression: any;
    readonly arg: string;
    readonly modifiers: { [key: string]: boolean };
}

type CreateElement = {
    // empty node
    (): VNode;

    // element or component name
    (tag: string, children: VNodeChildren): VNode;
    (tag: string, data?: VNodeData, children?: VNodeChildren): VNode;

    // component constructor or options
    (tag: Component, children: VNodeChildren): VNode;
    (tag: Component, data?: VNodeData, children?: VNodeChildren): VNode;

    // async component
    (tag: AsyncComponent, children: VNodeChildren): VNode;
    (tag: AsyncComponent, data?: VNodeData, children?: VNodeChildren): VNode;
}

type Dictionary<T> = { [key: string]: T };

declare class _VueRouter {
    constructor (options?: VueRouter.RouterOptions);

    app: Vue;
    mode: VueRouter.RouterMode;
    currentRoute: VueRouter.Route;

    beforeEach (guard: VueRouter.NavigationGuard): Function;
    beforeResolve (guard: VueRouter.NavigationGuard): Function;
    afterEach (hook: (to: VueRouter.Route, from: VueRouter.Route) => any): Function;
    push (location: VueRouter.RawLocation, onComplete?: Function, onAbort?: Function): void;
    replace (location: VueRouter.RawLocation, onComplete?: Function, onAbort?: Function): void;
    go (n: number): void;
    back (): void;
    forward (): void;
    getMatchedComponents (to?: VueRouter.RawLocation | VueRouter.Route): Component[];
    onReady (cb: Function, errorCb?: Function): void;
    onError (cb: Function): void;
    addRoutes (routes: VueRouter.RouteConfig[]): void;
    resolve (to: VueRouter.RawLocation, current?: VueRouter.Route, append?: boolean): {
        location: VueRouter.Location;
        route: VueRouter.Route;
        href: string;
        // backwards compat
        normalizedTo: VueRouter.Location;
        resolved: VueRouter.Route;
    };

    static install: PluginFunction<never>;
}

// renamed to avoid collision
type _Position = { x: number, y: number };

type RoutePropsFunction = (route: VueRouter.Route) => Object;

interface PathToRegexpOptions {
    sensitive?: boolean;
    strict?: boolean;
    end?: boolean;
}

declare namespace VueRouter {
    export type RouterMode = "hash" | "history" | "abstract"
    export type RawLocation = string | Location
    export type RedirectOption = RawLocation | ((to: Route) => RawLocation);
    export interface RouterOptions {
        routes?: RouteConfig[];
        mode?: VueRouter.RouterMode;
        fallback?: boolean;
        base?: string;
        linkActiveClass?: string;
        linkExactActiveClass?: string;
        parseQuery?: (query: string) => Object;
        stringifyQuery?: (query: Object) => string;
        scrollBehavior?: (
            to: Route,
            from: Route,
            savedPosition: _Position | void
        ) => _Position | { selector: string, offset?: _Position } | void;
    }
    export interface RouteConfig {
        path: string;
        name?: string;
        component?: Component;
        components?: Dictionary<Component>;
        redirect?: RedirectOption;
        alias?: string | string[];
        children?: RouteConfig[];
        meta?: any;
        beforeEnter?: NavigationGuard;
        props?: boolean | Object | RoutePropsFunction;
        caseSensitive?: boolean;
        pathToRegexpOptions?: PathToRegexpOptions;
    }
    export interface RouteRecord {
        path: string;
        regex: RegExp;
        components: Dictionary<Component>;
        instances: Dictionary<Vue>;
        name?: string;
        parent?: RouteRecord;
        redirect?: RedirectOption;
        matchAs?: string;
        meta: any;
        beforeEnter?: (
            route: Route,
            redirect: (location: RawLocation) => void,
            next: () => void
        ) => any;
        props: boolean | Object | RoutePropsFunction | Dictionary<boolean | Object | RoutePropsFunction>;
    }
    export interface Location {
        name?: string;
        path?: string;
        hash?: string;
        query?: Dictionary<string>;
        params?: Dictionary<string>;
        append?: boolean;
        replace?: boolean;
    }
    export interface Route {
        path: string;
        name?: string;
        hash: string;
        query: Dictionary<string>;
        params: Dictionary<string>;
        fullPath: string;
        matched: RouteRecord[];
        redirectedFrom?: string;
        meta?: any;
    }
    export type NavigationGuard = (
        to: Route,
        from: Route,
        next: Resolver
    ) => any
    export type Resolver = (to?: RawLocation | false | ((vm: Vue) => any) | void) => void;
}

declare class VueRouter extends _VueRouter {}

declare module "vue" {
    export default Vue;
}

declare module "vue-class-component" {
    function Component<V extends Vue>(options: ComponentOptions<V> & ThisType<V>): <VC extends VueClass<V>>(target: VC) => VC;
    function Component<VC extends VueClass<Vue>>(target: VC): VC;
    namespace Component {
        function registerHooks(keys: string[]): void;
    }
    export default Component;

    export type VueClass<V extends Vue> = { new (...args: any[]): V } & typeof Vue;
}

declare module "vue-router" {
    export default VueRouter;
}

declare module "vue-property-decorator" {
    export type Constructor = {
        new (...args: any[]): any;
    };
    export function Model(event?: string, options?: (PropOptions | Constructor[] | Constructor)): PropertyDecorator;
    export function Prop(options?: (PropOptions | Constructor[] | Constructor)): PropertyDecorator;
    export function Watch(path: string, options?: WatchOptions): MethodDecorator;
    export function Emit(event?: string): MethodDecorator;
}

declare namespace Vuex {
    export class Store<S> {
        constructor(options: StoreOptions<S>);

        readonly state: S;
        readonly getters: any;

        replaceState(state: S): void;

        dispatch: Dispatch;
        commit: Commit;

        subscribe<P extends MutationPayload>(fn: (mutation: P, state: S) => any): () => void;
        watch<T>(getter: (state: S, getters: any) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;

        registerModule<T>(path: string, module: Module<T, S>, options?: ModuleOptions): void;
        registerModule<T>(path: string[], module: Module<T, S>, options?: ModuleOptions): void;

        unregisterModule(path: string): void;
        unregisterModule(path: string[]): void;

        hotUpdate(options: {
            actions?: ActionTree<S, S>;
            mutations?: MutationTree<S>;
            getters?: GetterTree<S, S>;
            modules?: ModuleTree<S>;
        }): void;
    }

    export interface Dispatch {
        (type: string, payload?: any, options?: DispatchOptions): Promise<any>;
        <P extends Payload>(payloadWithType: P, options?: DispatchOptions): Promise<any>;
    }

    export interface Commit {
        (type: string, payload?: any, options?: CommitOptions): void;
        <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;
    }

    export interface ActionContext<S, R> {
        dispatch: Dispatch;
        commit: Commit;
        state: S;
        getters: any;
        rootState: R;
        rootGetters: any;
    }

    export interface Payload {
        type: string;
    }

    export interface MutationPayload extends Payload {
        payload: any;
    }

    export interface DispatchOptions {
        root?: boolean;
    }

    export interface CommitOptions {
        silent?: boolean;
        root?: boolean;
    }

    export interface StoreOptions<S> {
        state?: S;
        getters?: GetterTree<S, S>;
        actions?: ActionTree<S, S>;
        mutations?: MutationTree<S>;
        modules?: ModuleTree<S>;
        plugins?: Plugin<S>[];
        strict?: boolean;
    }

    type ActionHandler<S, R> = (injectee: ActionContext<S, R>, payload: any) => any;
    interface ActionObject<S, R> {
        root?: boolean;
        handler: ActionHandler<S, R>;
    }

    export type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any;
    export type Action<S, R> = ActionHandler<S, R> | ActionObject<S, R>;
    export type Mutation<S> = (state: S, payload: any) => any;
    export type Plugin<S> = (store: Store<S>) => any;

    export interface Module<S, R> {
        namespaced?: boolean;
        state?: S | (() => S);
        getters?: GetterTree<S, R>;
        actions?: ActionTree<S, R>;
        mutations?: MutationTree<S>;
        modules?: ModuleTree<R>;
    }

    export interface ModuleOptions{
        preserveState?: boolean
    }

    export interface GetterTree<S, R> {
        [key: string]: Getter<S, R>;
    }

    export interface ActionTree<S, R> {
        [key: string]: Action<S, R>;
    }

    export interface MutationTree<S> {
        [key: string]: Mutation<S>;
    }

    export interface ModuleTree<R> {
        [key: string]: Module<any, R>;
    }
}

declare class _Vuex {
    Store: typeof Vuex.Store;
    static install: PluginFunction<never>;
}

declare class Vuex extends _Vuex {}

declare module "vuex" {
    export default Vuex;
}