import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileCheck, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi, registrationsApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  action: string;
  company: string;
  time: string;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return 'Ha ' + diffMins + ' min';
  if (diffHours < 24) return 'Ha ' + diffHours + 'h';
  return 'Ha ' + diffDays + 'd';
};

const getActionText = (status: string): string => {
  switch (status) {
    case 'Lead Site':
    case 'Lead Site - A Vista':
    case 'Lead Site - A Prazo':
      return 'Novo cadastro B2B';
    case 'Aguardando Analise':
      return 'Aguardando analise';
    case 'Cadastro Recebido':
      return 'Cadastro recebido';
    case 'Avaliacao Cadastro':
      return 'Em avaliacao';
    case 'Cadastro Pendente':
      return 'Pendente';
    case 'Cadastro Realizado':
      return 'Cadastro aprovado';
    case 'Onboarding Realizado':
      return 'Onboarding concluido';
    default:
      return status;
  }
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

function StatsCard({ title, value, description, icon, className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={cn('overflow-hidden h-full', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, registrations] = await Promise.all([
          dashboardApi.getStats(),
          registrationsApi.getAll(),
        ]);

        setStats(statsData);

        const recentActivities = registrations.slice(0, 5).map(reg => ({
          id: reg.id,
          action: getActionText(reg.status),
          company: reg.razao_social,
          time: formatTimeAgo(new Date(reg.updated_at || reg.created_at)),
        }));
        setActivities(recentActivities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {user?.full_name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Aqui esta um resumo das suas atividades e cadastros recentes.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <StatsCard
          title="Total de Cadastros"
          value={stats.total}
          description="Todos os cadastros B2B no sistema"
          icon={<Users className="h-4 w-4 text-primary" />}
          
        />
        <StatsCard
          title="Pendentes"
          value={stats.pending}
          description="Aguardando analise"
          icon={<Clock className="h-4 w-4 text-yellow-600" />}
        />
        <StatsCard
          title="Concluidos"
          value={stats.completed}
          description="Cadastros aprovados"
          icon={<FileCheck className="h-4 w-4 text-green-600" />}
          
        />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma atividade recente
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.company}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <motion.a
              href="/cadastro-b2b"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <Users className="h-5 w-5 mb-2 text-primary" />
              <p className="font-medium text-sm">Novo Cadastro B2B</p>
              <p className="text-xs text-muted-foreground">
                Registrar novo cliente
              </p>
            </motion.a>
            <motion.a
              href="/crm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <FileCheck className="h-5 w-5 mb-2 text-primary" />
              <p className="font-medium text-sm">Ver CRM</p>
              <p className="text-xs text-muted-foreground">
                Gerenciar cadastros
              </p>
            </motion.a>
            {user?.role === 'admin' && (
              <motion.a
                href="/users"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <Users className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium text-sm">Gerenciar Usuarios</p>
                <p className="text-xs text-muted-foreground">
                  Adicionar ou editar usuarios
                </p>
              </motion.a>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
