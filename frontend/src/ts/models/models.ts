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
    orgs: Organization[];
};