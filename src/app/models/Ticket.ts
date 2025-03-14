import { Tester } from "./Tester";
import { TestSuite } from "./TestSuite";

export interface Ticket {
    key: string;
    summary: string;
    status: string;
    created: string;
    dueDate?: string;
    priorityName?: string;
    priorityId?: string;
    assignee?: Tester;
    assigneeName?: string; 
    reporter?: Tester;
    reporterName?: string;
    parentKey?: string;
    testSuites: TestSuite[];
  }
  
