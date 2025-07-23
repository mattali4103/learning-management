# Documentation for `ThemKeHoachHocTapMau.tsx`

This document provides a detailed explanation of the `ThemKeHoachHocTapMau.tsx` component, which is responsible for creating and editing sample study plans (`Kế hoạch Học tập Mẫu`).

## Overview

The `ThemKeHoachHocTapMau` component serves a dual purpose:

1.  **Creation (`/add`)**: Allows academic staff (like `TRUONG_KHOA`) to build a new sample study plan from scratch for a specific major (`Ngành`) and academic year (`Khóa học`).
2.  **Editing (`/edit`)**: Allows modification of an existing sample study plan.

The component is structured to guide the user through a step-by-step process, from selecting the major and course to adding and organizing subjects (`Học phần`) into specific semesters (`Học kỳ`).

## Core Functionality

### 1. Mode Detection

-   The component checks the URL to determine if it's in "add" or "edit" mode using `useParams` and `useLocation`.
-   **Initial State**: If not in "add" or "edit" mode, it presents a selection screen for the user to choose a `Ngành` and `Khóa học`.

### 2. Data Fetching

The component fetches essential data from the backend using `axiosPrivate` and custom hooks:

-   **`fetchDanhSachNganh`**: Retrieves the list of majors (`Nganh`) associated with the current user's department (`Khoa`).
-   **`fetchKhoaHoc`**: Fetches the available academic years (`Khóa học`) based on the selected major.
-   **`fetchDanhSachHocKy`**: Gets a comprehensive list of all semesters.
-   **`checkExistingPlan`**: Checks if a sample study plan already exists for the selected major and course. If a plan exists, it loads the data for editing.
-   **`fetchHocPhanTuChon`**: Retrieves the list of elective courses for the selected program.

### 3. State Management (`useState`, `useMemo`)

The component manages a complex state to handle the UI and data:

-   **`selectedNganh`, `selectedKhoaHoc`**: Stores the user's selection for the major and academic year.
-   **`selectedHocPhans`**: An array holding the core data of the study plan. Each element is a `KeHoachHocTapDetail` object, linking a subject (`HocPhan`) to a specific semester (`HocKy`).
-   **`danhSachHocKy`, `danhSachNganh`**: Caches the fetched lists of semesters and majors.
-   **UI State**: `activeTab`, `selectedTabNamHoc`, `selectedHocKyChart` manage the visibility and filtering of the displayed data.
-   **Modal States**: `showAvailableSubjectsModal`, `isDeleteModalOpen`, etc., control the display of various modals.

### 4. Main UI Components

#### a. Page Header (`PageHeader`)

-   Displays the title of the page, which dynamically changes based on whether the user is adding or editing a plan.
-   Includes a back button for navigation.

#### b. Credit Statistics Chart (`Recharts`)

-   A `BarChart` visualizes the total number of credits (`tín chỉ`) assigned to each semester.
-   Each bar is interactive; clicking on it filters the course list below to show only the subjects for that semester.
-   The chart uses a custom tooltip (`CreditChartTooltip`) to provide detailed information on hover.
-   The maximum credits per semester is capped at `MAX_CREDITS_PER_SEMESTER` (currently 20).

#### c. Tab Navigation

-   **Year Tabs**: Allows filtering the view by academic year (`Năm học`).
-   **Semester Tabs**: Nested within the year tabs, these allow for finer-grained filtering by semester (`Học kỳ`).
-   The tabs dynamically update to show the count of subjects within them.

#### d. Course Table (`AllCoursesCollapsibleTable`)

-   This is the central component for displaying the list of selected subjects.
-   It's a collapsible table that groups subjects by type (e.g., "Bắt buộc", "Tự chọn").
-   It displays key information for each subject: code (`Mã HP`), name (`Tên HP`), credits (`Tín chỉ`), and prerequisites.
-   Provides an action to **delete** a subject from the plan.

### 5. User Interaction and Modals

#### a. Adding Subjects (`AvailableSubjectsModal`)

-   Clicking the "Thêm học phần" button opens this modal.
-   The modal allows users to browse or search for available subjects from the entire curriculum (`Chương trình đào tạo`).
-   Users can select subjects and assign them to a specific semester.
-   The modal prevents adding duplicate subjects and ensures the total credits per semester do not exceed the limit.

#### b. Deleting Subjects (`DeleteModal`)

-   When a user clicks the delete icon on a subject in the table, a confirmation modal appears to prevent accidental deletion.
-   Upon confirmation, the `fetchDeleteHocPhan` function is called to remove the subject from the backend.

#### c. Messaging Modals (`ErrorMessageModal`, `SuccessMessageModal`)

-   These modals provide clear feedback to the user after an action (e.g., successful deletion, or an error during an API call).

## Data Flow for Creating a Plan

1.  **Select Major & Course**: User selects a major and an academic year.
2.  **Check Plan**: The system checks if a plan already exists.
    -   If **yes**, it loads the existing data for editing.
    -   If **no**, it proceeds with a clean slate.
3.  **Add Subjects**: User clicks "Thêm học phần".
4.  **`AvailableSubjectsModal` Opens**:
    -   The modal fetches the full list of subjects for the selected program.
    -   User selects subjects and assigns them to a semester.
    -   The selected subjects are added to the `pendingHocPhans` state.
5.  **Save from Modal**: User clicks "Lưu" in the modal.
    -   An API call is made to save the `pendingHocPhans` to the backend.
    -   On success, the main `selectedHocPhans` state is updated, and the UI (chart and table) re-renders to reflect the changes.
6.  **Review and Edit**: The user can continue to add, edit, or delete subjects until the plan is complete.

## Key Hooks and Services

-   **`useAxiosPrivate`**: A custom hook that provides an `axios` instance with authentication headers attached, used for all secure API calls.
-   **`useAuth`**: Provides access to the user's authentication state, including their role and department (`maKhoa`).
-   **API Endpoints**:
    -   `KHHT_SERVICE`: Used for all operations related to the sample study plan (`KHHT Mẫu`), including fetching, creating, and deleting entries.
    -   `HOCPHAN_SERVICE`: Used to fetch curriculum data, such as the list of all subjects and elective groups.
    -   `PROFILE_SERVICE`: Used to fetch department-specific information, like the list of majors.
