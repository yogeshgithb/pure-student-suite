import React from 'react';
import { Heart, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Code className="h-4 w-4" />
            <span className="text-sm">
              © 2024 StudySync - Student Management System
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span className="text-sm">Made with</span>
            <Heart className="h-4 w-4 text-destructive fill-current" />
            <span className="text-sm">for education</span>
          </div>
        </div>
      </div>
    </footer>
  );
};