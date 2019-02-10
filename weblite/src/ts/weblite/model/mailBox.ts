/**
 * Информация о почтовом ящике
 */
export type MailBox = {
    id: string,
    branch_id: string,
    department_id: string,
    status: MailBoxStatus,
    name: string
};

/**
 * Статус почтового ящика
 */
export enum MailBoxStatus {
    BLOCKED = "0",
    ACTIVE = "1",
    DELETED = "2"
}