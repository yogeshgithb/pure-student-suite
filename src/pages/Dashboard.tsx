import React from 'react';
import { useStudentContext } from '@/context/StudentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { getStudentStats, state } = useStudentContext();
  const stats = getStudentStats();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    color?: string;
  }> = ({ title, value, icon, subtitle, color = "primary" }) => (
    <Card className="stats-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-light`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  const GradeChart: React.FC = () => {
    const total = stats.totalStudents || 1;
    const grades = [
      { grade: 'A', count: stats.gradeDistribution.A, color: 'success', percentage: (stats.gradeDistribution.A / total) * 100 },
      { grade: 'B', count: stats.gradeDistribution.B, color: 'secondary', percentage: (stats.gradeDistribution.B / total) * 100 },
      { grade: 'C', count: stats.gradeDistribution.C, color: 'warning', percentage: (stats.gradeDistribution.C / total) * 100 },
      { grade: 'F', count: stats.gradeDistribution.F, color: 'destructive', percentage: (stats.gradeDistribution.F / total) * 100 },
    ];

    return (
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Grade Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grades.map((grade) => (
              <div key={grade.grade} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Grade {grade.grade}</span>
                  <span className="text-sm text-muted-foreground">
                    {grade.count} ({Math.round(grade.percentage)}%)
                  </span>
                </div>
                <Progress 
                  value={grade.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const PerformanceChart: React.FC = () => {
    const averageGrade = stats.averageMarks >= 90 ? 'A' :
                        stats.averageMarks >= 75 ? 'B' :
                        stats.averageMarks >= 50 ? 'C' : 'F';
                        
    const performanceColor = stats.averageMarks >= 75 ? 'success' :
                            stats.averageMarks >= 50 ? 'warning' : 'destructive';

    return (
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Class Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {stats.averageMarks}%
              </div>
              <div className={`text-sm font-medium text-${performanceColor}`}>
                Average Grade: {averageGrade}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Performance</span>
                <span className="text-sm text-muted-foreground">
                  {stats.averageMarks}/100
                </span>
              </div>
              <Progress 
                value={stats.averageMarks} 
                className="h-3"
              />
            </div>

            {stats.highestScorer && (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-1">Top Performer</div>
                <div className="text-sm font-medium">
                  {stats.highestScorer.name} - {stats.highestScorer.marks}%
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (stats.totalStudents === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to StudySync</p>
        </div>

        <Card className="stats-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Students Yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first student to see dashboard statistics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your student management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="h-5 w-5 text-primary" />}
          subtitle="Active enrollments"
          color="primary"
        />
        
        <StatCard
          title="Average Marks"
          value={`${stats.averageMarks}%`}
          icon={<TrendingUp className="h-5 w-5 text-secondary" />}
          subtitle="Class performance"
          color="secondary"
        />
        
        {stats.highestScorer && (
          <StatCard
            title="Highest Scorer"
            value={`${stats.highestScorer.marks}%`}
            icon={<Award className="h-5 w-5 text-success" />}
            subtitle={stats.highestScorer.name}
            color="success"
          />
        )}
        
        {stats.lowestScorer && (
          <StatCard
            title="Needs Attention"
            value={`${stats.lowestScorer.marks}%`}
            icon={<AlertCircle className="h-5 w-5 text-warning" />}
            subtitle={stats.lowestScorer.name}
            color="warning"
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradeChart />
        <PerformanceChart />
      </div>

      {/* Recent Activity */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">
                {stats.gradeDistribution.A}
              </div>
              <div className="text-sm text-muted-foreground">A Grades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">
                {stats.gradeDistribution.B}
              </div>
              <div className="text-sm text-muted-foreground">B Grades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {stats.gradeDistribution.C}
              </div>
              <div className="text-sm text-muted-foreground">C Grades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">
                {stats.gradeDistribution.F}
              </div>
              <div className="text-sm text-muted-foreground">Failing</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};