export type DbRole = {
    id?: number;
    name: string;
    actions: DbAction[];
}

export type DbAction = {
    id: number;
    desc: string;
}

export type Role = {
    id?: number;
    name: string;
    actions: Actions;
}

export type Actions = {[id: number]: string};

export type Organization = {
    id?: number;
    name: string;
    to_name: string | null;
    group_id: number | null;
    group: OrgGroup | null;
};

export type OrgGroup = {
    id?: number;
    name: string;
    limit_type: number;
    compensation_flag: boolean;
    limit: number;
    hard_limit: number;
    description: string | null;
    provider_id: number | null;
    orgs: Organization[];
};

export type Provider = {
    id?: number;
    name: string;
    emails: string;
    description: string;
    url: string;
    logo: string;
    reviews?: ProviderReview[];
}

export type ProviderReview = {
    id?: number;
    review: string;
    rating: number;
    provider_id: number;
    user_id: number;
}

export type MenuItem = {
    id: number;
    provider_id: number;
    menu_date: string;
    type: string;
    name: string;
    weight: string;
    price: number;
    description: string;
}

export type OrderInfo = {
    id?: number;
    user_id?: number;
    status?: number;
    order_date?: Date;
    created_at?: number;
    updated_at?: number;
    orderItems: OrderItem[];
}

export type OrderItem = {
    id?: number;
    order_id?: number;
    name: string;
    comment: string;
    count: number;
    price: number;
    rating?: number;
    review?: string;
}

export type User = {
    id?: number;
    login: string;
    password: string;
    balance?: number;
    description?: string;
    birthday?: string;
    phone: string;
    org_id: string;
    role_id?: string;
    status?: number;
    key?: string;
    ip?: string;
    comp_key?: string;
    ip_phone?: string;
    from_text?: string;
    telegram_id?: number;
    created_at?: string;
    updated_at?: string;
}