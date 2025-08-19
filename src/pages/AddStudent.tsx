import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentContext } from '@/context/StudentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  rollNo: string;
  course: string;
  marks: string;
  contactInfo: string;
}

interface FormErrors {
  name?: string;
  rollNo?: string;
  course?: string;
  marks?: string;
  contactInfo?: string;
}

const courses = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
];

export const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const { addStudent, isRollNoUnique } = useStudentContext();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    rollNo: '',
    course: '',
    marks: '',
    contactInfo: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Roll number validation
    if (!formData.rollNo.trim()) {
      newErrors.rollNo = 'Roll number is required';
    } else if (!isRollNoUnique(formData.rollNo.trim())) {
      newErrors.rollNo = 'Roll number already exists';
    }

    // Course validation
    if (!formData.course) {
      newErrors.course = 'Course is required';
    }

    // Marks validation
    if (!formData.marks.trim()) {
      newErrors.marks = 'Marks are required';
    } else {
      const marks = parseFloat(formData.marks);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        newErrors.marks = 'Marks must be between 0 and 100';
      }
    }

    // Contact info validation
    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = addStudent({
        name: formData.name.trim(),
        rollNo: formData.rollNo.trim(),
        course: formData.course,
        marks: parseFloat(formData.marks),
        contactInfo: formData.contactInfo.trim(),
      });

      if (success) {
        // Reset form
        setFormData({
          name: '',
          rollNo: '',
          course: '',
          marks: '',
          contactInfo: '',
        });
        
        // Navigate to student list
        navigate('/students');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Student</h1>
          <p className="text-muted-foreground">
            Enter student information to add them to the system
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl mx-auto stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Student Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter student's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`form-input ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Roll Number */}
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="text-sm font-medium">
                  Roll Number *
                </Label>
                <Input
                  id="rollNo"
                  type="text"
                  placeholder="Enter unique roll number"
                  value={formData.rollNo}
                  onChange={(e) => handleInputChange('rollNo', e.target.value)}
                  className={`form-input ${errors.rollNo ? 'border-destructive' : ''}`}
                />
                {errors.rollNo && (
                  <p className="text-sm text-destructive">{errors.rollNo}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course */}
              <div className="space-y-2">
                <Label htmlFor="course" className="text-sm font-medium">
                  Course *
                </Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleInputChange('course', value)}
                >
                  <SelectTrigger className={`${errors.course ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.course && (
                  <p className="text-sm text-destructive">{errors.course}</p>
                )}
              </div>

              {/* Marks */}
              <div className="space-y-2">
                <Label htmlFor="marks" className="text-sm font-medium">
                  Marks (0-100) *
                </Label>
                <Input
                  id="marks"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Enter marks"
                  value={formData.marks}
                  onChange={(e) => handleInputChange('marks', e.target.value)}
                  className={`form-input ${errors.marks ? 'border-destructive' : ''}`}
                />
                {errors.marks && (
                  <p className="text-sm text-destructive">{errors.marks}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="contactInfo" className="text-sm font-medium">
                Contact Information *
              </Label>
              <Textarea
                id="contactInfo"
                placeholder="Enter email, phone number, or address"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                className={`form-input min-h-[100px] ${errors.contactInfo ? 'border-destructive' : ''}`}
              />
              {errors.contactInfo && (
                <p className="text-sm text-destructive">{errors.contactInfo}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};