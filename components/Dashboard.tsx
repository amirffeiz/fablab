import React from 'react';
import { InventoryItem, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Package, AlertOctagon, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

interface DashboardProps {
  items: InventoryItem[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const stats = {
    totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
    totalRefs: items.length,
    lowStock: items.filter(i => i.quantity <= i.minQuantity).length,
    totalValue: items.reduce((acc, item) => acc + (item.quantity * (item.pricePerUnit || 0)), 0),
  };

  const categoryData = Object.values(Category).map(cat => ({
    name: cat,
    value: items.filter(i => i.category === cat).length
  })).filter(d => d.value > 0);

  const lowStockItems = items.filter(i => i.quantity <= i.minQuantity).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Références</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalRefs}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Stock Faible</p>
            <p className="text-2xl font-bold text-slate-800">{stats.lowStock}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Valeur Estimée</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalValue.toFixed(2)} €</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Articles Totaux</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalItems}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Répartition par Catégorie</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500">
             {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                    {entry.name} ({entry.value})
                </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Alertes de Stock</h3>
          {lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{item.quantity} / {item.minQuantity}</p>
                    <p className="text-xs text-slate-400">Restant</p>
                  </div>
                </div>
              ))}
              {items.filter(i => i.quantity <= i.minQuantity).length > 5 && (
                  <p className="text-xs text-center text-slate-400 italic">Et d'autres...</p>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <CheckCircle className="w-12 h-12 mb-2 opacity-20" />
              <p>Tous les niveaux de stock sont bons !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;