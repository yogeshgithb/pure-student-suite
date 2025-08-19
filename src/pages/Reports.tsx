import React, { useState } from 'react';
import { useStudentContext } from '@/context/StudentContext';
import { Student } from '@/types/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  Award,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { state, getStudentStats, getGrade, exportToCSV } = useStudentContext();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  const stats = getStudentStats();

  const generateReportCard = (student: Student) => {
    const grade = getGrade(student.marks);
    const rank = state.students
      .sort((a, b) => b.marks - a.marks)
      .findIndex(s => s.id === student.id) + 1;

    return {
      student,
      grade,
      rank,
      totalStudents: state.students.length,
      performance: student.marks >= stats.averageMarks ? 'Above Average' : 'Below Average',
      status: student.marks >= 50 ? 'Pass' : 'Fail',
    };
  };

  const selectedStudentData = selectedStudent 
    ? state.students.find(s => s.id === selectedStudent)
    : null;

  const reportCard = selectedStudentData ? generateReportCard(selectedStudentData) : null;

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'F': return 'grade-f';
      default: return '';
    }
  };

  const getPerformanceColor = (performance: string) => {
    return performance === 'Above Average' ? 'text-success' : 'text-warning';
  };

  const getStatusColor = (status: string) => {
    return status === 'Pass' ? 'text-success' : 'text-destructive';
  };

  if (state.students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate detailed academic reports</p>
        </div>

        <Card className="stats-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Data Available
            </h3>
            <p className="text-muted-foreground text-center">
              Add students to generate reports and analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Academic reports and performance analytics
          </p>
        </div>
        <Button 
          onClick={exportToCSV}
          className="btn-gradient-primary"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Class Average
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMarks}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((stats.gradeDistribution.A + stats.gradeDistribution.B + stats.gradeDistribution.C) / stats.totalStudents) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Students passing</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gradeDistribution.F}</div>
            <p className="text-xs text-muted-foreground">Students failing</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Grade Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { grade: 'A', count: stats.gradeDistribution.A, percentage: (stats.gradeDistribution.A / stats.totalStudents) * 100, color: 'success' },
                { grade: 'B', count: stats.gradeDistribution.B, percentage: (stats.gradeDistribution.B / stats.totalStudents) * 100, color: 'secondary' },
                { grade: 'C', count: stats.gradeDistribution.C, percentage: (stats.gradeDistribution.C / stats.totalStudents) * 100, color: 'warning' },
                { grade: 'F', count: stats.gradeDistribution.F, percentage: (stats.gradeDistribution.F / stats.totalStudents) * 100, color: 'destructive' },
              ].map((item) => (
                <div key={item.grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getGradeBadgeColor(item.grade)}>
                      {item.grade}
                    </Badge>
                    <span className="text-sm font-medium">{item.count} students</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.students
                .sort((a, b) => b.marks - a.marks)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.rollNo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{student.marks}%</div>
                      <Badge className={getGradeBadgeColor(getGrade(student.marks))}>
                        {getGrade(student.marks)}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Report Card */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Individual Report Card</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {state.students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.rollNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportCard && (
              <div className="mt-6 p-6 border rounded-lg bg-muted/20">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground">Student Report Card</h3>
                  <p className="text-muted-foreground">Academic Performance Summary</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Student Information</h4>
                    <div className="space-y-2">
                      <div><strong>Name:</strong> {reportCard.student.name}</div>
                      <div><strong>Roll Number:</strong> {reportCard.student.rollNo}</div>
                      <div><strong>Course:</strong> {reportCard.student.course}</div>
                      <div><strong>Contact:</strong> {reportCard.student.contactInfo}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Academic Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span><strong>Marks:</strong></span>
                        <span>{reportCard.student.marks}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>Grade:</strong></span>
                        <Badge className={getGradeBadgeColor(reportCard.grade)}>
                          {reportCard.grade}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>Rank:</strong></span>
                        <span>{reportCard.rank} of {reportCard.totalStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>Performance:</strong></span>
                        <span className={getPerformanceColor(reportCard.performance)}>
                          {reportCard.performance}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>Status:</strong></span>
                        <span className={getStatusColor(reportCard.status)}>
                          {reportCard.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
                  Generated on {new Date().toLocaleDateString()} | StudySync Academic System
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};