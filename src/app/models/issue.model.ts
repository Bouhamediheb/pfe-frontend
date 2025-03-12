import { User } from './user.model';
import { HierarchyInfo } from './hierarchy-info.model';

export interface Issue {
    key: string;
    summary: string;
    dueDate?: string;
    created?: string;
    assignee?: User;
    reporter?: User;
    priority?: { 
      name: string;
      id: string;
    };
    testSuites?: Record<string, string>;
    hierarchy?: HierarchyInfo;
  }