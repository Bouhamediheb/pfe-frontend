import { Tester } from "./Tester";
import { TestSuite } from "./TestSuite";

export interface Ticket {
  key: string;
  summary: string;
  created: string;
  dueDate: string | null;
  priorityName: string;
  parentKey: string | null;
  testSuites: any[]; // Adjust based on your TestSuite model
  status: string;
  statusFlag: string | null;
  assignee: Tester | null;
  reporter: Tester | null;
}