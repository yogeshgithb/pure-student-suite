import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentContext } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  UserCheck
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, getGrade } = useStudentContext();
  const { markAttendance, getAttendancePercentage, state: authState } = useAuth();
  
  const student = state.students.find(s => s.id === id);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'late'>('present');

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Student Not Found</h1>
          <p className="text-muted-foreground">The student you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate('/students')}>
            Back to Student List
          </Button>
        </div>
      </div>
    );
  }

  const grade = getGrade(student.marks);
  const attendancePercentage = getAttendancePercentage(student.id);
  const studentAttendance = authState.attendanceRecords.filter(record => record.studentId === student.id);
  
  const handleMarkAttendance = () => {
    markAttendance(student.id, attendanceStatus);
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'F': return 'grade-f';
      default: return '';
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'absent': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return null;
    }
  };

  const getPerformanceColor = (marks: number) => {
    if (marks >= 90) return 'text-success';
    if (marks >= 75) return 'text-secondary';
    if (marks >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/students')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
            <p className="text-muted-foreground">Student Profile & Details</p>
          </div>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Student Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-light rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="text-lg font-semibold">{student.rollNo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary-light rounded-lg">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="text-lg font-semibold">{student.course}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-light rounded-lg">
                <Award className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Grade</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-lg font-semibold ${getPerformanceColor(student.marks)}`}>
                    {student.marks}%
                  </p>
                  <Badge className={getGradeBadgeColor(grade)}>
                    {grade}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-light rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-lg font-semibold">{attendancePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{student.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-medium">{student.course}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{student.dateOfBirth || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{student.bloodGroup || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Performance</span>
                    <span className="text-sm text-muted-foreground">{student.marks}%</span>
                  </div>
                  <Progress value={student.marks} className="h-3" />
                  <div className="flex justify-between items-center mt-2">
                    <Badge className={getGradeBadgeColor(grade)}>
                      Grade {grade}
                    </Badge>
                    <span className={`text-sm font-medium ${getPerformanceColor(student.marks)}`}>
                      {student.marks >= 90 ? 'Excellent' : 
                       student.marks >= 75 ? 'Good' : 
                       student.marks >= 50 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-sm text-muted-foreground">{attendancePercentage}%</span>
                  </div>
                  <Progress value={attendancePercentage} className="h-3" />
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Enrolled on: {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 stats-card">
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {studentAttendance.length > 0 ? (
                    studentAttendance
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getAttendanceIcon(record.status)}
                            <div>
                              <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                              {record.remarks && (
                                <p className="text-xs text-muted-foreground">{record.remarks}</p>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={record.status === 'present' ? 'default' : 'secondary'}
                            className={
                              record.status === 'present' ? 'bg-success text-success-foreground' :
                              record.status === 'late' ? 'bg-warning text-warning-foreground' :
                              'bg-destructive text-destructive-foreground'
                            }
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No attendance records found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={attendanceStatus} onValueChange={(value: any) => setAttendanceStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleMarkAttendance}
                  className="w-full btn-gradient-primary"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Days:</span>
                    <span>{studentAttendance.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Present:</span>
                    <span className="text-success">
                      {studentAttendance.filter(r => r.status === 'present').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Absent:</span>
                    <span className="text-destructive">
                      {studentAttendance.filter(r => r.status === 'absent').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Late:</span>
                    <span className="text-warning">
                      {studentAttendance.filter(r => r.status === 'late').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="stats-card">
            <CardHeader>
              <CardTitle>Academic Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{student.marks}%</div>
                  <div className="text-sm text-muted-foreground">Current Score</div>
                  <Badge className={getGradeBadgeColor(grade)} variant="outline">
                    Grade {grade}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">{attendancePercentage}%</div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                  <Badge variant="outline" className={attendancePercentage >= 75 ? 'border-success text-success' : 'border-warning text-warning'}>
                    {attendancePercentage >= 75 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">
                    {state.students.filter(s => s.marks < student.marks && s.course === student.course).length + 1}
                  </div>
                  <div className="text-sm text-muted-foreground">Class Rank</div>
                  <Badge variant="outline" className="border-success text-success">
                    Top {Math.round((state.students.filter(s => s.marks < student.marks && s.course === student.course).length + 1) / state.students.filter(s => s.course === student.course).length * 100)}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Performance Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Academic Status</h5>
                    <p className="text-sm text-muted-foreground">
                      {student.marks >= 90 ? 'Outstanding performance! Keep up the excellent work.' :
                       student.marks >= 75 ? 'Good performance. Aim for even higher scores.' :
                       student.marks >= 50 ? 'Average performance. Focus on improvement areas.' :
                       'Performance needs significant improvement. Consider additional support.'}
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Attendance Status</h5>
                    <p className="text-sm text-muted-foreground">
                      {attendancePercentage >= 90 ? 'Excellent attendance record.' :
                       attendancePercentage >= 75 ? 'Good attendance. Maintain consistency.' :
                       attendancePercentage >= 60 ? 'Attendance needs improvement.' :
                       'Poor attendance. Immediate attention required.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{student.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">General Contact</p>
                  <p className="font-medium">{student.contactInfo}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guardian Name</p>
                    <p className="font-medium">{student.guardianName || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guardian Contact</p>
                    <p className="font-medium">{student.guardianContact || 'Not provided'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Date</p>
                      <p className="font-medium">{student.admissionDate || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};