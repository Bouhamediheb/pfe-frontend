import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tester } from '../models/Tester';
import { TestSuite } from '../models/TestSuite';
import { SyncResponse } from '../models/SyncResponse';
import { Ticket } from '../models/Ticket';







@Injectable({
  providedIn: 'root'
})
export class JiraService {
  private apiUrl = 'http://localhost:8080/api/jira';

  constructor(private http: HttpClient) { }

  syncJiraData(): Observable<SyncResponse> {
    return this.http.get<SyncResponse>(`${this.apiUrl}/sync`);
  }

  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets-with-tester-details`);
  }

  assignTesterToTicket(ticketKey: string, accountId: string): Observable<SyncResponse> {
    const body = { accountId };
    return this.http.post<SyncResponse>(`${this.apiUrl}/tickets/${ticketKey}/assign-tester`, body);
  }

  getTicketsByTester(testerAccountId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/tester/${testerAccountId}`);
  }

  changeTicketStatus(ticketKey: string, transitionId: string): Observable<SyncResponse> {
    const body = { transitionId };
    return this.http.post<SyncResponse>(`${this.apiUrl}/tickets/${ticketKey}/change-status`, body);
  }

  getStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/statuses`);
  }

}