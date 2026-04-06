import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../shared/services/admin.service';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Locked' | 'Pending KYC';
  kycLevel: string;
  accountBalance?: number;
  dateJoined: string;
}

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  private adminService = inject(AdminService);
  
  clients = signal<Client[]>([]);
  isProcessing = signal(false);

  ngOnInit() {
    this.fetchClients();
  }

  fetchClients() {
    this.isProcessing.set(true);
    this.adminService.getClients().subscribe({
      next: (res) => {
        this.clients.set(res.data);
        this.isProcessing.set(false);
      },
      error: () => this.isProcessing.set(false)
    });
  }

  searchQuery = signal('');

  filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.clients();

    return this.clients().filter(c => 
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.id.toLowerCase().includes(query)
    );
  });

  isModalOpen = signal(false);
  selectedClient = signal<Client | null>(null);

  viewDetails(client: Client) {
    this.selectedClient.set(client);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    setTimeout(() => {
      this.selectedClient.set(null);
    }, 300);
  }
}
