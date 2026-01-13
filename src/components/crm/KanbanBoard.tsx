import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Eye, Trash2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { B2BRegistration, B2BStatus } from '@/types';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  registrations: B2BRegistration[];
  onStatusChange: (id: string, newStatus: B2BStatus) => void;
  onViewDetails: (registration: B2BRegistration) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: { id: B2BStatus; title: string; color: string }[] = [
  { id: 'Lead Site', title: 'Lead Site', color: 'bg-purple-500' },
  { id: 'Lead Site - À Vista', title: 'À Vista', color: 'bg-blue-500' },
  { id: 'Lead Site - A Prazo', title: 'A Prazo', color: 'bg-indigo-500' },
  { id: 'Aguardando Análise', title: 'Aguardando', color: 'bg-yellow-500' },
  { id: 'Cadastro Recebido', title: 'Recebido', color: 'bg-cyan-500' },
  { id: 'Avaliação Cadastro', title: 'Avaliação', color: 'bg-orange-500' },
  { id: 'Cadastro Pendente', title: 'Pendente', color: 'bg-red-500' },
  { id: 'Cadastro Realizado', title: 'Realizado', color: 'bg-green-500' },
  { id: 'Onboarding Realizado', title: 'Onboarding', color: 'bg-emerald-500' },
];

export function KanbanBoard({
  registrations,
  onStatusChange,
  onViewDetails,
  onDelete,
}: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId as B2BStatus;
    onStatusChange(draggableId, newStatus);
  };

  const getColumnRegistrations = (status: B2BStatus) => {
    return registrations.filter((reg) => reg.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {COLUMNS.map((column) => {
          const columnRegistrations = getColumnRegistrations(column.id);
          return (
            <div key={column.id} className="flex-shrink-0 w-72">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', column.color)} />
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary">{columnRegistrations.length}</Badge>
                  </div>
                </CardHeader>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'space-y-3 min-h-[500px] transition-colors',
                        snapshot.isDraggingOver && 'bg-accent/50'
                      )}
                    >
                      {columnRegistrations.map((registration, index) => (
                        <Draggable
                          key={registration.id}
                          draggableId={registration.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                'p-3 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all',
                                snapshot.isDragging && 'shadow-lg ring-2 ring-primary'
                              )}
                            >
                              <div className="space-y-2">
                                <div>
                                  <h3 className="font-semibold text-sm line-clamp-1">
                                    {registration.razao_social || registration.contact_name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {registration.contact_name}
                                  </p>
                                </div>

                                <Badge variant="outline" className="text-xs">
                                  {registration.brand_of_interest}
                                </Badge>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{registration.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span>{registration.whatsapp_phone}</span>
                                  </div>
                                  {registration.cidade && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span>{registration.cidade}, {registration.uf}</span>
                                    </div>
                                  )}
                                  {registration.created_at && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(registration.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-2 border-t">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={() => onViewDetails(registration)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Ver
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-destructive hover:text-destructive"
                                    onClick={() => onDelete(registration.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnRegistrations.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                          Nenhum cadastro
                        </div>
                      )}
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

