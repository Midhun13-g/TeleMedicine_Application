import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { realtimeService } from '@/services/realtimeService';

interface Medicine {
  id: number;
  name: string;
  stock: number;
  price: number;
  manufacturer: string;
  category: string;
  available: boolean;
  minStockLevel: number;
}

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showLowStock, setShowLowStock] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    stock: '',
    price: '',
    manufacturer: '',
    category: '',
    description: '',
    dosage: '',
    expiryDate: '',
    minStockLevel: '10'
  });
  const [bulkUpdate, setBulkUpdate] = useState({
    category: '',
    priceIncrease: '',
    stockIncrease: ''
  });

  const pharmacyId = 1; // Fixed pharmacy ID for testing

  useEffect(() => {
    loadMedicines();
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadMedicines, 15000);
    
    // Listen for prescription updates from doctors
    const unsubscribePrescription = realtimeService.onPrescriptionAdded((data) => {
      console.log('📋 Pharmacy received prescription update:', data);
      toast({
        title: '📋 New Prescription',
        description: `New prescription received from ${data.doctorName}`,
      });
      loadMedicines(); // Refresh inventory
    });
    
    // Listen for medicine taken notifications from patients
    const unsubscribeMedicine = realtimeService.onMedicineTaken((data) => {
      console.log('📊 Pharmacy received medicine taken notification:', data);
      toast({
        title: '📊 Medicine Dispensed',
        description: `${data.patientName} took prescribed medicine`,
      });
    });
    
    return () => {
      clearInterval(interval);
      unsubscribePrescription();
      unsubscribeMedicine();
    };
  }, []);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/medicines/pharmacy/${pharmacyId}`);
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        console.error('Failed to load medicines');
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async () => {
    if (!newMedicine.name || !newMedicine.stock || !newMedicine.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const medicineData = {
      name: newMedicine.name,
      stock: parseInt(newMedicine.stock),
      price: parseFloat(newMedicine.price),
      manufacturer: newMedicine.manufacturer || '',
      category: newMedicine.category || '',
      pharmacyId: pharmacyId,
      available: parseInt(newMedicine.stock) > 0,
      minStockLevel: 10
    };

    console.log('Adding medicine:', medicineData);

    try {
      const response = await fetch('http://localhost:8080/api/medicines/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData)
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        toast({
          title: "Medicine Added",
          description: `${newMedicine.name} has been added to your inventory.`,
        });
        setNewMedicine({
          name: '',
          stock: '',
          price: '',
          manufacturer: '',
          category: '',
          description: '',
          dosage: '',
          expiryDate: '',
          minStockLevel: '10'
        });
        loadMedicines();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add medicine",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Add medicine error:', error);
      toast({
        title: "Error",
        description: `Network error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleUpdateStock = async (medicineId: number, newStock: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/medicines/update-stock/${medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });

      const result = await response.json();
      
      if (result.success) {
        // Notify other components about inventory update
        realtimeService.notifyInventoryUpdate({
          medicineId,
          medicineName: medicines.find(m => m.id === medicineId)?.name || 'Unknown',
          newStock,
          pharmacyId
        });
        
        toast({
          title: "Stock Updated",
          description: `Medicine stock has been updated to ${newStock} units.`,
        });
        loadMedicines();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update stock",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMedicine = async (medicineId: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/medicines/delete/${medicineId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Medicine Deleted",
          description: "Medicine has been removed from inventory.",
        });
        loadMedicines();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete medicine",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (stock: number, minLevel: number = 10) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock < minLevel) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const lowStockCount = medicines.filter(med => med.stock < (med.minStockLevel || 10)).length;
  const outOfStockCount = medicines.filter(med => med.stock === 0).length;
  const totalMedicines = medicines.length;
  const totalValue = medicines.reduce((sum, med) => sum + (med.price * med.stock), 0);
  // Enhanced categories with predefined list
  const predefinedCategories = [
    'Pain Relief', 'Antibiotics', 'Vitamins', 'Diabetes', 'Heart Disease',
    'Blood Pressure', 'Respiratory', 'Digestive', 'Skin Care', 'Eye Care',
    'Mental Health', 'Allergy', 'Cold & Flu', 'Fever', 'Infection',
    'Supplements', 'First Aid', 'Women Health', 'Child Care', 'Elderly Care'
  ];
  const existingCategories = [...new Set(medicines.map(med => med.category).filter(Boolean))];
  const categories = [...new Set([...predefinedCategories, ...existingCategories])].sort();

  const filteredMedicines = medicines
    .filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
      const matchesStock = !showLowStock || med.stock < (med.minStockLevel || 10);
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock': return a.stock - b.stock;
        case 'price': return a.price - b.price;
        case 'category': return (a.category || '').localeCompare(b.category || '');
        default: return a.name.localeCompare(b.name);
      }
    });

  const generateNotifications = () => {
    const newNotifications = [];
    const lowStock = medicines.filter(med => med.stock < (med.minStockLevel || 10) && med.stock > 0);
    const outOfStock = medicines.filter(med => med.stock === 0);
    
    if (lowStock.length > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'warning',
        title: `${lowStock.length} medicines running low`,
        message: lowStock.map(m => m.name).join(', '),
        time: new Date().toLocaleTimeString()
      });
    }
    
    if (outOfStock.length > 0) {
      newNotifications.push({
        id: 'out-of-stock',
        type: 'error',
        title: `${outOfStock.length} medicines out of stock`,
        message: outOfStock.map(m => m.name).join(', '),
        time: new Date().toLocaleTimeString()
      });
    }
    
    setNotifications(newNotifications);
  };

  const handleBulkUpdate = async () => {
    if (!bulkUpdate.category) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }
    
    if (!bulkUpdate.priceIncrease && !bulkUpdate.stockIncrease) {
      toast({ title: "Error", description: "Please specify price or stock changes", variant: "destructive" });
      return;
    }
    
    const categoryMedicines = medicines.filter(med => med.category === bulkUpdate.category);
    let updated = 0;
    let errors = 0;
    
    toast({ title: "Processing...", description: `Updating ${categoryMedicines.length} medicines...` });
    
    for (const medicine of categoryMedicines) {
      try {
        const updates: any = { ...medicine };
        
        if (bulkUpdate.priceIncrease) {
          const priceChange = parseFloat(bulkUpdate.priceIncrease) / 100;
          updates.price = Math.round((medicine.price * (1 + priceChange)) * 100) / 100;
        }
        
        if (bulkUpdate.stockIncrease) {
          updates.stock = Math.max(0, medicine.stock + parseInt(bulkUpdate.stockIncrease));
          updates.available = updates.stock > 0;
        }
        
        const response = await fetch(`http://localhost:8080/api/medicines/update/${medicine.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        if (response.ok) {
          updated++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error('Bulk update error:', error);
        errors++;
      }
    }
    
    toast({ 
      title: "Bulk Update Complete", 
      description: `✅ Updated ${updated} medicines${errors > 0 ? `, ${errors} errors` : ''}`,
      variant: errors > 0 ? "destructive" : "default"
    });
    
    setBulkUpdate({ category: '', priceIncrease: '', stockIncrease: '' });
    loadMedicines();
  };

  const exportInventory = () => {
    const csvContent = [
      ['Name', 'Category', 'Stock', 'Price', 'Manufacturer', 'Status'].join(','),
      ...medicines.map(med => [
        med.name,
        med.category || '',
        med.stock,
        med.price,
        med.manufacturer || '',
        getStockStatus(med.stock, med.minStockLevel).label
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmacy-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    generateNotifications();
  }, [medicines]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground">Manage your medicine inventory</p>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {notifications.length} alerts
            </Badge>
          )}
          <Badge variant="secondary">Pharmacy ID: {pharmacyId}</Badge>
          <Button onClick={exportInventory} variant="outline" size="sm">
            📊 Export
          </Button>
          <Button onClick={loadMedicines} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div key={notification.id} className={`p-3 rounded-lg border ${
              notification.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="add-medicine">Add Medicine</TabsTrigger>
          <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalMedicines}</div>
                <p className="text-xs text-muted-foreground">In your inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">Need restocking</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                <p className="text-xs text-muted-foreground">Urgent restocking</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{totalValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Inventory worth</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button 
                  variant="medical" 
                  onClick={() => {
                    const addMedicineTab = document.querySelector('[data-state="inactive"][value="add-medicine"]') as HTMLElement;
                    if (addMedicineTab) {
                      addMedicineTab.click();
                    } else {
                      // Fallback: try different selector
                      const allTabs = document.querySelectorAll('[role="tab"]');
                      const addTab = Array.from(allTabs).find(tab => 
                        tab.textContent?.toLowerCase().includes('add medicine')
                      ) as HTMLElement;
                      if (addTab) addTab.click();
                    }
                  }}
                  className="h-16 flex-col space-y-1"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Add Medicine</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const inventoryTab = document.querySelector('[data-state="inactive"][value="inventory"]') as HTMLElement;
                    if (inventoryTab) {
                      inventoryTab.click();
                    } else {
                      const allTabs = document.querySelectorAll('[role="tab"]');
                      const invTab = Array.from(allTabs).find(tab => 
                        tab.textContent?.toLowerCase().includes('inventory')
                      ) as HTMLElement;
                      if (invTab) invTab.click();
                    }
                    setTimeout(() => setShowLowStock(true), 100);
                  }}
                  className="h-16 flex-col space-y-1"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-xs">Low Stock</span>
                </Button>
                <Button 
                  variant="success" 
                  onClick={exportInventory}
                  className="h-16 flex-col space-y-1"
                >
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Export</span>
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={loadMedicines}
                  className="h-16 flex-col space-y-1"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span className="text-xs">Refresh</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map(category => {
                    const count = medicines.filter(med => med.category === category).length;
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>


        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Inventory ({filteredMedicines.length} medicines)</CardTitle>
              <CardDescription>Manage your medicine stock and availability</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-wrap gap-4 mb-4">
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="name">Sort by Name</option>
                  <option value="stock">Sort by Stock</option>
                  <option value="price">Sort by Price</option>
                  <option value="category">Sort by Category</option>
                </select>
                <Button
                  variant={showLowStock ? "default" : "outline"}
                  onClick={() => setShowLowStock(!showLowStock)}
                  size="sm"
                >
                  {showLowStock ? "Show All" : "Low Stock Only"}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading medicines...
                      </TableCell>
                    </TableRow>
                  ) : medicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No medicines found. Add your first medicine to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedicines.map((medicine) => {
                      const status = getStockStatus(medicine.stock, medicine.minStockLevel);
                      return (
                        <TableRow key={medicine.id}>
                          <TableCell className="font-medium">{medicine.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{medicine.stock}</span>
                              <Input
                                type="number"
                                className="w-16 h-8 text-xs"
                                placeholder="New"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const newStock = parseInt((e.target as HTMLInputElement).value);
                                    if (!isNaN(newStock)) {
                                      handleUpdateStock(medicine.id, newStock);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>₹{medicine.price}</TableCell>
                          <TableCell>{medicine.manufacturer}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicine(medicine.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-medicine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Medicine</CardTitle>
              <CardDescription>Add medicines to your pharmacy inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Medicine Name*</label>
                  <Input
                    placeholder="e.g., Paracetamol"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity*</label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={newMedicine.stock}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price per Unit (₹)*</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 25.50"
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Manufacturer</label>
                  <select
                    value={newMedicine.manufacturer}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select manufacturer...</option>
                    <option value="Sun Pharma">Sun Pharma</option>
                    <option value="Cipla">Cipla</option>
                    <option value="Dr. Reddy's">Dr. Reddy's</option>
                    <option value="Lupin">Lupin</option>
                    <option value="Aurobindo">Aurobindo</option>
                    <option value="Torrent">Torrent</option>
                    <option value="Zydus Cadila">Zydus Cadila</option>
                    <option value="Glenmark">Glenmark</option>
                    <option value="Alkem">Alkem</option>
                    <option value="Abbott">Abbott</option>
                    <option value="Pfizer">Pfizer</option>
                    <option value="GSK">GSK</option>
                    <option value="Novartis">Novartis</option>
                    <option value="Sanofi">Sanofi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Stock Level</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={newMedicine.minStockLevel}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, minStockLevel: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dosage/Strength</label>
                  <Input
                    placeholder="e.g., 500mg, 10ml"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <Input
                    type="date"
                    value={newMedicine.expiryDate}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Brief description of the medicine..."
                  value={newMedicine.description}
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddMedicine} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine to Inventory
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewMedicine({
                    name: '', stock: '', price: '', manufacturer: '', category: '',
                    description: '', dosage: '', expiryDate: '', minStockLevel: '10'
                  })}
                >
                  🔄 Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
              <CardDescription>Update multiple medicines at once by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-3">Step 1: Select Category</h3>
                <select
                  value={bulkUpdate.category}
                  onChange={(e) => setBulkUpdate(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Choose category to update...</option>
                  {categories.filter(cat => medicines.some(med => med.category === cat)).map(cat => {
                    const count = medicines.filter(med => med.category === cat).length;
                    return (
                      <option key={cat} value={cat}>{cat} ({count} medicines)</option>
                    );
                  })}
                </select>
                {bulkUpdate.category && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <p className="text-sm text-gray-600">
                      Selected: <strong>{bulkUpdate.category}</strong> - 
                      {medicines.filter(med => med.category === bulkUpdate.category).length} medicines will be updated
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {medicines.filter(med => med.category === bulkUpdate.category).slice(0, 5).map(med => (
                        <Badge key={med.id} variant="outline" className="text-xs">{med.name}</Badge>
                      ))}
                      {medicines.filter(med => med.category === bulkUpdate.category).length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{medicines.filter(med => med.category === bulkUpdate.category).length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Update Options */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">💰 Price Updates</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price Increase (%)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 10 for 10% increase"
                        value={bulkUpdate.priceIncrease}
                        onChange={(e) => setBulkUpdate(prev => ({ ...prev, priceIncrease: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter positive number to increase, negative to decrease</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setBulkUpdate(prev => ({ ...prev, priceIncrease: '5' }))}>
                        +5%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setBulkUpdate(prev => ({ ...prev, priceIncrease: '10' }))}>
                        +10%
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setBulkUpdate(prev => ({ ...prev, priceIncrease: '15' }))}>
                        +15%
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">📦 Stock Updates</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Stock Increase (Units)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 50 units to add"
                        value={bulkUpdate.stockIncrease}
                        onChange={(e) => setBulkUpdate(prev => ({ ...prev, stockIncrease: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter positive number to add stock</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setBulkUpdate(prev => ({ ...prev, stockIncrease: '25' }))}>
                        +25
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setBulkUpdate(prev => ({ ...prev, stockIncrease: '50' }))}>
                        +50
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setBulkUpdate(prev => ({ ...prev, stockIncrease: '100' }))}>
                        +100
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview and Apply */}
              {bulkUpdate.category && (bulkUpdate.priceIncrease || bulkUpdate.stockIncrease) && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium mb-2">📋 Preview Changes</h3>
                  <div className="text-sm space-y-1">
                    <p>Category: <strong>{bulkUpdate.category}</strong></p>
                    <p>Medicines affected: <strong>{medicines.filter(med => med.category === bulkUpdate.category).length}</strong></p>
                    {bulkUpdate.priceIncrease && (
                      <p>Price change: <strong>{bulkUpdate.priceIncrease > 0 ? '+' : ''}{bulkUpdate.priceIncrease}%</strong></p>
                    )}
                    {bulkUpdate.stockIncrease && (
                      <p>Stock increase: <strong>+{bulkUpdate.stockIncrease} units per medicine</strong></p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkUpdate} 
                  className="flex-1"
                  disabled={!bulkUpdate.category || (!bulkUpdate.priceIncrease && !bulkUpdate.stockIncrease)}
                >
                  🚀 Apply Bulk Update
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBulkUpdate({ category: '', priceIncrease: '', stockIncrease: '' })}
                >
                  🔄 Reset
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">⚡ Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    const lowStockMeds = medicines.filter(med => med.stock < 10);
                    if (lowStockMeds.length > 0) {
                      setBulkUpdate({ category: lowStockMeds[0].category, priceIncrease: '', stockIncrease: '50' });
                    }
                  }}>
                    🔄 Restock Low
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setBulkUpdate({ category: categories[0], priceIncrease: '10', stockIncrease: '' });
                  }}>
                    💰 Price +10%
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setBulkUpdate({ category: categories[0], priceIncrease: '', stockIncrease: '25' });
                  }}>
                    📦 Stock +25
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setBulkUpdate({ category: categories[0], priceIncrease: '5', stockIncrease: '50' });
                  }}>
                    🔥 Both +5%/+50
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>In Stock</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${totalMedicines > 0 ? ((totalMedicines - lowStockCount - outOfStockCount) / totalMedicines) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{totalMedicines - lowStockCount - outOfStockCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low Stock</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${totalMedicines > 0 ? (lowStockCount / totalMedicines) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{lowStockCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Out of Stock</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${totalMedicines > 0 ? (outOfStockCount / totalMedicines) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{outOfStockCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.slice(0, 5).map(category => {
                    const count = medicines.filter(med => med.category === category).length;
                    const value = medicines
                      .filter(med => med.category === category)
                      .reduce((sum, med) => sum + (med.price * med.stock), 0);
                    return (
                      <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{category}</div>
                          <div className="text-sm text-gray-500">{count} medicines</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{value.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default PharmacyDashboard;