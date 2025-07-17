Bố Quy Tắc Tuỳ Chỉnh cho Ứng Dụng React TypeScript

## Hướng dẫn chung về quy tắc lập trình
- Sử dụng PascalCase cho tên component, interface và type alias.
- Sử dụng camelCase cho biến, hàm và phương thức.
- Tiền tố các thành viên lớp riêng tư bằng dấu gạch dưới (_).
- Sử dụng ALL_CAPS cho các hằng số.

## Quy tắc về TypeScript và React
- Sử dụng TypeScript cho tất cả mã mới.
- Tuân theo các nguyên tắc lập trình hàm khi có thể.
- Sử dụng interface cho cấu trúc dữ liệu và định nghĩa kiểu.
- Ưu tiên dữ liệu bất biến (const, readonly).
- Sử dụng toán tử optional chaining (?.) và nullish coalescing (??).

## Quy tắc về React
- Sử dụng component hàm với hooks.
- Tuân theo quy tắc của React hooks (không sử dụng hooks có điều kiện).
- Sử dụng kiểu React.FC cho các component có children.
- Giữ cho các component nhỏ và tập trung.
- Sử dụng CSS modules cho việc định dạng component.

## Hạn chế thay đổi tên biến
- Không thay đổi tên biến đã được định nghĩa trong mã nguồn.
- Sử dụng tên biến rõ ràng và có ý nghĩa để dễ dàng bảo trì và đọc hiểu mã.

## Cách sử dụng tệp hướng dẫn
- Tạo tệp `.github/copilot-instructions.md` tại thư mục gốc của workspace.
- Mô tả các quy tắc bằng ngôn ngữ tự nhiên và định dạng Markdown.
- Đảm bảo rằng các quy tắc này được tự động bao gồm trong mỗi yêu cầu chat.