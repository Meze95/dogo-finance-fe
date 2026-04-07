import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { Product, ProductAssetAllocation, ProductType, AssetType } from '../../../shared/models/product.model';
import { DropdownComponent, DropdownOption } from '../../../shared/components/ui/dropdown.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts {
  private productService = inject(ProductService);
  
  products = this.productService.products;
  productTypes = this.productService.productTypes;
  assetTypes = this.productService.assetTypes;

  // Computed Options for Dropdowns
  productTypeOptions = computed<DropdownOption[]>(() => 
    this.productTypes().map(t => ({ value: t.productTypeId, label: t.name, icon: 'ri-folders-line' }))
  );

  riskLevelOptions: DropdownOption[] = [
    { value: 'Low', label: 'Low Risk', icon: 'ri-shield-check-line', subtitle: 'Conservative' },
    { value: 'Medium', label: 'Medium Risk', icon: 'ri-shield-flash-line', subtitle: 'Moderate' },
    { value: 'High', label: 'High Risk', icon: 'ri-shield-star-line', subtitle: 'Aggressive' }
  ];

  assetTypeOptions = computed<DropdownOption[]>(() => 
    this.assetTypes().map(t => ({ value: t.assetTypeId, label: t.name, icon: 'ri-coin-line' }))
  );

  searchQuery = signal('');
  activeTab = signal<'products' | 'types' | 'assets'>('products');

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.products();

    return this.products().filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.productId.toLowerCase().includes(query) ||
      p.riskLevel.toLowerCase().includes(query)
    );
  });

  isModalOpen = signal(false);
  isViewModalOpen = signal(false);
  isTypeModalOpen = signal(false);
  isAssetModalOpen = signal(false);
  
  selectedProduct = signal<Product | null>(null);
  selectedType = signal<ProductType | null>(null);
  selectedAsset = signal<AssetType | null>(null);
  
  // Form State
  formData = signal<Partial<Product>>({});
  typeFormData = signal<Partial<ProductType>>({});
  assetFormData = signal<Partial<AssetType>>({});
  allocations = signal<ProductAssetAllocation[]>([]);

  // Validation
  allocationValidation = computed(() => {
    const list = this.allocations();
    const total = list.reduce((sum, a) => sum + (Number(a.targetPercentage) || 0), 0);
    
    // Check for duplicates
    const assetIds = list.map(a => a.assetTypeId);
    const duplicates = assetIds.filter((item, index) => assetIds.indexOf(item) !== index);
    
    // Check for range errors and identify specifically which cards have errors
    const errors = list.map(a => ({
      isDuplicate: duplicates.includes(a.assetTypeId),
      isOutOfRange: Number(a.targetPercentage) < Number(a.minPercentage) || 
                   Number(a.targetPercentage) > Number(a.maxPercentage),
      isInvalidPercentage: Number(a.targetPercentage) < 0 || Number(a.targetPercentage) > 100 ||
                          Number(a.minPercentage) < 0 || Number(a.minPercentage) > 100 ||
                          Number(a.maxPercentage) < 0 || Number(a.maxPercentage) > 100
    }));
    
    const hasAnyError = errors.some(e => e.isDuplicate || e.isOutOfRange || e.isInvalidPercentage);
    
    return {
      total,
      errors,
      isValid: total === 100 && !hasAnyError,
      hasDuplicates: duplicates.length > 0,
    };
  });

  openAddModal() {
    this.selectedProduct.set(null);
    this.formData.set({
      name: '',
      productTypeId: this.productTypes()[0]?.productTypeId || '',
      riskLevel: 'Low',
      description: '',
      isActive: true,
      tenor: '',
      rate: 0
    });
    this.allocations.set([]);
    this.isModalOpen.set(true);
  }

  editProduct(product: Product) {
    this.selectedProduct.set(product);
    // Deep copy for form
    this.formData.set({ ...product });
    this.allocations.set(product.allocations ? product.allocations.map(a => ({...a, id: a.id || 'temp-' + Math.random()})) : []);
    this.isModalOpen.set(true);
  }

  viewProduct(product: Product) {
    this.selectedProduct.set(product);
    this.isViewModalOpen.set(true);
  }

  // Helper to update formData signal properly (no mutation)
  updateFormField(field: keyof Product, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  // Type-related methods
  openAddTypeModal() {
    this.selectedType.set(null);
    this.typeFormData.set({
      name: '',
      supportsAllocation: true,
      supportsProfitSharing: false
    });
    this.isTypeModalOpen.set(true);
  }

  editType(type: ProductType) {
    this.selectedType.set(type);
    this.typeFormData.set({ ...type });
    this.isTypeModalOpen.set(true);
  }

  saveType() {
    const typeData: ProductType = {
      ...this.typeFormData() as ProductType,
      productTypeId: this.selectedType()?.productTypeId || '',
      createdAt: this.selectedType()?.createdAt || new Date()
    };
    this.productService.saveProductType(typeData);
    this.isTypeModalOpen.set(false);
  }

  deleteType(id: string) {
    if (confirm('Are you sure you want to delete this product type?')) {
      this.productService.deleteProductType(id);
    }
  }

  // Asset Class Methods
  openAddAssetModal() {
    this.selectedAsset.set(null);
    this.assetFormData.set({
      name: '',
      isShariahCompliant: true
    });
    this.isAssetModalOpen.set(true);
  }

  editAsset(asset: AssetType) {
    this.selectedAsset.set(asset);
    this.assetFormData.set({ ...asset });
    this.isAssetModalOpen.set(true);
  }

  saveAsset() {
    const assetData: AssetType = {
      ...this.assetFormData() as AssetType,
      assetTypeId: this.selectedAsset()?.assetTypeId || '',
      createdAt: this.selectedAsset()?.createdAt || new Date()
    };
    this.productService.saveAssetType(assetData);
    this.isAssetModalOpen.set(false);
  }

  deleteAsset(id: string) {
    if (confirm('Are you sure you want to delete this asset class?')) {
      this.productService.deleteAssetType(id);
    }
  }

  updateAllocationValue(index: number, field: keyof ProductAssetAllocation, value: any) {
    this.allocations.update(list => {
      const newList = [...list];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  }

  addAllocation() {
    const newAlloc: ProductAssetAllocation = {
      id: 'temp-' + Date.now(),
      productId: this.selectedProduct()?.productId || '',
      assetTypeId: this.assetTypes()[0]?.assetTypeId || '',
      assetTypeName: this.assetTypes()[0]?.name || '',
      targetPercentage: 0,
      minPercentage: 0,
      maxPercentage: 0
    };
    this.allocations.update(a => [...a, newAlloc]);
  }

  removeAllocation(index: number) {
    this.allocations.update(list => list.filter((_, i) => i !== index));
  }

  updateAllocationAsset(index: number, assetTypeId: string) {
    const asset = this.assetTypes().find(a => a.assetTypeId === assetTypeId);
    if (asset) {
      this.allocations.update(list => {
        const newList = [...list];
        newList[index] = {
           ...newList[index],
           assetTypeId,
           assetTypeName: asset.name
        };
        return newList;
      });
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.isViewModalOpen.set(false);
    this.isTypeModalOpen.set(false);
    this.isAssetModalOpen.set(false);
  }

  saveProduct() {
    const validation = this.allocationValidation();
    if (!validation.isValid) {
      alert('Please fix the errors in asset allocations before saving.');
      return;
    }

    const productData: Product = {
      ...(this.selectedProduct() || {}),
      ...this.formData() as Product,
      allocations: this.allocations(),
      productId: this.selectedProduct()?.productId || ''
    };

    this.productService.saveProduct(productData);
    this.closeModal();
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
    }
  }
}
