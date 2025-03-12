// src/app/services/jira.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue } from '../models/issue.model';
import { Hierarchy } from '../models/hierarchy.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class JiraService {
  private apiUrl = 'http://localhost:8080/api/jira'; // Base URL to your Spring Boot backend API

  constructor(private http: HttpClient) { }

  /**
   * Get all JIRA issues from the backend
   */
  getAllIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.apiUrl}/issues`);
  }

  /**
   * Get hierarchy information for all issues
   */
  getHierarchy(): Observable<Hierarchy> {
    return this.http.get<Hierarchy>(`${this.apiUrl}/hierarchy`);
  }

  /**
   * Returns the badge class based on priority name
   */
  getPriorityBadgeClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Returns the initials for a user's display name
   */
  getUserInitials(displayName: string): string {
    if (!displayName) return '';
    
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }

  /**
   * Returns a random background color class for user avatars
   * This maintains consistency for the same user by using the accountId
   */
  getUserAvatarColorClass(accountId: string): string {
    const colors = ['bg-primary', 'bg-success', 'bg-danger', 'bg-info', 'bg-warning'];
    
    if (!accountId) return colors[0];
    
    // Simple hash function to get a consistent color for the same user
    const hash = accountId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}