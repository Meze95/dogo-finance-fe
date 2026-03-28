import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Locked' | 'Pending KYC';
  kycLevel: string;
  accountBalance: number;
  dateJoined: string;
}

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients {
  clients = signal<Client[]>([
    { id: 'C001', firstName: 'Adebayo', lastName: 'Ogunlesi', email: 'ade.ogunlesi@example.com', phone: '08098765432', status: 'Active', kycLevel: 'Level 3 - Verified', accountBalance: 14500000, dateJoined: '12/11/2025' },
    { id: 'C002', firstName: 'Ngozi', lastName: 'Okonjo', email: 'n.okonjo@example.com', phone: '08123456789', status: 'Active', kycLevel: 'Level 2 - Partial', accountBalance: 2300000, dateJoined: '05/02/2026' },
    { id: 'C003', firstName: 'Ibrahim', lastName: 'Babangida', email: 'ibro.b@example.com', phone: '07023456781', status: 'Pending KYC', kycLevel: 'Level 1 - Basic', accountBalance: 0, dateJoined: '03/26/2026' },
    { id: 'C004', firstName: 'Oluwaseun', lastName: 'Adeyemi', email: 'seun.ade@example.com', phone: '09087654321', status: 'Locked', kycLevel: 'Level 3 - Verified', accountBalance: 850000, dateJoined: '01/15/2026' }
  ]);

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
