import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  X,
  Trash2
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { state, addNotification } = useAuth();
  const { notifications } = state;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Info className="h-4 w-4 text-primary" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success/10 border-success/20';
      case 'error': return 'bg-destructive/10 border-destructive/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'info': return 'bg-primary/10 border-primary/20';
      default: return 'bg-muted/50';
    }
  };

  const markAsRead = (id: string) => {
    // This would need to be added to AuthContext
    // dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const clearAllNotifications = () => {
    // This would need to be added to AuthContext
    // dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  return (
    <Card className="w-80 max-h-96">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all ${getNotificationBg(notification.type)} ${
                    !notification.read ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};