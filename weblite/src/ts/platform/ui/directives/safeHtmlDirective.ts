/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "BIFIT" JSC, TIN 7719617469
 *       105203, Russia, Moscow, Nizhnyaya Pervomayskaya, 46
 * (c) "BIFIT" JSC, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       АО "БИФИТ", ИНН 7719617469
 *       105203, Россия, Москва, ул. Нижняя Первомайская, д. 46
 * (c) АО "БИФИТ", 2018
 */

import {sanitize} from "dompurify";

/**
 * Директива безопасной вставки HTML-строки в качестве содержимого элемента
 */
export class SafeHtmlDirective implements DirectiveOptions {

    /** Имя директивы */
    static readonly NAME = "safe-html";

    bind(el: HTMLElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode): void {
        el.innerHTML = sanitize(binding.value);
    }

    update(el: HTMLElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode): void {
        el.innerHTML = sanitize(binding.value);
    }
}