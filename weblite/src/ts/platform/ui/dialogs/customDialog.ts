import {Component, UI} from "platform/ui";
import {ModalContainer} from "../modalContainer";
import {DialogForm} from "./dialogForm";
import {SimpleDialogForm} from "./simpleDialogForm";

/**
 * Диалог.
 * Доступ к полю **data** возможен, начиная с хук-метода **beforeMount**, но не ранее
 */
@Component({
    components: {DialogForm, SimpleDialogForm}
})
export class CustomDialog<ParamType, ReturnType> extends UI {

    /** Модель данных для диалога */
    protected data: ParamType = null;

    /** Возвращаемое диалогом значение */
    protected result: ReturnType = null;

    /** Функция возврата результата выполнения диалога */
    private resolve: (result: ReturnType) => void = null;

    /**
     * Показывает окно диалога
     * @param {ParamType} data параметры диалога
     * @return {Promise<ReturnType>} результат отображения диалога
     */
    async show(data?: ParamType): Promise<ReturnType> {
        if (data) {
            this.data = data;
        }

        this.$mount();
        // TODO: Установка фокуса на требуемый элемент при открытии диалога
        return new Promise<ReturnType>(resolve => {
            this.resolve = resolve;
        });
    }

    /**
     * @inheritDoc
     */
    mounted(): void {
        ModalContainer.addChild(this, this.isClosable());
    }

    /**
     * Закрывает окно диалога
     * @param result возвращаемое значение
     */
    close(result?: ReturnType | MouseEvent): void {
        if (result !== undefined && !(result instanceof MouseEvent)) {
            this.result = result;
        }
        this.$destroy();
    }

    /**
     * @inheritDoc
     */
    beforeDestroy(): void {
        ModalContainer.removeChild(this);
        this.resolve(this.result);
        this.resolve = null;
    }

    /**
     * Возвращает признак возможности закрытия формы диалога крестиком, кликом по оверлею или клавишей Escape
     * @return {boolean}
     */
    private isClosable(): boolean {
        // Любой диалог должен иметь форму, причем не важно какую DialogForm или SimpleDialogForm. Если это не так, считаем, что диалог закрываемый
        if (!this.$children.length) {
            return true;
        }
        // Первым в списке всегда идет компонент формы, причем не важно какой - DialogForm или SimpleDialogForm
        const dialogFormProps: any = this.$children[0].$options.propsData;
        if (!dialogFormProps) {
            return true;
        }
        // Аттрибут closable должен быть установлен явно в false. Если это не так, считаем что диалог закрываемый
        return dialogFormProps.closable !== false;
    }
}
