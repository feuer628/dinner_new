/** Диалог для отображения простых сообщений */
export class MessageDialog {

    isShowDialog: boolean = false;
    title: string = "";
    cancelTitle = "Отмена";
    okTitle = "Ок";
    okOnly = false;
    message: string = "";

    /** Результат ответа диалога */
    static resolve: any;

    /**
     * Отрабатывает при любом варианте сокрытия диалога.
     * Источник закрытия находится в bvEvt.isOK
     * Возможные значения ok|cancel|backdrop|header-close|esc
     */
    hide (bvEvt: any) {
        return MessageDialog.resolve(bvEvt.isOK === "ok");
    }

    async showInternalError(): Promise<void> {
        await this.showDialog("Ошибка", true, "Внутренняя ошибка сервера");
    }

    /**
     * Отображает диалог с ошибкой
     * @param text текст ошибки или ошибка
     */
    async showError(text: string | Error): Promise<void> {
        await this.showDialog("Ошибка", true, text as string);
    }

    /**
     * Отображает диалог с предупреждением
     * @param text текст предупреждения
     */
    async showWarning(text: string | Error): Promise<boolean> {
        return this.showDialog("Предупреждение", true, text as string);
    }

    async showInfo(text: string): Promise<boolean> {
        return this.showDialog("Информация", true, text as string);
    }

    /**
     * Отображает диалог с вопросом и кнопками Нет/Да
     * @param text
     */
    async showQuestion(text: string): Promise<any> {

    }

    /**
     * Отображает диалог с подтверждением действия и кнопки Отмена/Подтвердить
     * @param text текст подтверждаемого действия
     */
    async showConfirm(text: string): Promise<boolean> {
        return await this.showDialog("Подтверждение", false, text as string, "Подтвердить", "Отмена");
    }

    private async showDialog(title: string, okOnly: boolean, message: string,
                             okTitle: string = "Ок", cancelTitle: string = "Отмена"): Promise<boolean> {
        this.isShowDialog = true;
        this.title = title;
        this.okOnly = okOnly;
        this.message = message;
        this.cancelTitle = cancelTitle;
        this.okTitle = okTitle;
        return new Promise<boolean>((resolve, reject) => {
            MessageDialog.resolve = resolve;
        });
    }
}
