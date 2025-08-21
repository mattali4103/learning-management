  import React, { useState, useMemo, useCallback, useEffect } from "react";
  import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
  } from "@tanstack/react-table";
  import {
    ArrowUp,
    ChevronDown,
    ChevronRight,
    BookOpen,
    Users,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    Trash2,
    Search,
  } from "lucide-react";
  import Loading from "../Loading";
  import { EmptyTableState } from "./EmptyTableState";
  import { KeHoachHocTapExportButton } from "../PDFExportButton";
  import type { HocPhan } from "../../types/HocPhan";
  import type { HocPhanTuChon } from "../../types/HocPhanTuChon";
  import type { KeHoachHocTap } from "../../types/KeHoachHoctap";

  interface AllCoursesCollapsibleTableProps {
    name: string;
    allData: KeHoachHocTap[];
    nhomHocPhanTuChon?: HocPhanTuChon[];
    improvementCourses?: KeHoachHocTap[]; // Học phần cải thiện riêng biệt
    activeTab: string;
    loading?: boolean;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    onDelete?: (maHp: string) => void;
  }

  interface CourseGroupResult {
    groups: CourseGroup[];
    uniqueRequiredCourses: HocPhan[];
  }

  interface CourseGroup {
    id: string;
    type: "required" | "elective";
    title: string;
    subtitle: string;
    courses: HocPhan[];
    totalCredits: number;
    requiredCredits?: number;
    colorScheme: string;
    groupType?: string;
  }

  interface CourseWithGroup extends HocPhan {
    groupId: string;
    groupType: "required" | "elective";
    isGroupHeader?: boolean;
    groupTitle?: string;
    groupSubtitle?: string;
    groupTotalCredits?: number;
    groupRequiredCredits?: number;
    colorScheme?: string;
    type?: "direct-required" | "elective";
  }

  export const AllCoursesCollapsibleTable: React.FC<
    AllCoursesCollapsibleTableProps
  > = ({
    name,
    allData,
    nhomHocPhanTuChon = [],
    improvementCourses = [], // Học phần cải thiện riêng biệt
    activeTab,
    loading = false,
    emptyStateTitle,
    emptyStateDescription,
    onDelete,
  }) => {
    // Remove duplicate courses by maHp (course code) in requiredCourses
    const uniqueRequiredCourses = useMemo(() => {
      const seen = new Set();
      return allData.filter((course) => {
        if (!course.maHp) return false;
        if (seen.has(course.maHp)) return false;
        seen.add(course.maHp);
        return true;
      });
      
    }, [allData]);

    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 7,
    });

    // Tạo nhóm học phần từ các khóa học bắt buộc và tự chọn
    const courseGroupsResult = useMemo((): CourseGroupResult => {
      // Define the desired order for required course types
      const requiredOrder = [
        "Quốc phòng",
        "Anh văn",
        "Chính trị",
        "Thể chất",
        "Đại cương",
        "Cơ sở ngành",
        "Chuyên ngành",
        "Học Phần Cải Thiện"
      ];

      // Define the desired order for elective group types by matching course types inside them
      const electiveOrder = ["Đại cương", "Cơ sở ngành", "Chuyên ngành"];

      // Get all course codes that exist in elective groups to avoid duplication
      const electiveCourseCodes = new Set(
        nhomHocPhanTuChon
          .flatMap((group) =>
            (group.hocPhanTuChonList || []).map((course) => course.maHp)
          )
          .filter(Boolean)
      );

      // Create a Set of added course `maHp` for efficient lookup
      const addedCourseCodes = new Set(allData.map(c => c.maHp));
      console.log("Nhom Hoc Phan Tu Chon:", nhomHocPhanTuChon);
      console.log("Elective Course Codes:", electiveCourseCodes);
      // Filter required courses based on activeTab and exclude those already in elective groups
      let filteredRequiredCourses = uniqueRequiredCourses.filter(
        (course) => course.maHp && !electiveCourseCodes.has(course.maHp)
      );

      // Create improvement courses group from external parameter
      let improvementCoursesForGroup: KeHoachHocTap[] = [];
      
      // Use improvement courses from props if provided
      if (improvementCourses && improvementCourses.length > 0) {
        improvementCoursesForGroup = improvementCourses;
        
        // Apply filtering logic for improvement group based on activeTab
        if (activeTab !== "tatca" && activeTab !== "all" && !activeTab.startsWith("semester-")) {
            improvementCoursesForGroup = improvementCourses.filter(course => 
                course.loaiHp === activeTab
            );
        } else if (activeTab.startsWith("semester-")) {
            const hocKyId = Number(activeTab.replace("semester-", ""));
            improvementCoursesForGroup = improvementCourses.filter(course => 
              course.maHocKy === hocKyId
            );
        }
        // For "all" or "tatca" tabs, use all improvement courses without filtering
      } else {
        // Fallback: get improvement courses from allData if not provided as props
        const allImprovementCourses = uniqueRequiredCourses.filter(course => course.hocPhanCaiThien === true);
        
        if (allImprovementCourses.length > 0) {
          improvementCoursesForGroup = allImprovementCourses;
          
          if (activeTab !== "tatca" && activeTab !== "all" && !activeTab.startsWith("semester-")) {
              improvementCoursesForGroup = allImprovementCourses.filter(course => 
                  course.loaiHp === activeTab
              );
          } else if (activeTab.startsWith("semester-")) {
              const hocKyId = Number(activeTab.replace("semester-", ""));
              improvementCoursesForGroup = allImprovementCourses.filter(course => 
                course.maHocKy === hocKyId
              );
          }
        }
      }

      console.log("Improvement Courses From Props:", improvementCourses);
      console.log("Improvement Courses For Group:", improvementCoursesForGroup);

      // Apply activeTab filter to required courses (including improvement courses)
      if (activeTab !== "tatca" && activeTab !== "all" && !activeTab.startsWith("semester-")) {
          filteredRequiredCourses = filteredRequiredCourses.filter(course => 
              course.loaiHp === activeTab
          );
      } else if (activeTab.startsWith("semester-")) {
          const hocKyId = Number(activeTab.replace("semester-", ""));
          // Filter to only show courses from allData that belong to this semester
          // and ensure they are not duplicated in elective groups
          const semesterCourses = allData.filter(course => 
            course.maHocKy === hocKyId && 
            uniqueRequiredCourses.some(reqCourse => reqCourse.maHp === course.maHp)
          );
          
          // Remove duplicates by maHp within semester courses and exclude elective courses
          const seenCodes = new Set();
          filteredRequiredCourses = semesterCourses.filter(course => {
            if (!course.maHp || electiveCourseCodes.has(course.maHp) || seenCodes.has(course.maHp)) {
              return false;
            }
            seenCodes.add(course.maHp);
            return true;
          });
      }

      console.log("Filtered Required Courses:", filteredRequiredCourses);
      // Group required courses by loaiHp (course type) and remove duplicates within each group
      const requiredCoursesByType = filteredRequiredCourses.reduce(
        (acc, course) => {
          const type = course.loaiHp || "Khác";
          if (!acc[type]) {
            acc[type] = [];
          }
          
          // Check if course with same maHp already exists in this type group
          const existingCourse = acc[type].find(existingCourse => existingCourse.maHp === course.maHp);
          if (!existingCourse) {
            acc[type].push(course);
          }
          
          return acc;
        },
        {} as Record<string, HocPhan[]>
      );

      // Create groups for each course type
      const requiredGroups: CourseGroup[] = [];
      Object.entries(requiredCoursesByType).forEach(([courseType, courses]) => {
        if (courses.length > 0) {
          const totalCredits = courses.reduce(
            (sum, course) => sum + (course.tinChi || 0),
            0
          );

          // Determine color scheme based on course type
          let colorScheme = "blue";
          if (
            courseType.includes("Đại cương") ||
            courseType.includes("Anh văn") ||
            courseType.includes("chính trị") ||
            courseType.includes("thể chất")
          ) {
            colorScheme = "purple";
          } else if (courseType.includes("Cơ sở ngành")) {
            colorScheme = "blue";
          } else if (courseType.includes("Chuyên ngành")) {
            colorScheme = "orange";
          }

          requiredGroups.push({
            id: `required-${courseType.replace(/\s+/g, "-").toLowerCase()}`,
            type: "required",
            title: `Học phần ${courseType}`,
            subtitle: `${courses.length} học phần • ${totalCredits} tín chỉ`,
            courses: courses,
            totalCredits,
            colorScheme,
          });
          console.log(
            "Required Group Created:", requiredCoursesByType
          )
        }
      });

      // Sort required groups by the defined order
      requiredGroups.sort((a, b) => {
        const aIndex = requiredOrder.findIndex((order) =>
          a.title.includes(order)
        );
        const bIndex = requiredOrder.findIndex((order) =>
          b.title.includes(order)
        );
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

      // Add elective course groups (keep as groups)
      const electiveGroupsFiltered: CourseGroup[] = [];
      nhomHocPhanTuChon.forEach((group, index) => {
        console.log("Processing Elective Group:", group);
        let coursesInGroup: HocPhan[] = [];
        const allElectiveCoursesInGroup = group.hocPhanTuChonList || [];

        // Filter to only include courses that have been added (exist in allData)
        const addedElectiveCourses = allElectiveCoursesInGroup.filter(hp => addedCourseCodes.has(hp.maHp));

        if (activeTab === "tatca" || activeTab === "all") {
          // Remove duplicates by maHp within the group for "all" tab
          const seenCodesInGroup = new Set();
          coursesInGroup = addedElectiveCourses.filter(course => {
            if (!course.maHp || seenCodesInGroup.has(course.maHp)) {
              return false;
            }
            seenCodesInGroup.add(course.maHp);
            return true;
          });
        } else if (activeTab.startsWith("semester-")) {
          // Extract hocKyId from tab name
          const hocKyId = Number(activeTab.replace("semester-", ""));
          // Find matching courses from allData that belong to this semester and this group
          const semesterCoursesInGroup = allData.filter(course => 
            course.maHocKy === hocKyId && 
            allElectiveCoursesInGroup.some(hp => hp.maHp === course.maHp)
          );
          
          // Remove duplicates by maHp within the group
          const seenCodesInGroup = new Set();
          coursesInGroup = semesterCoursesInGroup.filter(course => {
            if (!course.maHp || seenCodesInGroup.has(course.maHp)) {
              return false;
            }
            seenCodesInGroup.add(course.maHp);
            return true;
          });
          
          console.log(`Semester ${hocKyId} - Group ${group.tenNhom}:`, coursesInGroup);
        } else {
          // Remove duplicates by maHp within the group for specific course type
          const filteredCourses = addedElectiveCourses.filter(
            (hp) => hp.loaiHp === activeTab
          );
          const seenCodesInGroup = new Set();
          coursesInGroup = filteredCourses.filter(course => {
            if (!course.maHp || seenCodesInGroup.has(course.maHp)) {
              return false;
            }
            seenCodesInGroup.add(course.maHp);
            return true;
          });
        }
        console.log("Courses in Group:", coursesInGroup);
        console.log("Group validation - coursesInGroup.length:", coursesInGroup.length);
        if (coursesInGroup.length > 0) {
          const totalCredits = coursesInGroup.reduce(
            (sum, course) => sum + (course.tinChi || 0),
            0
          );

          // Determine the type of elective group by checking course types inside
          let groupType = "Khác";
          for (const orderType of electiveOrder) {
            if (coursesInGroup.some((c) => c.loaiHp === orderType)) {
              groupType = orderType;
              break;
            }
          }

          electiveGroupsFiltered.push({
            id: `elective-${group.id}-${index}`,
            type: "elective",
            title: `Nhóm tự chọn: ${group.tenNhom}`,
            subtitle: `${coursesInGroup.length} học phần • Yêu cầu: ${group.tinChiYeuCau} tín chỉ`,
            courses: coursesInGroup,
            totalCredits,
            requiredCredits: group.tinChiYeuCau,
            colorScheme: "green",
            groupType: groupType,
          });
        }
      });
      console.log("Elective Groups Filtered:", electiveGroupsFiltered);

      const improvementGroup: CourseGroup[] = [];
      
      console.log("Improvement Courses For Group:", improvementCoursesForGroup);
      
      if (improvementCoursesForGroup.length > 0) {
        const totalCredits = improvementCoursesForGroup.reduce(
          (sum, course) => sum + (course.tinChi || 0),
          0
        );

        improvementGroup.push({
          id: 'improvement-courses',
          type: 'required',
          title: 'Học Phần Cải Thiện',
          subtitle: `${improvementCoursesForGroup.length} học phần • ${totalCredits} tín chỉ`,
          courses: improvementCoursesForGroup,
          totalCredits,
          colorScheme: 'red',
        });
        
        console.log("Improvement Group Created:", improvementGroup);
      }

      // Sort elective groups by the defined order
      electiveGroupsFiltered.sort((a, b) => {
        const aIndex = electiveOrder.findIndex((order) =>
          a.groupType?.includes(order)
        );
        const bIndex = electiveOrder.findIndex((order) =>
          b.groupType?.includes(order)
        );
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

      // Combine groups in the requested order:
      // Anh văn, chính trị, thể chất, đại cương,
      // nhóm học phần tự chọn đại cương,
      // cơ sở ngành, nhóm học phần tự chọn cơ sở ngành,
      // chuyên ngành, nhóm học phần tự chọn chuyên ngành,
      // học phần cải thiện

      const combinedGroups: CourseGroup[] = [];

      // Add required groups in order
      requiredOrder.forEach((orderType) => {
        requiredGroups.forEach((group) => {
          if (group.title.includes(orderType)) {
            combinedGroups.push(group);
          }
        });
        // Add elective groups of this type after required group
        electiveGroupsFiltered.forEach((group) => {
          if (group.groupType === orderType) {
            combinedGroups.push(group);
          }
        });
      });

      // Add improvement courses group at the end
      improvementGroup.forEach((group) => {
        combinedGroups.push(group);
      });

      // Add any remaining groups not in order arrays
      requiredGroups.forEach((group) => {
        if (!combinedGroups.includes(group)) {
          combinedGroups.push(group);
        }
      });
      electiveGroupsFiltered.forEach((group) => {
        if (!combinedGroups.includes(group)) {
          combinedGroups.push(group);
        }
      });
      console.log("Combined Course Groups:", combinedGroups);

      return { groups: combinedGroups, uniqueRequiredCourses: [] }; // No longer showing individual required courses
    }, [uniqueRequiredCourses, nhomHocPhanTuChon, activeTab, allData, improvementCourses]);

    const courseGroups = courseGroupsResult.groups;

    // Auto-expand groups when searching
    useEffect(() => {
      if (globalFilter && typeof globalFilter === "string" && globalFilter.trim() !== "") {
        const filterValue = globalFilter.toLowerCase();
        const groupsToExpand = new Set<string>();
        
        courseGroups.forEach((group) => {
          // Check if group title/subtitle matches
          const title = group.title.toLowerCase();
          const subtitle = group.subtitle.toLowerCase();
          const groupMatches = title.includes(filterValue) || subtitle.includes(filterValue);
          
          // Check if any course in the group matches
          const hasMatchingCourse = group.courses.some((course) => {
            const maHp = typeof course.maHp === "string" ? course.maHp.toLowerCase() : "";
            const tenHp = typeof course.tenHp === "string" ? course.tenHp.toLowerCase() : "";
            const loaiHp = typeof course.loaiHp === "string" ? course.loaiHp.toLowerCase() : "";
            const hocPhanTienQuyet = typeof course.hocPhanTienQuyet === "string" ? course.hocPhanTienQuyet.toLowerCase() : "";
            return (
              maHp.includes(filterValue) ||
              tenHp.includes(filterValue) ||
              loaiHp.includes(filterValue) ||
              hocPhanTienQuyet.includes(filterValue)
            );
          });
          
          if (groupMatches || hasMatchingCourse) {
            groupsToExpand.add(group.id);
          }
        });
        
        setExpandedGroups(groupsToExpand);
      } else {
        // Reset to empty when no search filter
        setExpandedGroups(new Set());
      }
    }, [globalFilter, courseGroups]);

    // Toggle group expansion
    const toggleGroup = useCallback(
      (groupId: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
          newExpanded.delete(groupId);
        } else {
          newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
      },
      [expandedGroups]
    );

    // Get all courses for filtering and table setup, including all groups
    const allCourses = useMemo(() => {
      return courseGroups.flatMap((group) => group.courses);
    }, [courseGroups]);

    // Create flattened data structure - group headers with their courses directly below
    const flattenedData = useMemo((): CourseWithGroup[] => {
      const result: CourseWithGroup[] = [];
      const hasSearchFilter = globalFilter && typeof globalFilter === "string" && globalFilter.trim() !== "";
      const filterValue = hasSearchFilter ? globalFilter.toLowerCase() : "";
      
      // Add each group header followed immediately by its courses
      courseGroups.forEach((group) => {
        let shouldShowGroup = false;
        let shouldShowCourses = expandedGroups.has(group.id);
        
        if (hasSearchFilter) {
          // Check if group title/subtitle matches filter
          const title = group.title?.toLowerCase() ?? "";
          const subtitle = group.subtitle?.toLowerCase() ?? "";
          const groupMatches = title.includes(filterValue) || subtitle.includes(filterValue);
          
          // Check if any course in this group matches the filter
          const hasMatchingCourse = group.courses.some((course) => {
            const maHp = typeof course.maHp === "string" ? course.maHp.toLowerCase() : "";
            const tenHp = typeof course.tenHp === "string" ? course.tenHp.toLowerCase() : "";
            const loaiHp = typeof course.loaiHp === "string" ? course.loaiHp.toLowerCase() : "";
            const hocPhanTienQuyet = typeof course.hocPhanTienQuyet === "string" ? course.hocPhanTienQuyet.toLowerCase() : "";
            return (
              maHp.includes(filterValue) ||
              tenHp.includes(filterValue) ||
              loaiHp.includes(filterValue) ||
              hocPhanTienQuyet.includes(filterValue)
            );
          });
          
          // Show group if either group matches or has matching courses
          shouldShowGroup = groupMatches || hasMatchingCourse;
          shouldShowCourses = shouldShowGroup;
        } else {
          // No filter, show all groups
          shouldShowGroup = true;
        }

        if (shouldShowGroup) {
          // Add group header
          result.push({
            maHp: `group-header-${group.id}`,
            tenHp: group.title,
            tinChi: 0,
            loaiHp: group.type,
            hocPhanTienQuyet: "",
            groupId: group.id,
            groupType: group.type,
            isGroupHeader: true,
            groupTitle: group.title,
            groupSubtitle: group.subtitle,
            groupTotalCredits: group.totalCredits,
            groupRequiredCredits: group.requiredCredits,
            colorScheme: group.colorScheme,
          } as CourseWithGroup);

          // Add courses immediately after the header if group is expanded or if search matches
          if (shouldShowCourses) {
            const coursesToShow = hasSearchFilter 
              ? group.courses.filter((course) => {
                  const maHp = typeof course.maHp === "string" ? course.maHp.toLowerCase() : "";
                  const tenHp = typeof course.tenHp === "string" ? course.tenHp.toLowerCase() : "";
                  const loaiHp = typeof course.loaiHp === "string" ? course.loaiHp.toLowerCase() : "";
                  const hocPhanTienQuyet = typeof course.hocPhanTienQuyet === "string" ? course.hocPhanTienQuyet.toLowerCase() : "";
                  return (
                    maHp.includes(filterValue) ||
                    tenHp.includes(filterValue) ||
                    loaiHp.includes(filterValue) ||
                    hocPhanTienQuyet.includes(filterValue)
                  );
                })
              : group.courses;

            coursesToShow.forEach((course) => {
              result.push({
                ...course,
                groupId: group.id,
                groupType: group.type,
                isGroupHeader: false,
                colorScheme: group.colorScheme,
              } as CourseWithGroup);
            });
          }
        }
      });

      return result;
    }, [courseGroups, expandedGroups, globalFilter]);

    // Filter data based on global filter (apply to both headers and courses)
    const filteredData = useMemo(() => {
      // Flattened data already handles search filtering, so just return it directly
      // to avoid duplicate group header issues
      return flattenedData;
    }, [flattenedData]);

    // Use filteredData directly for display with pagination
    const displayData = useMemo((): CourseWithGroup[] => {
      console.log("Filtered Data:", filteredData);
      return filteredData;
    }, [filteredData]);

    const columns = useMemo<ColumnDef<CourseWithGroup>[]>(
      () => [
        {
          id: "stt",
          header: "STT",
          cell: ({ row, table }) => {
            const item = row.original;
            if (item.isGroupHeader) {
              return null; // No STT for group headers
            }

            // Calculate STT for courses only
            const allRows = table.getFilteredRowModel().rows;
            let courseIndex = 0;

            // Count courses up to current row
            for (let i = 0; i <= row.index; i++) {
              const currentRow = allRows[i];
              if (currentRow && !currentRow.original.isGroupHeader) {
                courseIndex++;
              }
            }

            return (
              <div className="text-center">
                <span className="text-sm font-medium text-gray-600">
                  {courseIndex}
                </span>
              </div>
            );
          },
          size: 80,
          enableSorting: false,
        },
        {
          accessorKey: "maHp",
          header: "Mã học phần",
          cell: ({ row }) => {
            const item = row.original;
            if (item.isGroupHeader) {
              return null; // Group headers are handled separately
            }
            return item.maHp || "";
          },
          size: 140,
          enableSorting: false,
        },
        {
          id: "tenHp",
          accessorKey: "tenHp",
          header: "Tên học phần",
          cell: ({ row }) => {
            const item = row.original;
            if (item.isGroupHeader) {
              return null;
            }
            return item.tenHp || "";
          },
          size: 200,
          enableSorting: false,
        },
        {
          id: "tinChi",
          accessorKey: "tinChi",
          header: "Tín chỉ",
          cell: ({ row }) => {
            const item = row.original;
            if (item.isGroupHeader) {
              return null;
            }
            return (
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-700">
                  {item.tinChi || 0}
                </span>
              </div>
            );
          },
          size: 100,
          enableSorting: false,
        },
        {
          id: "loaiHp",
          accessorKey: "loaiHp",
          header: "Loại học phần",
          cell: ({ row }) => {
            const item = row.original;
            if (item.isGroupHeader) {
              return null;
            }
            return (
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {item.loaiHp || "N/A"}
                </span>
              </div>
            );
          },
          size: 120,
          enableSorting: false,
        },
        {
          id: "hocPhanTienQuyet",
          accessorKey: "hocPhanTienQuyet",
          header: "Tiên quyết",
          cell: ({ row }) => {
            const item = row.original;
            if (item.isGroupHeader) {
              return null;
            }
            return (
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {item.hocPhanTienQuyet || "-"}
                </span>
              </div>
            );
          },
          size: 150,
          enableSorting: false,
        },
        {
          id: "action",
          header: "",
          cell: ({ row }) => {
            if (!onDelete) return null;
            return (
              <div className="flex items-center justify-center">
                <button
                  className="text-red-600 hover:text-red-800 p-2 rounded-lg transition-colors duration-200"
                  onClick={() => onDelete(row.original.maHp)}
                  title="Xóa khỏi kế hoạch"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          },
          size: 80,
        },
      ],
      [onDelete]
    );

    const tableState = useMemo(
      () => ({
        pagination,
        globalFilter,
      }),
      [pagination, globalFilter]
    );

    const table = useReactTable({
      data: displayData,
      columns,
      state: tableState,
      onGlobalFilterChange: setGlobalFilter,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      manualPagination: false,
      autoResetPageIndex: false,
    });

    // Custom pagination info
    const paginationInfo = useMemo(() => {
      // Count only courses for pagination info (excluding group headers)
      const coursesCount = filteredData.filter(
        (item) => !item.isGroupHeader
      ).length;
      const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
      const currentPage = pagination.pageIndex + 1;
      const canPreviousPage = pagination.pageIndex > 0;
      const canNextPage = pagination.pageIndex < totalPages - 1;

      return {
        totalPages,
        currentPage,
        canPreviousPage,
        canNextPage,
        coursesCount,
      };
    }, [filteredData, pagination]);
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
      };
      return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
    };

    if (courseGroups.length === 0 && !loading) {
      return (
        <div className="overflow-x-auto rounded-lg shadow-xl bg-gray-200">
          <div className="text-center flex bg-gradient-to-r from-blue-400 to-blue-500 py-3 text-lg text-white relative">
            <div className="flex-1 flex justify-center items-center">
              <h3 className="font-bold uppercase tracking-wide">{name}</h3>
            </div>
          </div>
          <div className="p-8">
            <EmptyTableState
              title={emptyStateTitle || "Không có dữ liệu"}
              description={
                emptyStateDescription || "Hiện tại chưa có học phần nào"
              }
            />
          </div>
        </div>
      );
    }
    // Handle empty state
    if (courseGroups.length === 0 && !loading) {
      return (
        <div className="overflow-x-auto rounded-lg shadow-xl bg-gray-200">
          <div className="text-center flex bg-gradient-to-r from-blue-400 to-blue-500 py-3 text-lg text-white relative">
            <div className="flex-1 flex justify-center items-center">
              <h3 className="font-bold uppercase tracking-wide">{name}</h3>
            </div>
          </div>
          <div className="p-8">
            <EmptyTableState
              title={emptyStateTitle || "Không có dữ liệu"}
              description={
                emptyStateDescription || "Hiện tại chưa có học phần nào"
              }
            />
          </div>
        </div>
      );
    }
    const totalCourses = allCourses.length;
    const totalCredits = allCourses.reduce(
      (sum, course) => sum + (course.tinChi || 0),
      0
    );

    // Pagination component with custom logic
    const PaginationControls = () => (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span>
            Hiển thị {pagination.pageSize} dòng trong tổng số{" "}
            {paginationInfo.coursesCount} học phần
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Trang {paginationInfo.currentPage} / {paginationInfo.totalPages}
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
              disabled={!paginationInfo.canPreviousPage}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang đầu"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              disabled={!paginationInfo.canPreviousPage}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              disabled={!paginationInfo.canNextPage}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: paginationInfo.totalPages - 1,
                }))
              }
              disabled={!paginationInfo.canNextPage}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang cuối"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
    return (
      <div className="overflow-x-auto rounded-lg shadow-xl bg-gray-200 transition-all duration-200 hover:shadow-2xl">
        <div className="text-center flex bg-gradient-to-r from-blue-400 to-blue-500 py-3 text-lg text-white relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Tìm kiếm học phần..."
                className="border-none pl-9 pr-3 py-1.5 rounded-lg bg-white/90 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white text-sm placeholder-gray-500 transition-all duration-200 w-48"
              />
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center">
            <h3 className="font-bold uppercase tracking-wide">{name}</h3>
            {totalCourses > 0 && (
              <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                {globalFilter
                  ? `${filteredData.filter((item) => !item.isGroupHeader).length}/${totalCourses}`
                  : `${totalCourses}`}{" "}
                học phần • {totalCredits} tín chỉ
              </span>
            )}
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {totalCourses > 0 && (
              <KeHoachHocTapExportButton
                data={allData}
                title={name}
                variant="minimal"
                size="sm"
                showText={false}
                className="text-white hover:bg-white/20 border-white/30"
              />
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
              aria-label={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
              title={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
            >
              <ArrowUp
                className={`w-5 h-5 text-white transition-all duration-300 group-hover:scale-110 ${isExpanded ? "rotate-180" : "rotate-0"}`}
              />
            </button>
          </div>
        </div>

        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${isExpanded ? "max-h-[2000px] opacity-100 transform translate-y-0" : "max-h-0 opacity-0 transform -translate-y-2"}`}
        >
          <div
            className={`transition-all duration-200 ${isExpanded ? "delay-100" : ""}`}
          >
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="text-center">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 py-2 border-1 bg-gradient-to-b from-blue-400 to-blue-500 text-center text-lg font-medium text-white border-b"
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center justify-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8">
                      <Loading />
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8">
                      <EmptyTableState
                        title={
                          globalFilter
                            ? "Không tìm thấy kết quả"
                            : "Không có học phần"
                        }
                        description={
                          globalFilter
                            ? "Không có học phần nào phù hợp với từ khóa tìm kiếm"
                            : "Chưa có học phần nào được thêm"
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => {
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
                                <div className="flex items-center justify-center w-6 h-6 rounded transition-transform hover:bg-white/20">
                                  {expandedGroups.has(item.groupId) ? (
                                    <ChevronDown
                                      className={`w-4 h-4 ${colors.text} transition-transform`}
                                    />
                                  ) : (
                                    <ChevronRight
                                      className={`w-4 h-4 ${colors.text} transition-transform`}
                                    />
                                  )}
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`p-2 rounded-lg ${colors.badge.replace("text-", "bg-").replace("-800", "-100")}`}
                                  >
                                    {item.groupType === "required" ? (
                                      <BookOpen
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : (
                                      <Users
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <div
                                      className={`font-semibold ${colors.text} text-base leading-tight`}
                                    >
                                      {item.groupTitle}
                                    </div>
                                    <div
                                      className={`text-sm ${colors.text} opacity-75 mt-1`}
                                    >
                                      {item.groupSubtitle}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge} border border-current border-opacity-20`}
                                >
                                  {item.groupTotalCredits} TC
                                </span>
                                {item.groupRequiredCredits && (
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300`}
                                  >
                                    Yêu cầu: {item.groupRequiredCredits} TC
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          {row.getVisibleCells().map((cell, index) => (
                            <td
                              key={cell.id}
                              className={`px-3 py-2 text-center border-b border-gray-100 ${
                                index === 0
                                  ? "border-l-4 border-l-transparent group-hover:border-l-gray-300"
                                  : ""
                              }`}
                              style={
                                index === 0
                                  ? {
                                      paddingLeft: "2rem",
                                      position: "relative",
                                    }
                                  : undefined
                              }
                            >
                              {index === 0 && (
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-px bg-gray-300"></div>
                              )}
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    }
                  })
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {!loading && table.getRowModel().rows.length > 0 && <PaginationControls />}
          </div>
        </div>
      </div>
    );
  };
