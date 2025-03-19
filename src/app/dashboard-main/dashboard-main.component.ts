import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JiraService } from '../services/jira.service';
import { Ticket } from '../models/Ticket';
import { Tester } from '../models/Tester';
import { map } from 'rxjs/operators'; // Add this for getStatuses

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss']
})
export class DashboardMainComponent implements OnInit {
  totalIssues = 0;
  openIssues = 0;
  resolvedIssues = 0;
  avgResolutionTime = 'N/A';

  statuses: string[] = [];

  startDate: string = '';
  endDate: string = '';
  selectedPriority: string = '';
  selectedAssignee: string = '';
  selectedStatus: string = '';

  loading = false;
  allTickets: Ticket[] = [];
  filteredIssues: Ticket[] = [];
  paginatedIssues: Ticket[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(private jiraService: JiraService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadStatuses();
  }

  loadTickets(): void {
    this.loading = true;
    this.jiraService.getAllTickets().subscribe({
      next: (tickets) => {
        this.allTickets = tickets;
        console.log('All Tickets:', this.allTickets);
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tickets:', err);
        this.loading = false;
      }
    });
  }

  loadStatuses(): void {
    this.jiraService.getStatuses().subscribe({
      next: (statuses) => this.statuses = statuses,
      error: (err) => console.error('Error loading statuses:', err)
    });
  }

  calculateStats(): void {
    this.totalIssues = this.allTickets.length;
    this.openIssues = this.allTickets.filter(t => t.status.toLowerCase() === 'open' || t.status.toLowerCase() === 'to do').length;
    this.resolvedIssues = this.allTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'done').length;
    this.avgResolutionTime = 'N/A'; // Enhance this if backend provides resolution time
  }

  applyFilters(): void {
    let filtered = [...this.allTickets];

    if (this.startDate) {
      filtered = filtered.filter(t => new Date(t.created) >= new Date(this.startDate));
    }
    if (this.endDate) {
      filtered = filtered.filter(t => new Date(t.created) <= new Date(this.endDate));
    }
    if (this.selectedPriority) {
      filtered = filtered.filter(t => t.priorityName?.toLowerCase() === this.selectedPriority.toLowerCase());
    }
    if (this.selectedAssignee) {
      filtered = filtered.filter(t => t.assignee?.displayName === this.selectedAssignee);
    }
    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status.toLowerCase() === this.selectedStatus.toLowerCase());
    }

    this.filteredIssues = filtered;
    this.totalPages = Math.ceil(this.filteredIssues.length / this.pageSize);
    this.updatePaginatedIssues();
  }

  updatePaginatedIssues(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedIssues = this.filteredIssues.slice(start, end);
  }

  getUniqueAssignees(): string[] {
    const assignees = this.allTickets
      .filter(t => t.assignee)
      .map(t => t.assignee?.displayName || 'Unknown');
    return [...new Set(assignees)];
  }

  getUniqueStatuses(): string[] {
    const statuses = this.allTickets
      .filter(t => t.status)
      .map(t => t.status);
    return [...new Set(statuses)];
  }

  getUserAvatarColorClass(accountId: string): string {
    const colors = ['bg-primary', 'bg-success', 'bg-danger', 'bg-info'];
    const hash = accountId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getUserInitials(displayName: string): string {
    const names = displayName.split(' ');
    return names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedIssues();
    }
  }

  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getMaxEntries(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredIssues.length);
  }

  toggleFlag(ticketKey: string, currentStatusFlag: string | null): void {
    const ticket = this.allTickets.find(t => t.key === ticketKey);
    if (!ticket || !ticket.assignee?.accountId) {
      console.error('No assignee found for ticket:', ticketKey, 'Assignee:', ticket?.assignee);
      return;
    }

    this.jiraService.toggleFlag(ticketKey, currentStatusFlag, ticket.assignee.accountId).subscribe({
      next: (response) => {
        console.log('Flag toggled successfully:', response);
        this.loadTickets(); // Reload to reflect the change
      },
      error: (err) => {
        console.error('Error toggling flag:', err);
      }
    });
  }
}