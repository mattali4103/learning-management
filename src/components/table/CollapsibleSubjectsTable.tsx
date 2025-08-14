import React, { useState, useMemo, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import type { HocPhan } from "../../types/HocPhan";
import type { KeHoachHocTapDetail } from "../../types/KeHoachHocTapMau";
import type { HocPhanTuChon } from "../../types/HocPhanTuChon";

// Types
interface SubjectGroup {
  id: string;
  title: string;
  subtitle: string;
  courses: HocPhan[];
  totalCredits: number;
  colorScheme: string;
}

interface SubjectRow extends HocPhan {
  isGroupHeader: boolean;
  groupId: string;
  groupTitle?: string;
  groupSubtitle?: string;
  colorScheme?: string;
}

// Props interface
interface CollapsibleSubjectsTableProps {
  // Required data
  hocPhans: HocPhan[];
  onAddToPending: (hocPhan: HocPhan) => void;
  
  // Current/pending courses (can be different types)
  pendingHocPhans: HocPhan[] | KeHoachHocTapDetail[];
  currentHocPhans: HocPhan[] | KeHoachHocTapDetail[];
  
  // Optional special groups for ThemKHHTModal
  hocPhanGoiY?: HocPhan[];
  hocPhanCaiThien?: HocPhan[];
  hocPhanTheChat?: HocPhan[]; // Danh sách học phần thể chất từ API
  nhomHocPhanTuChon?: HocPhanTuChon[]; // Nhóm học phần tự chọn từ CTDT
  
  // Configuration
  enableImprovementCourses?: boolean; // Enable special logic for improvement courses
  
  // Danh sách học phần đã học (để kiểm tra điều kiện tiên quyết)
  hocPhanDaHoc?: string[]; // Mảng chứa mã học phần đã hoàn thành
}

// Helper function to extract maHp from different data types
const extractMaHp = (item: HocPhan | KeHoachHocTapDetail): string => {
  if ('hocPhan' in item) {
    return item.hocPhan?.maHp || '';
  }
  return item.maHp || '';
};

// Helper function to check if course name has ID pattern (e.g., "Course Name - CN1")
const checkCourseIdPattern = (tenHp: string): { hasPattern: boolean; baseName: string; id: string } => {
  const lastDashIndex = tenHp.lastIndexOf(' - ');
  if (lastDashIndex <= 0) {
    return { hasPattern: false, baseName: tenHp, id: '' };
  }
  
  const baseName = tenHp.substring(0, lastDashIndex).trim();
  const suffix = tenHp.substring(lastDashIndex + 3).trim();
  
  // Check if suffix is like CN1, TC2, CS3 (letters + numbers) without regex
  const isValidId = suffix.length >= 2 && 
                   hasLettersAndNumbers(suffix);
  
  return {
    hasPattern: isValidId,
    baseName: baseName,
    id: suffix
  };
};

// Helper function to check if string contains letters followed by numbers
const hasLettersAndNumbers = (str: string): boolean => {
  if (str.length < 2) return false;
  
  let hasLetter = false;
  let hasNumber = false;
  let letterPhase = true; // Bắt đầu với phase chữ cái
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const isLetter = (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z');
    const isNumber = char >= '0' && char <= '9';
    
    if (letterPhase) {
      if (isLetter) {
        hasLetter = true;
      } else if (isNumber) {
        letterPhase = false; // Chuyển sang phase số
        hasNumber = true;
      } else {
        return false; // Ký tự không hợp lệ
      }
    } else {
      // Đang trong phase số
      if (isNumber) {
        hasNumber = true;
      } else {
        return false; // Sau số không được có ký tự khác
      }
    }
  }
  
  return hasLetter && hasNumber;
};

// Helper: Color Schemes
const getColorClasses = (colorScheme: string) => {
  const schemes = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      badge: "bg-blue-100 text-blue-800",
      hover: "hover:bg-blue-100",
      border: "border-l-blue-500",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      badge: "bg-emerald-100 text-emerald-800",
      hover: "hover:bg-emerald-100",
      border: "border-l-emerald-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-800",
      badge: "bg-purple-100 text-purple-800",
      hover: "hover:bg-purple-100",
      border: "border-l-purple-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      badge: "bg-orange-100 text-orange-800",
      hover: "hover:bg-orange-100",
      border: "border-l-orange-500",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-800",
      badge: "bg-red-100 text-red-800",
      hover: "hover:bg-red-100",
      border: "border-l-red-500",
    },
  };
  return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
};

const CollapsibleSubjectsTable: React.FC<CollapsibleSubjectsTableProps> = ({
  hocPhans,
  onAddToPending,
  pendingHocPhans,
  currentHocPhans,
  hocPhanGoiY = [],
  hocPhanCaiThien = [],
  hocPhanTheChat = [],
  nhomHocPhanTuChon = [],
  enableImprovementCourses = false,
  hocPhanDaHoc = [],
}) => {
  // Hàm kiểm tra điều kiện tiên quyết
  const checkPrerequisites = useCallback((hocPhan: HocPhan): { canAdd: boolean; missingPrerequisites: string[] } => {
    if (!hocPhan.hocPhanTienQuyet || hocPhan.hocPhanTienQuyet.trim() === "") {
      return { canAdd: true, missingPrerequisites: [] };
    }

    // Phân tích các điều kiện tiên quyết (giả sử chúng được phân tách bằng dấu phẩy)
    const prerequisites = hocPhan.hocPhanTienQuyet
      .split(',')
      .map(code => code.trim())
      .filter(code => code !== "");

    const missingPrerequisites = prerequisites.filter(prereq => 
      !hocPhanDaHoc.includes(prereq)
    );

    return {
      canAdd: missingPrerequisites.length === 0,
      missingPrerequisites
    };
  }, [hocPhanDaHoc]);

  // Helper function để kiểm tra xem học phần có thuộc nhóm tự chọn đã hoàn thành không
  const isFromCompletedElectiveGroup = useCallback((hocPhan: HocPhan): boolean => {
    // Kiểm tra các nhóm học phần tự chọn
    for (const nhom of nhomHocPhanTuChon) {
      const nhomCourses = nhom.hocPhanTuChonList || [];
      
      // Kiểm tra nếu học phần thuộc nhóm này
      const belongsToGroup = nhomCourses.some(course => course.maHp === hocPhan.maHp);
      if (!belongsToGroup) continue;
      
      // Helper function để nhóm các học phần theo đánh số
      const groupCoursesByNumber = (courses: HocPhan[]) => {
        const numberedGroups: { [key: string]: HocPhan[] } = {};
        const singleCourses: HocPhan[] = [];
        
        courses.forEach(course => {
          const tenHp = course.tenHp || '';
          const pattern = checkCourseIdPattern(tenHp);
          
          if (pattern.hasPattern) {
            if (!numberedGroups[pattern.baseName]) {
              numberedGroups[pattern.baseName] = [];
            }
            numberedGroups[pattern.baseName].push(course);
          } else {
            singleCourses.push(course);
          }
        });
        
        return { numberedGroups, singleCourses };
      };
      
      const { numberedGroups, singleCourses } = groupCoursesByNumber(nhomCourses);
      
      // Tính tổng tín chỉ đã hoàn thành của nhóm
      let completedCredits = 0;
      const requiredCredits = nhom.tinChiYeuCau || 0;
      
      // Đối với single courses
      singleCourses.forEach(course => {
        if (hocPhanDaHoc.includes(course.maHp || '')) {
          completedCredits += course.tinChi || 0;
        }
      });
      
      // Đối với numbered groups
      Object.values(numberedGroups).forEach(groupCourses => {
        const hasCompletedOne = groupCourses.some(course => 
          hocPhanDaHoc.includes(course.maHp || '')
        );
        if (hasCompletedOne) {
          const completedCourse = groupCourses.find(course => 
            hocPhanDaHoc.includes(course.maHp || '')
          ) || groupCourses[0];
          completedCredits += completedCourse.tinChi || 0;
        }
      });
      
      // Nếu nhóm đã hoàn thành, return true
      if (completedCredits >= requiredCredits) {
        return true;
      }
    }
    
    return false;
  }, [nhomHocPhanTuChon, hocPhanDaHoc]);

  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const subjectGroups = useMemo((): SubjectGroup[] => {
    // Extract maHp from current and pending courses
    const currentMaHps = new Set(currentHocPhans.map(extractMaHp));
    const pendingMaHps = new Set(pendingHocPhans.map(extractMaHp));

    // Helper function to filter courses (cập nhật để loại bỏ học phần từ nhóm đã hoàn thành)
    const filterCourses = (courseList: HocPhan[]) => 
      courseList.filter(hp => 
        !currentMaHps.has(hp.maHp || '') && 
        !isFromCompletedElectiveGroup(hp)
      );

    const newGroups: SubjectGroup[] = [];

    // Special groups for ThemKHHTModal
    if (enableImprovementCourses) {
      // Group 1: Suggested Courses
      const suggestedSubjects = filterCourses(hocPhanGoiY);
      if (suggestedSubjects.length > 0) {
        const totalCredits = suggestedSubjects.reduce((sum, course) => sum + (course.tinChi || 0), 0);
        newGroups.push({
          id: "group-suggested",
          title: "Học phần gợi ý",
          subtitle: `${suggestedSubjects.length} học phần • ${totalCredits} tín chỉ`,
          courses: suggestedSubjects,
          totalCredits,
          colorScheme: "green",
        });
      }

      // Group 3: Physical Education Courses (từ API) với logic ưu tiên
      if (hocPhanTheChat.length > 0) {
        // Kiểm tra số tín chỉ thể chất đã hoàn thành
        const completedPhysicalEd = hocPhanTheChat.filter(course => 
          hocPhanDaHoc.includes(course.maHp || '')
        );
        const completedCredits = completedPhysicalEd.reduce((sum, course) => sum + (course.tinChi || 0), 0);
        
        // Kiểm tra trạng thái hoàn thành
        const isCompleted = completedCredits >= 3;
        const isInProgress = completedCredits > 0 && completedCredits < 3;
        
        let availablePhysicalEd = hocPhanTheChat.filter(course => 
          !hocPhanDaHoc.includes(course.maHp || '')
        );
        
        // Nếu đang trong quá trình hoàn thành, ưu tiên gợi ý học phần liên quan
        // Nếu đang trong quá trình hoàn thành, ưu tiên gợi ý học phần liên quan
        const prioritizedCourses: HocPhan[] = [];
        const otherCourses: HocPhan[] = [];
        
        if (isInProgress && completedPhysicalEd.length > 0) {
          // Lấy tên học phần đã hoàn thành để tìm series liên quan
          const completedNames = completedPhysicalEd.map(course => 
            course.tenHp?.toLowerCase().replace(/\s+/g, ' ').trim() || ''
          );
          
          // Tìm học phần cùng series (ví dụ: "điền kinh 1" -> ưu tiên "điền kinh 2", "điền kinh 3")
          
          availablePhysicalEd.forEach(course => {
            const courseName = course.tenHp?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
            
            // Kiểm tra xem có cùng series không (loại bỏ số ở cuối và so sánh)
            const isRelated = completedNames.some(completedName => {
              // Loại bỏ số ở cuối để so sánh tên cơ bản
              const completedBaseName = completedName.replace(/\s*\d+\s*$/, '').trim();
              const courseBaseName = courseName.replace(/\s*\d+\s*$/, '').trim();
              
              return completedBaseName.length > 0 && 
                     courseBaseName.length > 0 && 
                     completedBaseName === courseBaseName;
            });
            
            if (isRelated) {
              prioritizedCourses.push(course);
            } else {
              otherCourses.push(course);
            }
          });
          
          // Sắp xếp: học phần cùng series trước, sau đó các học phần khác
          availablePhysicalEd = [...prioritizedCourses, ...otherCourses];
        } else {
          // Nếu không có học phần đã hoàn thành hoặc chưa bắt đầu, giữ nguyên danh sách
          availablePhysicalEd = availablePhysicalEd.filter(course => 
            !hocPhanDaHoc.includes(course.maHp || '')
          );
        }
        
        const totalCredits = availablePhysicalEd.reduce((sum, course) => sum + (course.tinChi || 0), 0);
        
        // Tạo subtitle phản ánh trạng thái
        let subtitle = "";
        if (isCompleted) {
          subtitle = `Đã hoàn thành (${completedCredits}/3 tín chỉ) • ${availablePhysicalEd.length} học phần khác`;
        } else if (isInProgress) {
          // Hiển thị tên các học phần được ưu tiên để hoàn thành
          const prioritizedNames = prioritizedCourses.slice(0, 3).map(course => course.tenHp).join(', ');
          const remainingCount = Math.max(0, 3 - completedCredits);
          
          if (prioritizedNames) {
            subtitle = `Đang hoàn thành (${completedCredits}/3 tín chỉ) • Gợi ý: ${prioritizedNames}${prioritizedCourses.length > 3 ? '...' : ''} • Cần ${remainingCount} tín chỉ nữa`;
          } else {
            subtitle = `Đang hoàn thành (${completedCredits}/3 tín chỉ) • ${availablePhysicalEd.length} học phần còn lại • Cần ${remainingCount} tín chỉ nữa`;
          }
        } else {
          subtitle = `${availablePhysicalEd.length} học phần • ${totalCredits} tín chỉ (Cần 3 tín chỉ)`;
        }
        
        newGroups.push({
          id: "group-the-chat",
          title: "Nhóm học phần thể chất",
          subtitle: subtitle,
          courses: availablePhysicalEd,
          totalCredits,
          colorScheme: isCompleted ? "green" : isInProgress ? "orange" : "purple",
        });
      }
    }

    // Regular courses grouped by loaiHp
    const availableSubjects = enableImprovementCourses 
      ? filterCourses(hocPhans)
      : hocPhans.filter(hp => !currentMaHps.has(hp.maHp || '') && !pendingMaHps.has(hp.maHp || ''));

    const groupedByLoaiHp = availableSubjects.reduce(
      (acc, course) => {
        const type = course.loaiHp || "Khác";
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(course);
        return acc;
      },
      {} as Record<string, HocPhan[]>
    );

    // Định nghĩa thứ tự ưu tiên cho các loại học phần
    const groupOrder = [
      "Quốc phòng",
      "Anh văn căn bản", 
      "Thể chất",
      "Đại cương",
      "Cơ sở ngành",
      "Chuyên ngành",
      "Luận văn",
      "Thay thế luận văn",
      "Khác"
    ];

    // Tạo groups theo thứ tự đã định nghĩa
    const orderedRegularGroups: SubjectGroup[] = [];
    
    groupOrder.forEach(orderType => {
      // Tìm các loại học phần phù hợp với orderType
      Object.entries(groupedByLoaiHp).forEach(([loaiHp, courses]) => {
        let shouldInclude = false;
        
        if (orderType === "Quốc phòng" && loaiHp.toLowerCase().includes("quốc phòng")) {
          shouldInclude = true;
        } else if (orderType === "Anh văn căn bản" && loaiHp.toLowerCase().includes("anh văn")) {
          shouldInclude = true;
        } else if (orderType === "Thể chất" && loaiHp.toLowerCase().includes("thể chất")) {
          shouldInclude = true;
        } else if (orderType === "Đại cương" && loaiHp.toLowerCase().includes("đại cương") && !loaiHp.toLowerCase().includes("tự chọn")) {
          shouldInclude = true;
        } else if (orderType === "Cơ sở ngành" && loaiHp.toLowerCase().includes("cơ sở ngành") && !loaiHp.toLowerCase().includes("tự chọn")) {
          shouldInclude = true;
        } else if (orderType === "Chuyên ngành" && loaiHp.toLowerCase().includes("chuyên ngành") && !loaiHp.toLowerCase().includes("tự chọn")) {
          shouldInclude = true;
        } else if (orderType === "Luận văn" && (loaiHp.toLowerCase().includes("luận văn") || loaiHp.toLowerCase().includes("khóa luận")) && !loaiHp.toLowerCase().includes("thay thế")) {
          shouldInclude = true;
        } else if (orderType === "Thay thế luận văn" && loaiHp.toLowerCase().includes("thay thế")) {
          shouldInclude = true;
        } else if (orderType === "Khác" && 
          !loaiHp.toLowerCase().includes("quốc phòng") &&
          !loaiHp.toLowerCase().includes("anh văn") &&
          !loaiHp.toLowerCase().includes("thể chất") &&
          !loaiHp.toLowerCase().includes("đại cương") &&
          !loaiHp.toLowerCase().includes("cơ sở ngành") &&
          !loaiHp.toLowerCase().includes("chuyên ngành") &&
          !loaiHp.toLowerCase().includes("luận văn") &&
          !loaiHp.toLowerCase().includes("khóa luận") &&
          !loaiHp.toLowerCase().includes("thay thế")) {
          shouldInclude = true;
        }
        
        if (shouldInclude && courses.length > 0) {
          const totalCredits = courses.reduce((sum, course) => sum + (course.tinChi || 0), 0);
          let colorScheme = "blue";
          
          if (loaiHp.toLowerCase().includes("quốc phòng")) colorScheme = "red";
          else if (loaiHp.toLowerCase().includes("anh văn")) colorScheme = "green";
          else if (loaiHp.toLowerCase().includes("thể chất")) colorScheme = "purple";
          else if (loaiHp.toLowerCase().includes("đại cương")) colorScheme = "purple";
          else if (loaiHp.toLowerCase().includes("cơ sở ngành")) colorScheme = "blue";
          else if (loaiHp.toLowerCase().includes("chuyên ngành")) colorScheme = "orange";
          else if (loaiHp.toLowerCase().includes("luận văn") || loaiHp.toLowerCase().includes("khóa luận")) colorScheme = "red";
          else if (loaiHp.toLowerCase().includes("thay thế")) colorScheme = "orange";

          orderedRegularGroups.push({
            id: `group-${loaiHp.replace(/\s+/g, "-")}`,
            title: `Học phần ${loaiHp}`,
            subtitle: `${courses.length} học phần • ${totalCredits} tín chỉ`,
            courses,
            totalCredits,
            colorScheme,
          });
        }
      });
    });

    // Tạo ordered groups cho nhóm tự chọn theo thứ tự
    const orderedElectiveGroups: SubjectGroup[] = [];
    
    // Thêm nhóm tự chọn theo thứ tự: Đại cương -> Cơ sở ngành -> Chuyên ngành
    const electiveOrder = ["đại cương", "cơ sở ngành", "chuyên ngành"];
    
    electiveOrder.forEach(electiveType => {
      nhomHocPhanTuChon.forEach((nhom, index) => {
        // Tính toán trạng thái hoàn thành của nhóm
        const allCoursesInGroup = nhom.hocPhanTuChonList || [];
        
        // Helper function để nhóm các học phần theo đánh số
        const groupCoursesByNumber = (courses: HocPhan[]) => {
          const numberedGroups: { [key: string]: HocPhan[] } = {};
          const singleCourses: HocPhan[] = [];
          
          courses.forEach(course => {
            const tenHp = course.tenHp || '';
            const pattern = checkCourseIdPattern(tenHp);
            
            if (pattern.hasPattern) {
              if (!numberedGroups[pattern.baseName]) {
                numberedGroups[pattern.baseName] = [];
              }
              numberedGroups[pattern.baseName].push(course);
            } else {
              singleCourses.push(course);
            }
          });
          
          return { numberedGroups, singleCourses };
        };
        
        const { numberedGroups, singleCourses } = groupCoursesByNumber(allCoursesInGroup);
        
        // Tính tổng tín chỉ đã hoàn thành
        let completedCredits = 0;
        const requiredCredits = nhom.tinChiYeuCau || 0;
        
        // Đối với single courses
        singleCourses.forEach(course => {
          if (hocPhanDaHoc.includes(course.maHp || '')) {
            completedCredits += course.tinChi || 0;
          }
        });
        
        // Đối với numbered groups
        Object.values(numberedGroups).forEach(groupCourses => {
          const hasCompletedOne = groupCourses.some(course => 
            hocPhanDaHoc.includes(course.maHp || '')
          );
          if (hasCompletedOne) {
            const completedCourse = groupCourses.find(course => 
              hocPhanDaHoc.includes(course.maHp || '')
            ) || groupCourses[0];
            completedCredits += completedCourse.tinChi || 0;
          }
        });
        
        const isCompleted = completedCredits >= requiredCredits;
        const isInProgress = completedCredits > 0 && completedCredits < requiredCredits;
        
        // Kiểm tra nhóm có thuộc loại đang xét không
        const nhomName = nhom.tenNhom?.toLowerCase() || '';
        const shouldInclude = nhomName.includes(electiveType);
        
        // Chỉ hiển thị nhóm chưa hoàn thành và thuộc loại đang xét
        if (!isCompleted && shouldInclude) {
          const electiveCourses = filterCourses(allCoursesInGroup);
          if (electiveCourses.length > 0) {
            let status = "";
            if (isInProgress) {
              status = ` • Đang thực hiện (${completedCredits}/${requiredCredits} tín chỉ)`;
            } else {
              status = ` • Chưa bắt đầu (0/${requiredCredits} tín chỉ)`;
            }

            const totalAvailableCredits = electiveCourses.reduce((sum, course) => sum + (course.tinChi || 0), 0);
            
            orderedElectiveGroups.push({
              id: `group-elective-${index}`,
              title: `Nhóm tự chọn: ${nhom.tenNhom}`,
              subtitle: `${electiveCourses.length} học phần • ${totalAvailableCredits} tín chỉ có thể chọn${status}`,
              courses: electiveCourses,
              totalCredits: totalAvailableCredits,
              colorScheme: isInProgress ? "orange" : "green",
            });
          }
        }
      });
    });

    // Group học phần cải thiện - đặt ở cuối cùng
    const improvementGroup: SubjectGroup[] = [];
    if (enableImprovementCourses && hocPhanCaiThien.length >= 3) {
      const totalCredits = hocPhanCaiThien.reduce((sum, course) => sum + (course.tinChi || 0), 0);
      improvementGroup.push({
        id: "group-improvement",
        title: "Học phần cải thiện",
        subtitle: `${hocPhanCaiThien.length} học phần • ${totalCredits} tín chỉ`,
        courses: hocPhanCaiThien,
        totalCredits,
        colorScheme: "red",
      });
    }

    return [...newGroups, ...orderedRegularGroups, ...orderedElectiveGroups, ...improvementGroup];
  }, [hocPhans, hocPhanGoiY, hocPhanCaiThien, hocPhanTheChat, nhomHocPhanTuChon, currentHocPhans, pendingHocPhans, enableImprovementCourses, hocPhanDaHoc, isFromCompletedElectiveGroup]);

  // Không tự động expand các groups khi mở lần đầu
  // useEffect(() => {
  //   if (subjectGroups.length > 0) {
  //     setExpandedGroups(new Set(subjectGroups.map((g) => g.id)));
  //   }
  // }, [subjectGroups]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) newSet.delete(groupId);
      else newSet.add(groupId);
      return newSet;
    });
  }, []);

  const flattenedData = useMemo((): SubjectRow[] => {
    const result: SubjectRow[] = [];
    subjectGroups.forEach((group) => {
      result.push({
        maHp: `group-header-${group.id}`,
        tenHp: group.title,
        tinChi: 0,
        loaiHp: "group",
        hocPhanTienQuyet: "",
        isGroupHeader: true,
        groupId: group.id,
        groupTitle: group.title,
        groupSubtitle: group.subtitle,
        colorScheme: group.colorScheme,
      });

      if (expandedGroups.has(group.id)) {
        group.courses.forEach((course) => {
          result.push({
            ...course,
            isGroupHeader: false,
            groupId: group.id,
            colorScheme: group.colorScheme,
          });
        });
      }
    });
    return result;
  }, [subjectGroups, expandedGroups]);

  const filteredData = useMemo(() => {
    if (!globalFilter) return flattenedData;
    const filterValue = globalFilter.toLowerCase();

    const filteredGroups = subjectGroups.filter(
      (group) =>
        group.title.toLowerCase().includes(filterValue) ||
        group.courses.some(
          (c) =>
            c.tenHp.toLowerCase().includes(filterValue) ||
            c.maHp.toLowerCase().includes(filterValue)
        )
    );

    const result: SubjectRow[] = [];
    filteredGroups.forEach((group) => {
      const matchingCourses = group.courses.filter(
        (c) =>
          c.tenHp.toLowerCase().includes(filterValue) ||
          c.maHp.toLowerCase().includes(filterValue)
      );

      const isGroupTitleMatch = group.title.toLowerCase().includes(filterValue);

      result.push({
        maHp: `group-header-${group.id}`,
        tenHp: group.title,
        tinChi: 0,
        loaiHp: "group",
        hocPhanTienQuyet: "",
        isGroupHeader: true,
        groupId: group.id,
        groupTitle: group.title,
        groupSubtitle: group.subtitle,
        colorScheme: group.colorScheme,
      });

      if (expandedGroups.has(group.id)) {
        (isGroupTitleMatch ? group.courses : matchingCourses).forEach(
          (course) => {
            result.push({
              ...course,
              isGroupHeader: false,
              groupId: group.id,
              colorScheme: group.colorScheme,
            });
          }
        );
      }
    });
    return result;
  }, [flattenedData, globalFilter, subjectGroups, expandedGroups]);

  const columns = useMemo<ColumnDef<SubjectRow>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: "Mã HP",
        cell: ({ row }) => row.original.maHp,
        size: 120,
      },
      {
        accessorKey: "tenHp",
        header: "Tên học phần",
        cell: ({ row }) => {
          const hocPhan = row.original;
          const tenHp = hocPhan.tenHp || '';
          
          // Kiểm tra nếu là học phần có đánh số với pattern: [tên] - [ID] (ví dụ: - CN1)
          const pattern = checkCourseIdPattern(tenHp);
          
          if (pattern.hasPattern) {
            return (
              <div className="space-y-1">
                <div>{tenHp}</div>
                <div className="text-xs text-blue-600 font-medium">
                  💡 Chỉ cần hoàn thành 1 trong các học phần "{pattern.baseName} - [ID]"
                </div>
              </div>
            );
          }
          
          return tenHp;
        },
        size: 300,
      },
      {
        accessorKey: "tinChi",
        header: "Tín chỉ",
        cell: ({ row }) => (
          <div className={enableImprovementCourses ? "text-base" : "text-center"}>
            {row.original.tinChi}
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: "HP Tiên quyết",
        cell: ({ row }) => (
          <div className={enableImprovementCourses ? "text-base" : "text-center"}>
            {row.original.hocPhanTienQuyet ? (
              <span 
                className="text-blue-600 hover:text-blue-800 cursor-help"
                title={`Học phần tiên quyết: ${row.original.hocPhanTienQuyet}`}
              >
                {row.original.hocPhanTienQuyet}
              </span>
            ) : (
              <span className="text-gray-500">Không</span>
            )}
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: enableImprovementCourses ? () => (
          <div className="text-center">Thao tác</div>
        ) : "Thao tác",
        cell: ({ row }) => {
          const hocPhan = row.original;
          
          if (enableImprovementCourses) {
            const isImprovementCourse = hocPhan.loaiHp === "Cải thiện";
            const isInPending = pendingHocPhans.some(
              (item) => extractMaHp(item) === hocPhan.maHp
            );
            const isInCurrentPlan = currentHocPhans.some(
              (item) => extractMaHp(item) === hocPhan.maHp
            );
            const isAdded = isInPending || (isInCurrentPlan && !isImprovementCourse);
            
            // Kiểm tra xem có học phần cùng nhóm (có đánh số) đã được hoàn thành chưa
            let isGroupCompleted = false;
            const tenHp = hocPhan.tenHp || '';
            const pattern = checkCourseIdPattern(tenHp);
            
            if (pattern.hasPattern) {
              // Tìm tất cả học phần cùng nhóm trong subjectGroups
              const currentGroup = subjectGroups.find(sg => sg.courses.some(c => c.maHp === hocPhan.maHp));
              if (currentGroup) {
                const sameGroupCourses = currentGroup.courses.filter(course => {
                  const courseName = course.tenHp || '';
                  const coursePattern = checkCourseIdPattern(courseName);
                  return coursePattern.hasPattern && coursePattern.baseName === pattern.baseName;
                });
                
                // Kiểm tra xem có học phần nào trong nhóm đã hoàn thành chưa
                isGroupCompleted = sameGroupCourses.some(course => 
                  hocPhanDaHoc.includes(course.maHp || '')
                );
              }
            }
            
            // Kiểm tra xem học phần có thuộc nhóm tự chọn đã hoàn thành không
            const isFromCompletedElectiveGroupCheck = isFromCompletedElectiveGroup(hocPhan);
            
            // Kiểm tra điều kiện tiên quyết
            const prerequisiteCheck = checkPrerequisites(hocPhan);
            const canAdd = prerequisiteCheck.canAdd;
            const missingPrerequisites = prerequisiteCheck.missingPrerequisites;

            const buttonDisabled = isAdded || !canAdd || isGroupCompleted || isFromCompletedElectiveGroupCheck;
            let buttonTitle = "Thêm vào danh sách";
            
            if (isAdded) {
              buttonTitle = "Đã thêm học phần này";
            } else if (isFromCompletedElectiveGroupCheck) {
              buttonTitle = "Nhóm học phần tự chọn này đã hoàn thành";
            } else if (isGroupCompleted) {
              buttonTitle = "Đã hoàn thành học phần khác trong cùng nhóm";
            } else if (!canAdd) {
              buttonTitle = `Chưa hoàn thành học phần tiên quyết: ${missingPrerequisites.join(', ')}`;
            }

            return (
              <div className="text-center">
                <button
                  onClick={() => {
                    if (canAdd && !isAdded) {
                      onAddToPending(hocPhan);
                    }
                  }}
                  disabled={buttonDisabled}
                  className={`p-2 text-white rounded-full transition-all duration-200 ${
                    buttonDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-400"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105"
                  }`}
                  title={buttonTitle}
                >
                  {!canAdd ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          }

          // Logic cho trường hợp không phải improvement courses
          const prerequisiteCheck = checkPrerequisites(hocPhan);
          const canAdd = prerequisiteCheck.canAdd;
          const missingPrerequisites = prerequisiteCheck.missingPrerequisites;
          
          let buttonTitle = "Thêm vào danh sách";
          if (!canAdd) {
            buttonTitle = `Chưa hoàn thành học phần tiên quyết: ${missingPrerequisites.join(', ')}`;
          }

          return (
            <div className="text-center">
              <button
                onClick={() => {
                  if (canAdd) {
                    onAddToPending(hocPhan);
                  }
                }}
                disabled={!canAdd}
                className={`p-2 text-white rounded-full transition-all duration-200 ${
                  !canAdd
                    ? "opacity-40 cursor-not-allowed bg-gray-400"
                    : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105"
                }`}
                title={buttonTitle}
              >
                {!canAdd ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        },
        size: 100,
      },
    ],
    [pendingHocPhans, currentHocPhans, onAddToPending, enableImprovementCourses, checkPrerequisites, hocPhanDaHoc, subjectGroups, isFromCompletedElectiveGroup]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.maHp,
  });

  const totalCourses = useMemo(
    () => subjectGroups.reduce((sum, group) => sum + group.courses.length, 0),
    [subjectGroups]
  );

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={`Tìm kiếm trong ${totalCourses} học phần...`}
            className="border border-gray-300 pl-9 pr-3 py-1.5 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              if (item.isGroupHeader) {
                const colors = getColorClasses(item.colorScheme || "blue");
                return (
                  <tr
                    key={row.id}
                    className={`${colors.bg} ${colors.hover} cursor-pointer transition-colors border-l-4 ${colors.border}`}
                  >
                    <td
                      colSpan={columns.length}
                      className="px-4 py-3 border-b border-gray-200"
                      onClick={() => toggleGroup(item.groupId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded">
                            {expandedGroups.has(item.groupId) ? (
                              <ChevronDown
                                className={`w-5 h-5 ${colors.text}`}
                              />
                            ) : (
                              <ChevronRight
                                className={`w-5 h-5 ${colors.text}`}
                              />
                            )}
                          </div>
                          <div
                            className={`p-2 rounded-lg ${colors.badge.replace("text-", "bg-").replace("-800", "-100")}`}
                          >
                            <BookOpen className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <div
                              className={`font-semibold ${colors.text} text-base`}
                            >
                              {item.groupTitle}
                            </div>
                            <div
                              className={`text-sm ${colors.text} opacity-80`}
                            >
                              {item.groupSubtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2.5 text-sm border-b border-gray-200 ${
                        index === 0 ? "pl-12" : "text-gray-700"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Trang {table.getState().pagination.pageIndex + 1} /{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSubjectsTable;
