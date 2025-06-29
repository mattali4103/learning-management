import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, BookOpen, Calendar } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PageHeader from "../../components/PageHeader";

interface ReportData {
  studentEnrollment: {
    labels: string[];
    data: number[];
  };
  coursePopularity: {
    labels: string[];
    data: number[];
  };
  gpaDistribution: {
    labels: string[];
    data: number[];
  };
  semesterStats: {
    totalStudents: number;
    totalCourses: number;
    averageGpa: number;
    completionRate: number;
  };
}

const ReportsAndStatistics = () => {
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedReport, setSelectedReport] = useState("enrollment");

  useEffect(() => {
    const loadReportData = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: ReportData = {
          studentEnrollment: {
            labels: ["Kỳ 1", "Kỳ 2", "Kỳ 3", "Kỳ 4", "Kỳ 5", "Kỳ 6"],
            data: [150, 142, 138, 145, 149, 152]
          },
          coursePopularity: {
            labels: ["CT101", "CT201", "CT301", "CT401", "CT501"],
            data: [120, 95, 78, 85, 67]
          },
          gpaDistribution: {
            labels: ["0-1.0", "1.0-2.0", "2.0-2.5", "2.5-3.0", "3.0-3.5", "3.5-4.0"],
            data: [5, 15, 25, 30, 20, 5]
          },
          semesterStats: {
            totalStudents: 1250,
            totalCourses: 456,
            averageGpa: 2.8,
            completionRate: 87.5
          }
        };
        setReportData(mockData);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [axiosPrivate]);

  const reportTypes = [
    { id: "enrollment", label: "Đăng ký học phần", icon: Users },
    { id: "popularity", label: "Học phần phổ biến", icon: BookOpen },
    { id: "gpa", label: "Phân bố điểm GPA", icon: TrendingUp },
    { id: "overview", label: "Tổng quan học kỳ", icon: Calendar }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải báo cáo...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title="Thống kê & Báo cáo Khoa"
        description="Phân tích dữ liệu học vụ và tình hình đào tạo của khoa"
        icon={BarChart3}
        iconColor="from-indigo-500 to-purple-600"
      />

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng sinh viên</p>
              <p className="text-3xl font-bold text-blue-600">{reportData.semesterStats.totalStudents.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng học phần</p>
              <p className="text-3xl font-bold text-green-600">{reportData.semesterStats.totalCourses}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">GPA trung bình</p>
              <p className="text-3xl font-bold text-purple-600">{reportData.semesterStats.averageGpa.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tỷ lệ hoàn thành</p>
              <p className="text-3xl font-bold text-orange-600">{reportData.semesterStats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex-1 flex items-center justify-center px-6 py-4 transition-colors ${
                  selectedReport === report.id
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span className="font-medium">{report.label}</span>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <div className="p-6">
          {selectedReport === "enrollment" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Báo cáo đăng ký học phần theo học kỳ</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reportData.studentEnrollment.labels.map((label, index) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.studentEnrollment.data[index]}</p>
                    <p className="text-xs text-gray-500">sinh viên</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === "popularity" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 học phần được đăng ký nhiều nhất</h3>
              <div className="space-y-3">
                {reportData.coursePopularity.labels.map((label, index) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{label}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${(reportData.coursePopularity.data[index] / Math.max(...reportData.coursePopularity.data)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">{reportData.coursePopularity.data[index]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === "gpa" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bố điểm GPA sinh viên</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reportData.gpaDistribution.labels.map((label, index) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-purple-600">{reportData.gpaDistribution.data[index]}%</p>
                    <p className="text-xs text-gray-500">sinh viên</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === "overview" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tổng quan học kỳ hiện tại</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Thông tin chung</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng số sinh viên:</span>
                        <span className="font-medium">{reportData.semesterStats.totalStudents.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng số học phần:</span>
                        <span className="font-medium">{reportData.semesterStats.totalCourses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GPA trung bình:</span>
                        <span className="font-medium">{reportData.semesterStats.averageGpa.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Hiệu suất</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
                        <span className="font-medium">{reportData.semesterStats.completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số học phần trung bình:</span>
                        <span className="font-medium">5.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tín chỉ trung bình:</span>
                        <span className="font-medium">18.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsAndStatistics;
