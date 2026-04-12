import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { Product, ProductAssetAllocation, ProductType, AssetType, AssetInstrument } from '../../../shared/models/product.model';
import { DropdownComponent, DropdownOption } from '../../../shared/components/ui/dropdown.component';
import { AlertService } from '../../../shared/services/alert.service';

declare var Swal: any;

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts {
  public productService = inject(ProductService);
  private alertService = inject(AlertService);
  
  portfolios = this.productService.portfolios;
  portfolioTypes = this.productService.portfolioTypes;
  assetTypes = this.productService.assetTypes;

  isLoading = signal(false);

  // Computed Options for Dropdowns
  portfolioTypeOptions = computed<DropdownOption[]>(() => 
    this.portfolioTypes().map(t => ({ value: t.portfolioTypeId, label: t.name, icon: 'ri-folders-line' }))
  );

  riskLevelOptions: DropdownOption[] = [
    { value: 'Low', label: 'Low Risk', icon: 'ri-shield-check-line', subtitle: 'Conservative' },
    { value: 'Medium', label: 'Medium Risk', icon: 'ri-shield-flash-line', subtitle: 'Moderate' },
    { value: 'High', label: 'High Risk', icon: 'ri-shield-star-line', subtitle: 'Aggressive' }
  ];

  assetTypeOptions = computed<DropdownOption[]>(() => 
    this.assetTypes().map(t => ({ value: t.assetTypeId, label: t.name, icon: 'ri-coin-line' }))
  );

  instrumentAssetClassOptions = computed<DropdownOption[]>(() => 
    this.assetTypes().map(t => ({ value: t.assetTypeId, label: t.name, icon: 'ri-bank-line' }))
  );

  searchQuery = signal('');
  activeTab = signal<'portfolios' | 'types' | 'assets' | 'instruments'>('portfolios');

  filteredPortfolios = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.portfolios();

    return this.portfolios().filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.portfolioId.toString().includes(query) ||
      p.riskLevel.toLowerCase().includes(query)
    );
  });

  isModalOpen = signal(false);
  isViewModalOpen = signal(false);
  isTypeModalOpen = signal(false);
  isAssetModalOpen = signal(false);
  isInstrumentModalOpen = signal(false);
  
  selectedProduct = signal<Product | null>(null);
  selectedType = signal<ProductType | null>(null);
  selectedAsset = signal<AssetType | null>(null);
  selectedInstrument = signal<AssetInstrument | null>(null);
  
  // Form State
  formData = signal<Partial<Product>>({});
  typeFormData = signal<Partial<ProductType>>({});
  assetFormData = signal<Partial<AssetType>>({});
  instrumentFormData = signal<Partial<AssetInstrument>>({});
  allocations = signal<ProductAssetAllocation[]>([]);

  // Validation
  allocationValidation = computed(() => {
    const list = this.allocations();
    const total = list.reduce((sum, a) => sum + (Number(a.targetPercentage) || 0), 0);
    const assetIds = list.map(a => a.assetTypeId);
    const duplicates = assetIds.filter((item, index) => assetIds.indexOf(item) !== index);
    
    const errors = list.map(a => {
      const instrumentTotal = (a.instruments || []).reduce((sum, inst) => sum + (Number(inst.percentage) || 0), 0);
      const hasInstruments = (a.instruments || []).length > 0;
      
      const instrumentIds = (a.instruments || []).map(i => i.instrumentId);
      const instrumentDuplicates = instrumentIds.filter((id, index) => instrumentIds.indexOf(id) !== index);
      
      return {
        isDuplicate: duplicates.includes(a.assetTypeId),
        isOutOfRange: Number(a.targetPercentage) < Number(a.minPercentage) || 
                     Number(a.targetPercentage) > Number(a.maxPercentage),
        isInvalidPercentage: Number(a.targetPercentage) < 0 || Number(a.targetPercentage) > 100,
        instrumentsInvalidCharge: hasInstruments && instrumentTotal !== 100,
        instrumentTotal: instrumentTotal,
        hasDuplicateInstruments: instrumentDuplicates.length > 0,
        duplicateInstrumentIds: instrumentDuplicates
      };
    });
    
    const hasAnyError = errors.some(e => e.isDuplicate || e.isOutOfRange || e.isInvalidPercentage || e.instrumentsInvalidCharge || e.hasDuplicateInstruments);
    return { total, errors, isValid: total === 100 && !hasAnyError, hasDuplicates: duplicates.length > 0 };
  });

  // Common Swal Confirm/Cancel Pattern
  private confirmAction(action: string, execute: () => void) {
    Swal.fire({
      title: `Confirm ${action}`,
      text: `Are you sure you want to proceed with this ${action.toLowerCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#C9A84C',
      cancelButtonColor: '#96a5b1',
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'No, cancel',
      background: '#f8f7f2',
      color: '#0d1a0f',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        execute();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.alertService.info('Operation Canceled', `The ${action.toLowerCase()} operation was stopped.`);
      }
    });
  }

  // Common Swal Response Pattern
  private handleResponse(obs: any, successTitle: string) {
    const loaderId = this.alertService.loading(successTitle, 'Processing your request...');

    obs.subscribe({
      next: (res: any) => {
        this.alertService.remove(loaderId);
        if (res.success || res.boolean || res.message) {
          this.alertService.success(successTitle, res.message || 'Updated successfully!');
          this.closeModal();
        } else {
          this.alertService.error('Action Failed', res.message || 'Something went wrong.');
        }
      },
      error: (err: any) => {
        this.alertService.remove(loaderId);
        this.alertService.error('Connection Lost', 'Unable to reach the server.');
      }
    });
  }

  openAddModal() {
    this.selectedProduct.set(null);
    this.formData.set({ name: '', code: '', portfolioTypeId: this.portfolioTypes()[0]?.portfolioTypeId || 0, riskLevel: 'Low', description: '', isActive: true, minTenorInDays: 0, maxTenorInDays: 0 });
    this.allocations.set([]);
    this.isModalOpen.set(true);
  }

  editPortfolio(portfolio: Product) {
    this.selectedProduct.set(portfolio);
    this.formData.set({ ...portfolio });
    this.allocations.set(portfolio.allocations ? portfolio.allocations.map(a => ({...a, id: a.id || 0})) : []);
    this.isModalOpen.set(true);
  }

  viewPortfolio(portfolio: Product) {
    this.selectedProduct.set(portfolio);
    this.isViewModalOpen.set(true);
  }

  updateFormField(field: keyof Product, value: any) { this.formData.update(data => ({ ...data, [field]: value })); }
  updateTypeFormField(field: keyof ProductType, value: any) { this.typeFormData.update(data => ({ ...data, [field]: value })); }
  updateAssetFormField(field: keyof AssetType, value: any) { this.assetFormData.update(data => ({ ...data, [field]: value })); }

  // Type Methods
  openAddTypeModal() {
    this.selectedType.set(null);
    this.typeFormData.set({ portfolioTypeId: 0, name: '', code: '', supportsAllocation: true, supportsProfitSharing: false });
    this.isTypeModalOpen.set(true);
  }

  editType(type: ProductType) {
    this.selectedType.set(type);
    this.typeFormData.set({ ...type });
    this.isTypeModalOpen.set(true);
  }

  saveType() {
    this.confirmAction('Save Type', () => {
      const typeData: ProductType = { ...this.typeFormData() as ProductType, portfolioTypeId: this.selectedType()?.portfolioTypeId || 0 };
      this.handleResponse(this.productService.savePortfolioType(typeData), 'Type Saved');
    });
  }

  deleteType(id: number) {
    this.confirmAction('Delete Type', () => {
      this.handleResponse(this.productService.deletePortfolioType(id), 'Type Removed');
    });
  }

  getInstrumentOptions(assetTypeId: number): DropdownOption[] {
    let instruments = this.getInstrumentsForAsset(assetTypeId);
    
    // Fallback: if no instruments match this specific asset class (or relationship is missing),
    // show all available instruments so the UI remains functional.
    if (instruments.length === 0) {
      instruments = this.productService.instruments();
    }

    return instruments.map(i => ({
      value: i.id,
      label: i.name,
      icon: 'ri-bank-line'
    }));
  }

  // Asset Methods
  openAddAssetModal() {
    this.selectedAsset.set(null);
    this.assetFormData.set({ assetTypeId: 0, name: '', code: '', isShariahCompliant: true });
    this.isAssetModalOpen.set(true);
  }

  editAsset(asset: AssetType) {
    this.selectedAsset.set(asset);
    this.assetFormData.set({ ...asset });
    this.isAssetModalOpen.set(true);
  }

  saveAsset() {
    const assetData: AssetType = { ...this.assetFormData() as AssetType, assetTypeId: this.selectedAsset()?.assetTypeId || 0 };
    this.handleResponse(this.productService.saveAssetType(assetData), 'Asset Saved');
  }

  deleteAsset(id: number) {
    this.confirmAction('Delete Asset Class', () => {
      this.handleResponse(this.productService.deleteAssetType(id), 'Asset Removed');
    });
  }

  // Instrument Methods
  openAddInstrumentModal() {
    this.selectedInstrument.set(null);
    this.instrumentFormData.set({ 
      id: 0, 
      name: '', 
      code: '', 
      unitPrice: 0, 
      priceDate: new Date().toISOString().split('T')[0], 
      priceSource: 'Manual Entry', 
      assetTypeId: this.assetTypes()[0]?.assetTypeId || 0 
    });
    this.isInstrumentModalOpen.set(true);
  }

  editInstrument(instrument: AssetInstrument) {
    this.selectedInstrument.set(instrument);
    this.instrumentFormData.set({ ...instrument });
    this.isInstrumentModalOpen.set(true);
  }

  saveInstrument() {
    const instrumentData: AssetInstrument = { ...this.instrumentFormData() as AssetInstrument, id: this.selectedInstrument()?.id || 0 };
    this.handleResponse(this.productService.saveInstrument(instrumentData), 'Instrument Saved');
  }

  deleteInstrument(id: number) {
    this.confirmAction('Delete Instrument', () => {
      this.handleResponse(this.productService.deleteInstrument(id), 'Instrument Removed');
    });
  }

  getInstrumentsForAsset(assetTypeId: number) {
    return this.productService.instruments().filter(i => i.assetTypeId === assetTypeId);
  }

  // Portfolio Methods
  savePortfolio() {
    const validation = this.allocationValidation();
    if (!validation.isValid) {
      Swal.fire({ icon: 'error', title: 'Validation Failed', text: 'Total allocation must be exactly 100%. Each asset class must also have 100% instrument distribution.', confirmButtonColor: '#C9A84C', background: '#f8f7f2', customClass: { popup: 'rounded-[30px]' } });
      return;
    }

    this.confirmAction('Save Portfolio', () => {
      const portfolioData: Product = { ...(this.selectedProduct() || {}), ...this.formData() as Product, allocations: this.allocations(), portfolioId: this.selectedProduct()?.portfolioId || 0 };
      this.handleResponse(this.productService.savePortfolio(portfolioData), 'Portfolio Saved');
    });
  }

  deletePortfolio(id: number) {
    this.confirmAction('Delete Portfolio', () => {
      this.handleResponse(this.productService.deletePortfolio(id), 'Portfolio Removed');
    });
  }

  updateAllocationValue(index: number, field: keyof ProductAssetAllocation, value: any) {
    this.allocations.update(list => { const newList = [...list]; newList[index] = { ...newList[index], [field]: value }; return newList; });
  }

  addAllocation() {
    const newAlloc: ProductAssetAllocation = { id: 0, portfolioId: this.selectedProduct()?.portfolioId || 0, assetTypeId: this.assetTypes()[0]?.assetTypeId || 0, assetTypeName: this.assetTypes()[0]?.name || '', targetPercentage: 0, minPercentage: 0, maxPercentage: 0 };
    this.allocations.update(a => [...a, newAlloc]);
  }

  removeAllocation(index: number) { this.allocations.update(list => list.filter((_, i) => i !== index)); }

  updateAllocationAsset(index: number, assetTypeId: number) {
    const asset = this.assetTypes().find(a => a.assetTypeId === assetTypeId);
    if (asset) { 
      this.allocations.update(list => { 
        const newList = [...list]; 
        newList[index] = { ...newList[index], assetTypeId, assetTypeName: asset.name, instruments: [] }; 
        return newList; 
      }); 
    }
  }

  addInstrumentToAllocation(assetIndex: number) {
    this.allocations.update(list => {
      const newList = [...list];
      const alloc = newList[assetIndex];
      let availableInstruments = this.getInstrumentsForAsset(alloc.assetTypeId);
      
      // Fallback to all instruments if none found for this asset class
      if (availableInstruments.length === 0) {
        availableInstruments = this.productService.instruments();
      }

      if (availableInstruments.length > 0) {
        if (!alloc.instruments) alloc.instruments = [];
        alloc.instruments.push({ id: 0, instrumentId: availableInstruments[0].id, instrumentName: availableInstruments[0].name, percentage: 0 });
      }
      return newList;
    });
  }

  removeInstrumentFromAllocation(assetIndex: number, instrumentIndex: number) {
    this.allocations.update(list => {
      const newList = [...list];
      newList[assetIndex].instruments = newList[assetIndex].instruments?.filter((_, i) => i !== instrumentIndex);
      return newList;
    });
  }

  updateInstrumentAllocationValue(assetIndex: number, instrumentIndex: number, field: any, value: any) {
    this.allocations.update(list => {
      const newList = [...list];
      const instruments = newList[assetIndex].instruments;
      if (instruments) {
        instruments[instrumentIndex] = { ...instruments[instrumentIndex], [field]: value };
        if (field === 'instrumentId') {
          const inst = this.productService.instruments().find(i => i.id === value);
          instruments[instrumentIndex].instrumentName = inst?.name;
        }
      }
      return newList;
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.isViewModalOpen.set(false);
    this.isTypeModalOpen.set(false);
    this.isAssetModalOpen.set(false);
    this.isInstrumentModalOpen.set(false);
  }
}
