import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

const SimplePharmacyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    stock: '',
    price: '',
    manufacturer: '',
    category: ''
  });

  const pharmacyId = 1; // Fixed pharmacy ID for testing

  useEffect(() => {
    loadMedicines();
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
      manufacturer: newMedicine.manufacturer,
      category: newMedicine.category,
      pharmacyId: pharmacyId,
      available: parseInt(newMedicine.stock) > 0,
      minStockLevel: 10
    };

    try {
      const response = await fetch('http://localhost:8080/api/medicines/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData)
      });

      const result = await response.json();
      
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
          category: ''
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
      toast({
        title: "Error",
        description: "Failed to add medicine",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Pharmacy Dashboard</h1>
        <div className="flex space-x-2">
          <Badge variant="secondary">Pharmacy ID: {pharmacyId}</Badge>
          <Button onClick={loadMedicines} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="add-medicine">Add Medicine</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
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
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>Manage your medicine stock and availability</CardDescription>
            </CardHeader>
            <CardContent>
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
                    medicines.map((medicine) => {
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
                  <Input
                    placeholder="e.g., Pain Relief"
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, category: e.target.value }))}
                  />
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
                  <Input
                    placeholder="e.g., Sun Pharma"
                    value={newMedicine.manufacturer}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, manufacturer: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleAddMedicine} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine to Inventory
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimplePharmacyDashboard;