import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, RefreshCw } from 'lucide-react';
import { pharmacyService, MedicineStock } from '@/services/pharmacyService';
import { useToast } from '@/hooks/use-toast';

const MedicineSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [medicineAvailability, setMedicineAvailability] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [searchMode, setSearchMode] = useState<'all' | 'availability'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAllMedicines();
    loadPharmacies();
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      loadAllMedicines();
      loadPharmacies();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAllMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/medicines/search');
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.filter((med: any) => med.available && med.stock > 0));
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPharmacies = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/pharmacies');
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    }
  };

  const checkMedicineAvailability = async (medicineName: string) => {
    if (!medicineName.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/pharmacies/medicine-availability/${encodeURIComponent(medicineName)}`);
      if (response.ok) {
        const data = await response.json();
        setMedicineAvailability(data);
        setSearchMode('availability');
      }
    } catch (error) {
      console.error('Error checking medicine availability:', error);
      toast({
        title: "Error",
        description: "Failed to check medicine availability",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAllMedicines();
      setSearchMode('all');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/medicines/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.filter((med: any) => med.available && med.stock > 0));
        setSearchMode('all');
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error searching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, minLevel: number) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock < minLevel) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const categories = [...new Set(medicines.map(med => med.category).filter(Boolean))];

  const filteredMedicines = medicines
    .filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           med.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
      const matchesPrice = (!priceRange.min || med.price >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || med.price <= parseFloat(priceRange.max));
      const matchesAvailability = !showAvailableOnly || (med.available && med.stock > 0);
      return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'stock': return b.stock - a.stock;
        case 'category': return (a.category || '').localeCompare(b.category || '');
        default: return a.name.localeCompare(b.name);
      }
    });

  const groupedMedicines = filteredMedicines.reduce((acc, medicine) => {
    const key = medicine.pharmacyId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(medicine);
    return acc;
  }, {} as Record<number, MedicineStock[]>);

  const toggleFavorite = (medicineId: number) => {
    setFavorites(prev => 
      prev.includes(medicineId) 
        ? prev.filter(id => id !== medicineId)
        : [...prev, medicineId]
    );
    toast({
      title: favorites.includes(medicineId) ? "Removed from favorites" : "Added to favorites",
      description: "Medicine favorites updated"
    });
  };

  const requestMedicine = (medicineName: string, pharmacyId: number) => {
    toast({
      title: "Request Sent",
      description: `Request for ${medicineName} sent to Pharmacy ${pharmacyId}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medicine Search</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <Button onClick={loadAllMedicines} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Find Medicines ({searchMode === 'availability' ? medicineAvailability.length : filteredMedicines.length} found)
          </CardTitle>
          <CardDescription>
            {searchMode === 'availability' 
              ? `Checking availability of "${searchQuery}" across all pharmacies`
              : 'Search for available medicines across pharmacies'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search medicines by name or manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              onClick={() => checkMedicineAvailability(searchQuery)} 
              disabled={loading || !searchQuery.trim()}
              variant="outline"
            >
              📍 Check Availability
            </Button>
          </div>
          
          {/* Advanced Filters */}
          <div className="grid md:grid-cols-4 gap-4">
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
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock Level</option>
              <option value="category">Category</option>
            </select>
            
            <div className="flex space-x-1">
              <Input
                type="number"
                placeholder="Min ₹"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-20"
              />
            </div>
            
            <Button
              variant={showAvailableOnly ? "default" : "outline"}
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              size="sm"
            >
              {showAvailableOnly ? "Available Only" : "Show All"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Searching medicines...
          </CardContent>
        </Card>
      ) : medicines.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No medicines found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try searching with different keywords' : 'No medicines are currently available'}
            </p>
          </CardContent>
        </Card>
      ) : searchMode === 'availability' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Medicine Availability: "{searchQuery}"</h2>
            <Button onClick={() => { setSearchMode('all'); loadAllMedicines(); }} variant="outline" size="sm">
              ← Back to All Medicines
            </Button>
          </div>
          
          {medicineAvailability.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Medicine not found</h3>
                <p className="text-muted-foreground">
                  "{searchQuery}" is not available in any pharmacy
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Available at {medicineAvailability.filter(p => p.available).length} pharmacy(ies)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicineAvailability.map((pharmacy) => (
                      <TableRow key={pharmacy.pharmacyId}>
                        <TableCell>
                          <div className="font-medium">{pharmacy.pharmacyName}</div>
                          <div className="text-sm text-gray-500">ID: {pharmacy.pharmacyId}</div>
                        </TableCell>
                        <TableCell className="text-sm">{pharmacy.address}</TableCell>
                        <TableCell className="text-sm">{pharmacy.contact}</TableCell>
                        <TableCell>
                          <Badge variant={pharmacy.available ? 'default' : 'destructive'}>
                            {pharmacy.available ? 'Available' : 'Not Available'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={pharmacy.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                            {pharmacy.stock} units
                          </span>
                        </TableCell>
                        <TableCell>
                          {pharmacy.price ? (
                            <div className="font-medium">₹{pharmacy.price}</div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant={pharmacy.available ? 'default' : 'outline'}
                              onClick={() => requestMedicine(searchQuery, pharmacy.pharmacyId)}
                              disabled={!pharmacy.available}
                            >
                              {pharmacy.available ? '📞 Call' : '❌ Unavailable'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMedicines).map(([pharmacyId, pharmacyMedicines]) => {
            // Get pharmacy info from the first medicine in the group (all medicines from same pharmacy have same info)
            const firstMedicine = pharmacyMedicines[0];
            const pharmacyInfo = {
              name: firstMedicine.pharmacyName || `Pharmacy ID: ${pharmacyId}`,
              address: firstMedicine.pharmacyAddress || 'Address not available',
              contact: firstMedicine.pharmacyContact || 'Contact not available',
              rating: firstMedicine.pharmacyRating || 4.0,
              hours: firstMedicine.pharmacyHours || 'Contact for hours',
              is24Hours: firstMedicine.is24Hours || false
            };
            
            return (
              <Card key={pharmacyId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        {pharmacyInfo.name}
                        {pharmacyInfo.is24Hours && <Badge variant="secondary" className="ml-2">24/7</Badge>}
                      </CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <div>📍 {pharmacyInfo.address}</div>
                          <div className="text-sm">📞 {pharmacyInfo.contact} • ⭐ {pharmacyInfo.rating}/5</div>
                          <div className="text-sm">🕒 {pharmacyInfo.hours}</div>
                        </div>
                        {pharmacyMedicines.length} medicine(s) available
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pharmacyMedicines.map((medicine) => {
                        const status = getStockStatus(medicine.stock, medicine.minStockLevel);
                        return (
                          <TableRow key={medicine.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleFavorite(medicine.id)}
                                  className={`text-lg ${favorites.includes(medicine.id) ? 'text-red-500' : 'text-gray-300'}`}
                                >
                                  ❤️
                                </button>
                                <div>
                                  <div className="font-medium">{medicine.name}</div>
                                  <div className="text-sm text-gray-500">{medicine.dosage || 'N/A'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{medicine.category || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="font-medium">₹{medicine.price}</div>
                              <div className="text-sm text-gray-500">per unit</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{medicine.stock} units</span>
                                <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>{medicine.manufacturer || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => requestMedicine(medicine.name, medicine.pharmacyId)}
                                  disabled={medicine.stock === 0}
                                >
                                  📞 Request
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => checkMedicineAvailability(medicine.name)}
                                >
                                  📍 Check Other Pharmacies
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;