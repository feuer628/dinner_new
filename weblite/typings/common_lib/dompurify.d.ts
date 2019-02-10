// Type definitions for DOM Purify
// Project: https://github.com/cure53/DOMPurify
// Definitions by: Dave Taylor <http://davetayls.me>, Samira Bazuzi <https://github.com/bazuzi>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "dompurify" {

    export function sanitize(source: string | Node): string;
    export function sanitize(source: string | Node, config: Config & { RETURN_DOM_FRAGMENT?: false; RETURN_DOM?: false; }): string;
    export function sanitize(source: string | Node, config: Config & { RETURN_DOM_FRAGMENT: true; }): DocumentFragment;
    export function sanitize(source: string | Node, config: Config & { RETURN_DOM: true; }): HTMLElement;
    export function sanitize(source: string | Node, config: Config): string | HTMLElement | DocumentFragment;

    export function addHook(hook: "uponSanitizeElement", cb: (currentNode: Element, data: SanitizeElementHookEvent, config: Config) => void): void;
    export function addHook(hook: "uponSanitizeAttribute", cb: (currentNode: Element, data: SanitizeAttributeHookEvent, config: Config) => void): void;
    export function addHook(hook: HookName, cb: (currentNode: Element, data: HookEvent, config: Config) => void): void;

    interface Config {
        ADD_ATTR?: string[];
        ADD_TAGS?: string[];
        ALLOW_DATA_ATTR?: boolean;
        ALLOWED_ATTR?: string[];
        ALLOWED_TAGS?: string[];
        FORBID_ATTR?: string[];
        FORBID_TAGS?: string[];
        FORCE_BODY?: boolean;
        KEEP_CONTENT?: boolean;
        RETURN_DOM?: boolean;
        RETURN_DOM_FRAGMENT?: boolean;
        RETURN_DOM_IMPORT?: boolean;
        SAFE_FOR_JQUERY?: boolean;
        SANITIZE_DOM?: boolean;
        WHOLE_DOCUMENT?: boolean;
    }

    type HookName
        = "beforeSanitizeElements"
        | "uponSanitizeElement"
        | "afterSanitizeElements"
        | "beforeSanitizeAttributes"
        | "uponSanitizeAttribute"
        | "afterSanitizeAttributes"
        | "beforeSanitizeShadowDOM"
        | "uponSanitizeShadowNode"
        | "afterSanitizeShadowDOM";

    type HookEvent
        = SanitizeElementHookEvent
        | SanitizeAttributeHookEvent
        | null;

    interface SanitizeElementHookEvent {
        tagName: string;
        allowedTags: string[];
    }

    interface SanitizeAttributeHookEvent {
        attrName: string;
        attrValue: string;
        keepAttr: boolean;
        allowedAttributes: string[];
    }
}