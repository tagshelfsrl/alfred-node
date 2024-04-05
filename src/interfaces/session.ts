export interface CreateSessionResult {
  sessionId: string;
}

export interface GetSessionResult {
  id: string;
  creationDate: string;
  updateDate: string;
  status: string;
  userName: string;
  companyId: string;
  jobId: string | null;
}
