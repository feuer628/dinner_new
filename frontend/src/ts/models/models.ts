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