export type Project = {
    project_id: string;
    project_name: string;
    project_detail?: string,
    project_start_date: date | string,
    project_end_date: date | string,
    addby?: string,
    adddate?: string,
    updateby?: string,
    lastupdate?: string,
}