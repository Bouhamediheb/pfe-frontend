import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { JiraService } from '../services/jira.service';
import { Issue } from '../models/issue.model';

@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  styleUrl: './dashboard-main.component.scss'
})
export class DashboardMainComponent implements OnInit {
  // Issues data
  issues: Issue[] = [];
  filteredIssues: Issue[] = [];
  
  // Stats
  totalIssues = 0;
  openIssues = 0;
  resolvedIssues = 0;
  avgResolutionTime = '0 days';
  
  // Filters
  startDate: string = '';
  endDate: string = '';
  selectedPriority: string = '';
  selectedAssignee: string = '';
  selectedStatus: string = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Loading state
  loading = true;
  
  // Activity log
  recentActivities: any[] = []; // Would be replaced with actual activity model
  
  // Chart data
  priorityDistribution = {
    high: 0,
    medium: 0,
    low: 0
  };

  constructor(private jiraService: JiraService) {}

  ngOnInit(): void {
    this.fetchIssues();
  }

  fetchIssues(): void {
    this.loading = true;
    this.jiraService.getAllIssues().subscribe({
      next: (data) => {
        this.issues = data;
        this.filteredIssues = [...this.issues];
        this.calculateStats();
        this.totalPages = Math.ceil(this.filteredIssues.length / this.pageSize);
        this.loading = false;
        
      },
      error: (err) => {
        console.error('Error fetching issues:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    // Calculate total issues
    this.totalIssues = this.issues.length;
    
    // Count open and resolved issues
    // This is a simplified version - adjust based on your actual status fields
    this.openIssues = this.issues.filter(issue => 
      issue.priority?.name === 'High' || issue.priority?.name === 'Medium').length;
    this.resolvedIssues = this.issues.filter(issue => 
      issue.priority?.name === 'Low').length;
    
    // Calculate average resolution time (placeholder)
    this.avgResolutionTime = '2.4 days';
    
    // Calculate priority distribution
    this.calculatePriorityDistribution();
  }

  calculatePriorityDistribution(): void {
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    
    this.issues.forEach(issue => {
      switch(issue.priority?.name?.toLowerCase()) {
        case 'high':
          highCount++;
          break;
        case 'medium':
          mediumCount++;
          break;
        case 'low':
          lowCount++;
          break;
      }
    });
    
    const total = highCount + mediumCount + lowCount;
    
    this.priorityDistribution = {
      high: total > 0 ? Math.round((highCount / total) * 100) : 0,
      medium: total > 0 ? Math.round((mediumCount / total) * 100) : 0,
      low: total > 0 ? Math.round((lowCount / total) * 100) : 0
    };
  }

  applyFilters(): void {
    this.filteredIssues = this.issues.filter(issue => {
      let matchesPriority = true;
      let matchesAssignee = true;
      let matchesStatus = true;
      let matchesDateRange = true;
      
      // Filter by priority
      if (this.selectedPriority && issue.priority) {
        matchesPriority = issue.priority.name.toLowerCase() === this.selectedPriority.toLowerCase();
      }
      
      // Filter by assignee
      if (this.selectedAssignee && issue.assignee) {
        matchesAssignee = issue.assignee.displayName.toLowerCase().includes(this.selectedAssignee.toLowerCase());
      }
      
      // Filter by status (placeholder - adjust based on your actual status field)
      if (this.selectedStatus) {
        // This is just an example - replace with your actual status field
        const status = issue.priority?.name === 'High' ? 'open' : 
                      issue.priority?.name === 'Medium' ? 'in-progress' : 'resolved';
        matchesStatus = status === this.selectedStatus;
      }
      
      // Filter by date range
      if (this.startDate && this.endDate && issue.created) {
        const createdDate = new Date(issue.created);
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        
        matchesDateRange = createdDate >= start && createdDate <= end;
      }
      
      return matchesPriority && matchesAssignee && matchesStatus && matchesDateRange;
    });
    
    // Reset pagination
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredIssues.length / this.pageSize);
  }

  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.selectedPriority = '';
    this.selectedAssignee = '';
    this.selectedStatus = '';
    
    this.filteredIssues = [...this.issues];
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredIssues.length / this.pageSize);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedIssues(): Issue[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredIssues.slice(startIndex, startIndex + this.pageSize);
  }

  // Added method to replace Math.min in template
  getMaxEntries(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredIssues.length);
  }

  // Added method to generate array for pagination
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Added method to get unique assignees for dropdown
  getUniqueAssignees(): string[] {
    const assignees = new Set<string>();
    
    this.issues.forEach(issue => {
      if (issue.assignee && issue.assignee.displayName) {
        assignees.add(issue.assignee.displayName);
      }
    });
    
    return Array.from(assignees);
  }

  // Utility methods that can be used in the template
  getUserInitials(displayName: string): string {
    return this.jiraService.getUserInitials(displayName);
  }

  getUserAvatarColorClass(accountId: string): string {
    return this.jiraService.getUserAvatarColorClass(accountId);
  }

  getPriorityBadgeClass(priority: string): string {
    return this.jiraService.getPriorityBadgeClass(priority);
  }
}