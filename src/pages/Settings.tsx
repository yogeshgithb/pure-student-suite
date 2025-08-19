import React from 'react';
import { useStudentContext } from '@/context/StudentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Trash2, 
  Download,
  AlertTriangle,
  Palette,
  Database
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Settings: React.FC = () => {
  const { state, toggleDarkMode, clearAllData, exportToCSV } = useStudentContext();

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all student data? This action cannot be undone.'
    );
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This will permanently delete all student records. Are you absolutely sure?'
      );
      
      if (doubleConfirmed) {
        clearAllData();
      }
    }
  };

  const handleExportData = () => {
    if (state.students.length === 0) {
      toast({
        title: "No Data",
        description: "No student data available to export.",
        variant: "destructive",
      });
      return;
    }
    exportToCSV();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and data
        </p>
      </div>

      {/* Appearance Settings */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {state.darkMode ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  id="dark-mode"
                  checked={state.darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Export Data */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="text-base font-medium">Export Student Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download all student data as a CSV file for backup or analysis
                </p>
              </div>
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
            </div>

            {/* Clear All Data */}
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-1">
                <h4 className="text-base font-medium text-destructive">
                  Clear All Data
                </h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all student records from the system
                </p>
              </div>
              <Button 
                onClick={handleClearAllData}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Total Students
                </Label>
                <div className="text-lg font-semibold">
                  {state.students.length}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Data Storage
                </Label>
                <div className="text-lg font-semibold">
                  Local Storage
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </Label>
                <div className="text-lg font-semibold">
                  {state.students.length > 0 
                    ? new Date(Math.max(...state.students.map(s => new Date(s.updatedAt).getTime()))).toLocaleDateString()
                    : 'No data'
                  }
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Theme
                </Label>
                <div className="text-lg font-semibold">
                  {state.darkMode ? 'Dark' : 'Light'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Notice */}
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Data Storage Notice</h4>
              <p className="text-sm text-muted-foreground">
                All student data is stored locally in your browser. Clearing browser data or using incognito mode may result in data loss. 
                It's recommended to export your data regularly for backup purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};