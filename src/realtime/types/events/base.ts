type CompanyInfo = {
    companyId: string;
    companyName: string;
  };
  
  type Timestamps = {
    creationDate: Date;
    updateDate: Date;
  };

  type EventProperties = {
    eventId: string;
    eventTime: number;
};

export {
    CompanyInfo, 
    Timestamps, 
    EventProperties
}