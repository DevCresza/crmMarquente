import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  LayoutGrid,
  Table2,
  Eye,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import type { B2BRegistration, B2BStatus } from '@/types';
import { cn } from '@/lib/utils';
import { registrationsApi } from '@/api';

const STATUS_OPTIONS: { value: B2BStatus; label: string; color: string }[] = [
  { value: 'Lead Site', label: 'Lead Site', color: 'bg-purple-500' },
  { value: 'Lead Site - À Vista', label: 'À Vista', color: 'bg-blue-500' },
  { value: 'Lead Site - A Prazo', label: 'A Prazo', color: 'bg-indigo-500' },
  { value: 'Aguardando Análise', label: 'Aguardando', color: 'bg-yellow-500' },
  { value: 'Cadastro Recebido', label: 'Recebido', color: 'bg-cyan-500' },
  { value: 'Avaliação Cadastro', label: 'Avaliação', color: 'bg-orange-500' },
  { value: 'Cadastro Pendente', label: 'Pendente', color: 'bg-red-500' },
  { value: 'Cadastro Realizado', label: 'Realizado', color: 'bg-green-500' },
  { value: 'Onboarding Realizado', label: 'Onboarding', color: 'bg-emerald-500' },
];

export function CRM() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [registrations, setRegistrations] = useState<B2BRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<B2BRegistration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const data = await registrationsApi.getAll();
        setRegistrations(data);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      }
    };
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      (reg.razao_social || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.contact_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: B2BStatus) => {
    try {
      await registrationsApi.updateStatus(id, newStatus);
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === id ? { ...reg, status: newStatus, updated_at: new Date().toISOString() } : reg
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await registrationsApi.delete(id);
      setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  };

  const getStatusBadge = (status: B2BStatus | string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge className={cn('text-white', statusOption?.color)}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">
            Gerencie os cadastros B2B e acompanhe o funil de vendas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Table2 className="h-4 w-4 mr-2" />
            Tabela
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, contato ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <KanbanBoard
              registrations={filteredRegistrations}
              onStatusChange={handleStatusChange}
              onViewDetails={(reg) => {
                setSelectedRegistration(reg);
                setIsDetailsOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.razao_social || reg.contact_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{reg.contact_name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {reg.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {reg.whatsapp_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{reg.brand_of_interest}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reg.registration_type === 'vista' ? 'À Vista' : 'A Prazo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell>
                        {reg.cidade}, {reg.uf}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reg.created_at ? new Date(reg.created_at).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRegistration(reg);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmId(reg.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cadastro</DialogTitle>
            <DialogDescription>
              Informações completas do cadastro B2B
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Razão Social</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.razao_social || selectedRegistration.contact_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">CNPJ</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.cnpj}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Contato</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.contact_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">WhatsApp</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.whatsapp_phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Marca de Interesse</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.brand_of_interest}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Cidade/UF</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.cidade}, {selectedRegistration.uf}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Faixa de Faturamento</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.billing_range}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de Cadastro</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.registration_type === 'vista'
                      ? 'À Vista'
                      : 'A Prazo'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Cadastro</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.created_at
                      ? new Date(selectedRegistration.created_at).toLocaleString('pt-BR')
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium">Alterar Status</label>
                <Select
                  value={selectedRegistration.status}
                  onValueChange={(value: string) =>
                    handleStatusChange(
                      selectedRegistration.id,
                      value as B2BStatus
                    )
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este cadastro? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

