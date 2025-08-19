import React, { useState, useEffect } from 'react';
import { useStudentContext } from '@/context/StudentContext';
import { Student, FilterOptions } from '@/types/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus, 
  ArrowUpDown,
  MoreHorizontal 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const StudentList: React.FC = () => {
  const { 
    state, 
    deleteStudent, 
    updateStudent, 
    filterStudents, 
    getGrade,
    isRollNoUnique 
  } = useStudentContext();
  
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    courseFilter: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get unique courses for filter dropdown
  const uniqueCourses = Array.from(new Set(state.students.map(s => s.course)));

  useEffect(() => {
    filterStudents(filters);
  }, [filters, state.students, filterStudents]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const handleCourseFilter = (courseFilter: string) => {
    setFilters(prev => ({ ...prev, courseFilter }));
  };

  const handleSort = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDelete = (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      deleteStudent(student.id);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({ ...student });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingStudent || !editFormData.name || !editFormData.rollNo || 
        !editFormData.course || editFormData.marks === undefined || 
        !editFormData.contactInfo) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check marks range
    if (editFormData.marks < 0 || editFormData.marks > 100) {
      toast({
        title: "Validation Error",
        description: "Marks must be between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    // Check roll number uniqueness (excluding current student)
    if (!isRollNoUnique(editFormData.rollNo, editingStudent.id)) {
      toast({
        title: "Validation Error",
        description: "Roll number already exists.",
        variant: "destructive",
      });
      return;
    }

    updateStudent(editFormData as Student);
    setIsEditDialogOpen(false);
    setEditingStudent(null);
    setEditFormData({});
  };

  const getGradeBadgeColor = (marks: number) => {
    const grade = getGrade(marks);
    switch (grade) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'F': return 'grade-f';
      default: return '';
    }
  };

  if (state.students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student List</h1>
          <p className="text-muted-foreground">Manage all your students</p>
        </div>

        <Card className="stats-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Students Added Yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first student to begin managing your class.
            </p>
            <Button className="btn-gradient-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Student
            </Button>
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
          <h1 className="text-3xl font-bold text-foreground">Student List</h1>
          <p className="text-muted-foreground">
            Manage all your students ({state.filteredStudents.length} of {state.students.length})
          </p>
        </div>
        <Button className="btn-gradient-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, roll no, or course..."
                value={filters.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Course Filter */}
            <Select value={filters.courseFilter} onValueChange={handleCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={filters.sortBy} onValueChange={(value) => handleSort(value as FilterOptions['sortBy'])}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rollNo">Roll Number</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="marks">Marks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student Table */}
      <Card className="stats-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('rollNo')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Roll No</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('course')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Course</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('marks')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Marks</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.rollNo}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.marks}%</TableCell>
                    <TableCell>
                      <Badge className={getGradeBadgeColor(student.marks)}>
                        {getGrade(student.marks)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {student.contactInfo}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-rollNo">Roll Number</Label>
              <Input
                id="edit-rollNo"
                value={editFormData.rollNo || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, rollNo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-course">Course</Label>
              <Input
                id="edit-course"
                value={editFormData.course || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, course: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-marks">Marks</Label>
              <Input
                id="edit-marks"
                type="number"
                min="0"
                max="100"
                value={editFormData.marks || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, marks: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-contact">Contact Info</Label>
              <Textarea
                id="edit-contact"
                value={editFormData.contactInfo || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};