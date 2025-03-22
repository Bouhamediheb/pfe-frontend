import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JiraService } from '../services/jira.service';
import { Ticket } from '../models/Ticket';
import { Tester } from '../models/Tester';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { WebSocketService } from '../services/web-socket-service.service';
import { NotificationService } from '../services/notification.service';

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

  testers: Tester[] = []; 

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
  messages: string[] = []; 

  constructor(private jiraService: JiraService, private http: HttpClient ,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadStatuses();
    this.webSocketService.getMessages().subscribe((message: any) => {
      this.handleNewMessage(message);
    });
    this.loadTesters();
  }

  // Method to handle new WebSocket messages
  handleNewMessage(message: any): void {
    // Check if the message is in a format you expect, like a string or object
    if (typeof message === 'string') {
      try {
        message = JSON.parse(message); // If it's a string, try to parse it
      } catch (error) {
        console.error('Error parsing message:', error);
        return;
      }
    }

    // Show the popup when a new message comes through
    Swal.fire({
      title: 'New Message from Backend!',
      text: message.message || 'You have a new update.',
      icon: 'info', // or any other icon type you prefer
      confirmButtonText: 'Okay'
    });
  }

  // New method to load testers
  loadTesters(): void {
    this.jiraService.getTesters().subscribe({
      next: (testers: Tester[]) => {
        this.testers = testers;
        console.log('Testers loaded:', this.testers);
      },
      error: (err: Error) => console.error('Error loading testers:', err)
    });
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
        
        // Show success notification when tickets are loaded
        this.notificationService.success('Tickets loaded successfully!', {
          icon: 'bi bi-check2-circle',
          rounded: true
        });
      },
      error: (err: Error) => {
        console.error('Error loading tickets:', err);
        this.loading = false;
        
        // Show error notification in case of an issue
        this.notificationService.error('Failed to load tickets. Please try again.', {
          icon: 'bi bi-x-circle',
          rounded: true
        });
      }
    });
  }
  

  loadStatuses(): void {
    this.jiraService.getStatuses().subscribe({
      next: (statuses) => this.statuses = statuses,
      error: (err: Error) => console.error('Error loading statuses:', err)
    });
  }

  calculateStats(): void {
    this.totalIssues = this.allTickets.length;
    this.openIssues = this.allTickets.filter(t => t.status.toLowerCase() === 'open' || t.status.toLowerCase() === 'to do').length;
    this.resolvedIssues = this.allTickets.filter(t => t.status.toLowerCase() === 'resolved' || t.status.toLowerCase() === 'done').length;
    this.avgResolutionTime = 'N/A';
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

    const action = currentStatusFlag === 'BLOCKED' || currentStatusFlag === 'NEEDS_ASSISTANCE' ? 'unflag' : 'flag';
    const confirmMessage = action === 'flag'
      ? `Are you sure you want to flag issue ${ticketKey} as ${currentStatusFlag === null ? 'BLOCKED' : currentStatusFlag}?`
      : `Are you sure you want to unflag issue ${ticketKey}?`;

    Swal.fire({
      title: 'Confirm Action',
      text: confirmMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: action === 'flag' ? 'Yes, flag it!' : 'Yes, unflag it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.jiraService.toggleFlag(ticketKey, currentStatusFlag, ticket.assignee?.accountId || '').subscribe({
          next: (response: any) => {
            console.log('Flag toggled successfully:', response);
            Swal.fire('Success!', `Issue ${ticketKey} has been ${action}ed.`, 'success');
            this.loadTickets();
          },
          error: (err: Error) => {
            console.error('Error toggling flag:', err);
            Swal.fire('Error!', 'Failed to toggle flag. Please try again.', 'error');
          }
        });
      }
    });
  }

  submitFeedback(ticketKey: string): void {
    Swal.fire({
      title: 'Submit Feedback',
      input: 'textarea',
      inputLabel: `Feedback for ${ticketKey}`,
      inputPlaceholder: 'Enter your feedback here...',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Feedback cannot be empty!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.jiraService.addCommentToTicket(ticketKey, result.value).subscribe({
          next: (response: any) => {
            console.log('Feedback submitted successfully:', response);
            Swal.fire('Success!', 'Your feedback has been submitted to JIRA.', 'success');
            this.loadTickets(); // Refresh tickets to reflect any updates
          },
          error: (err: Error) => {
            console.error('Error submitting feedback:', err);
            Swal.fire('Error!', 'Failed to submit feedback. Please try again.', 'error');
          }
        });
      }
    });
  }

  // New method to assign a ticket to a tester
  assignTicket(ticketKey: string): void {
    Swal.fire({
      title: `Assign Ticket ${ticketKey}`,
      input: 'select',
      inputOptions: this.testers.reduce((options: { [key: string]: string }, tester: Tester) => {
        options[tester.accountId] = tester.displayName;
        return options;
      }, {}),
      inputPlaceholder: 'Select a tester',
      showCancelButton: true,
      confirmButtonText: 'Assign',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a tester!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const selectedTester = this.testers.find((tester) => tester.accountId === result.value);
        if (selectedTester) {
          this.jiraService.assignTicket(ticketKey, selectedTester.accountId).subscribe({
            next: (response: any) => {
              console.log('Ticket assigned successfully:', response);
              Swal.fire(
                'Success!',
                `Ticket ${ticketKey} has been assigned to ${selectedTester.displayName}.`,
                'success'
              );
              this.loadTickets(); // Refresh tickets to reflect the assignment
            },
            error: (err: Error) => {
              console.error('Error assigning ticket:', err);
              Swal.fire('Error!', 'Failed to assign ticket. Please try again.', 'error');
            }
          });
        }
      }
    });
  }
}