import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, Clock, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Notification {
    id: string;
    title: string;
    message: string;
    notification_type: string;
    category: string;
    priority: string;
    is_read: boolean;
    action_url: string | null;
    created_at: string;
}

export default function Notifications() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadNotifications();
    }, [user]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', id);

            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('user_id', user?.id)
                .eq('is_read', false);

            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast({ title: "Listo", description: "Todas las notificaciones marcadas como leídas." });
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron actualizar las notificaciones.", variant: "destructive" });
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await supabase.from('notifications').delete().eq('id', id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'reminder': return <Clock className="h-5 w-5 text-blue-500" />;
            default: return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            urgent: "bg-red-100 text-red-800",
            high: "bg-orange-100 text-orange-800",
            normal: "bg-blue-100 text-blue-800",
            low: "bg-gray-100 text-gray-800"
        };
        return <Badge className={styles[priority] || styles.normal}>{priority}</Badge>;
    };

    const formatTimeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'ahora';
    };

    const unreadNotifications = notifications.filter(n => !n.is_read);
    const readNotifications = notifications.filter(n => n.is_read);

    const NotificationItem = ({ notification }: { notification: Notification }) => (
        <div
            className={`p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-primary/5' : ''}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    {getTypeIcon(notification.notification_type)}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                            </h4>
                            {notification.priority !== 'normal' && getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {!notification.is_read && (
                        <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Centro de Notificaciones</h1>
                    <p className="text-muted-foreground">
                        {unreadNotifications.length > 0
                            ? `Tienes ${unreadNotifications.length} notificación${unreadNotifications.length > 1 ? 'es' : ''} sin leer`
                            : 'No tienes notificaciones pendientes'
                        }
                    </p>
                </div>
                {unreadNotifications.length > 0 && (
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCheck className="mr-2 h-4 w-4" /> Marcar todas como leídas
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Sin Leer</p>
                                <p className="text-3xl font-bold text-primary">{unreadNotifications.length}</p>
                            </div>
                            <Bell className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Leídas</p>
                                <p className="text-3xl font-bold">{readNotifications.length}</p>
                            </div>
                            <Check className="h-8 w-8 text-muted-foreground opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-3xl font-bold">{notifications.length}</p>
                            </div>
                            <Info className="h-8 w-8 text-muted-foreground opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card className="medical-card">
                <Tabs defaultValue="unread">
                    <CardHeader>
                        <TabsList>
                            <TabsTrigger value="unread" className="gap-2">
                                Sin Leer
                                {unreadNotifications.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">{unreadNotifications.length}</Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="all">Todas</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TabsContent value="unread" className="m-0">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground">Cargando...</div>
                            ) : unreadNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-medium mb-2">¡Todo al día!</h3>
                                    <p className="text-muted-foreground">No tienes notificaciones pendientes</p>
                                </div>
                            ) : (
                                unreadNotifications.map(n => <NotificationItem key={n.id} notification={n} />)
                            )}
                        </TabsContent>
                        <TabsContent value="all" className="m-0">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground">Cargando...</div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Sin notificaciones</h3>
                                    <p className="text-muted-foreground">Las notificaciones aparecerán aquí</p>
                                </div>
                            ) : (
                                notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                            )}
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    );
}
