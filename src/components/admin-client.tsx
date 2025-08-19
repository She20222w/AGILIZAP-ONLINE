
'use client';

import * as React from 'react';
import { getAllUsers, UserProfile, updateUserStatus, updateUserPayment, getUserById } from '@/services/user-service';
import { cancelUserAccount } from '@/app/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createSupabaseClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export function AdminClient() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | undefined>(undefined);
  const [userToCancel, setUserToCancel] = React.useState<UserProfile | null>(null);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createSupabaseClient();

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userProfile = await getUserById(user.id);
        if (userProfile && userProfile.status === 'reseller') {
            setIsAuthorized(true);
            fetchUsers();
        } else {
            setIsAuthorized(false);
            router.push('/dashboard'); // Redirect non-admins to their dashboard
        }
      } else {
        setIsAuthorized(false);
        router.push('/login'); // Redirect unauthenticated users to login
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userProfile = await getUserById(session.user.id);
        if (userProfile && userProfile.status === 'reseller') {
          setIsAuthorized(true);
          fetchUsers();
        } else {
          setIsAuthorized(false);
          router.push('/dashboard');
        }
      } else {
        setIsAuthorized(false);
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleStatusChange = async (uid: string, status: UserProfile['status']) => {
    setIsUpdating(uid);
    try {
      await updateUserStatus(uid, status as 'active' | 'inactive' | 'reseller');
      toast({
        title: "Success",
        description: "User status updated successfully.",
      });
      fetchUsers(); 
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePaymentRenew = async (uid: string) => {
     setIsUpdating(uid);
    try {
      await updateUserPayment(uid);
       await updateUserStatus(uid, 'active');
      toast({
        title: "Success",
        description: "User payment renewed and status set to active.",
      });
      fetchUsers();
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to renew payment.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const openCancelDialog = (user: UserProfile) => {
    setUserToCancel(user);
    setIsCancelAlertOpen(true);
  };

  const handleCancelAccount = async () => {
    if (!userToCancel) return;

    setIsUpdating(userToCancel.uid);
    setIsCancelAlertOpen(false);

    try {
        const result = await cancelUserAccount({ userId: userToCancel.uid, phoneNumber: userToCancel.phone });
        if (result.success) {
            toast({
                title: "Sucesso",
                description: result.success,
            });
            fetchUsers(); // Refresh list
        } else {
            throw new Error(result.error);
        }
    } catch (error: any) {
        toast({
            title: "Erro",
            description: `Falha ao cancelar a conta: ${error.message}`,
            variant: "destructive",
        });
    } finally {
        setIsUpdating(null);
        setUserToCancel(null);
    }
  };


  if (isAuthorized === undefined || (isAuthorized === true && isLoading)) {
    return (
       <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying access and loading users...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    // This state is briefly visible while router pushes user away.
     return (
       <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">Access denied. Redirecting...</p>
      </div>
    );
  }


  const getDaysSinceLastPayment = (lastPaymentDate: Date) => {
    return formatDistanceToNow(new Date(lastPaymentDate), { addSuffix: true });
  };
  
  const needsRenewal = (lastPaymentDate: Date) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(lastPaymentDate) < thirtyDaysAgo;
  }

  return (
    <>
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">Manage users and their subscriptions.</p>
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : user.status === 'reseller' ? 'secondary' : 'destructive'}>
                                {user.status}
                            </Badge>
                             {needsRenewal(user.last_payment_at ? new Date(user.last_payment_at) : new Date()) && user.status === 'active' && (
                                <Badge variant="destructive" className="ml-2">Renewal Needed</Badge>
                            )}
                        </TableCell>
                        <TableCell>{user.service_type}</TableCell>
                        <TableCell>
                           {user.last_payment_at ? new Date(user.last_payment_at).toLocaleDateString() : '-'} ({getDaysSinceLastPayment(user.last_payment_at ? new Date(user.last_payment_at) : new Date())})
                        </TableCell>
                         <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating === user.uid}>
                                     {isUpdating === user.uid ? <Loader2 className="h-4 w-4 animate-spin"/> :  <MoreHorizontal className="h-4 w-4" />}
                                    <span className="sr-only">Open menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handlePaymentRenew(user.uid)}>
                                    Marcar como Pago (Renovar)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'active')}>
                                    Ativar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'inactive')}>
                                    Desativar
                                </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleStatusChange(user.uid, 'reseller')}>
                                    Tornar Admin (Revendedor)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <DropdownMenuItem className="text-destructive" onClick={() => openCancelDialog(user)}>
                                    Cancelar Conta
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá disparar o webhook para cancelar a instância do WhatsApp do usuário e definirá seu status como 'inativo'.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelAccount} className="bg-destructive hover:bg-destructive/90">Sim, cancelar conta</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
