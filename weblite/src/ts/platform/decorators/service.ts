/**
 * ��������� ��� ��������. ����� ��� ����, ����� ������� ���������� �������� ����� ����������� ��� ������ Closure Compiler.
 * ���������� ��� ������������� ��� �������� �������.
 * @param {string} className �������� ������ �������
 * @return {<T extends Function>(target: T) => T} �����������
 * @constructor
 */
export function Service(className: string) {
    // tslint:disable-next-line
    return function <T extends Function>(target: T): T {
        Object.defineProperty(target, "name", {value: className});
        return target;
    };
}