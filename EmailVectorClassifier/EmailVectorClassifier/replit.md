# Email Classification System - Hệ Thống Phân Loại Email Thông Minh

## Tổng quan
Hệ thống phân loại email tự động sử dụng AI và vector embeddings để phân tích và tổ chức email một cách thông minh. Ứng dụng kết nối với Gmail, sử dụng OpenAI để tạo vector embeddings, và cung cấp dashboard trực quan để quản lý email.

## Công nghệ sử dụng
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **AI/ML**: OpenAI Embeddings API (text-embedding-3-small)
- **Email**: Gmail API
- **Visualization**: Recharts

## Kiến trúc dữ liệu

### Database Schema
1. **categories** - Danh mục phân loại
   - id, name, description, color, icon, createdAt
   
2. **emails** - Email từ Gmail
   - id, gmailId, subject, from, to, body, snippet, receivedAt, embedding (vector), createdAt
   
3. **classifications** - Liên kết email và danh mục
   - id, emailId, categoryId, confidence, isManual, createdAt

### Relations
- Một email có thể có nhiều classifications
- Một category có thể có nhiều classifications
- Classifications liên kết emails với categories

## Tính năng chính

### 1. Dashboard
- Hiển thị thống kê tổng quan (tổng số email, đã phân loại, số danh mục, độ tin cậy TB)
- Biểu đồ phân bố email theo danh mục (Pie chart)
- Danh sách danh mục với số lượng và phần trăm

### 2. Email Management
- Danh sách email với search và filter theo category
- Chi tiết email với thông tin đầy đủ
- Hiển thị độ tin cậy phân loại và category badge
- Email detail dialog với nội dung đầy đủ

### 3. Category Management
- Tạo, sửa, xóa danh mục
- Tùy chỉnh màu sắc và icon cho từng danh mục
- Xem thống kê số lượng email và phần trăm cho mỗi danh mục
- Visual indicators (progress bars, color coding)

### 4. Settings
- Bật/tắt phân loại tự động
- Đồng bộ Gmail thủ công
- Tính lại vector embeddings
- Hiển thị trạng thái hệ thống

## Vector Space Classification

### Quy trình phân loại
1. **Sync Gmail**: Lấy email từ Gmail API
2. **Generate Embeddings**: Sử dụng OpenAI để tạo vector embeddings cho subject + body
3. **Calculate Similarity**: Tính cosine similarity giữa email mới và emails đã phân loại
4. **Auto-classify**: Gán category dựa trên similarity scores
5. **Manual Override**: Người dùng có thể điều chỉnh phân loại

### Công thức tính similarity
```
cosine_similarity(A, B) = (A · B) / (||A|| * ||B||)
```

## API Endpoints (Backend sẽ implement)
- `GET /api/stats` - Thống kê tổng quan
- `GET /api/categories` - Danh sách categories
- `GET /api/categories/stats` - Categories với thống kê
- `POST /api/categories` - Tạo category
- `PATCH /api/categories/:id` - Cập nhật category
- `DELETE /api/categories/:id` - Xóa category
- `GET /api/emails` - Danh sách emails (với query params)
- `POST /api/emails/sync` - Đồng bộ Gmail
- `POST /api/emails/:id/classify` - Phân loại email
- `POST /api/emails/compute-embeddings` - Tính embeddings

## Design System
- **Colors**: Professional blue primary (220 90% 56%), category-specific colors
- **Typography**: Inter (UI), JetBrains Mono (technical data)
- **Components**: Shadcn UI với customization
- **Dark Mode**: Full support với theme toggle
- **Responsive**: Mobile-first design

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for embeddings
- `SESSION_SECRET` - Session security
- Gmail connection via Replit Connectors

## Workflow
1. Start application: `npm run dev`
2. Backend: Express server on same port as Vite
3. Frontend: Vite dev server with HMR

## User Preferences
- Language: Vietnamese (vi)
- Theme: Support both light and dark modes
- Design: Modern, clean, Material Design inspired

## Known Limitations
- **Gmail OAuth Scopes**: The current Gmail integration has limited scopes (gmail.addons, gmail.send, gmail.labels) which don't include full mailbox access (`gmail.readonly`). To enable email syncing, the Gmail connection needs to be reconfigured with broader scopes. The application will show authentication errors when attempting to sync until this is resolved.
  - Current scopes: gmail.addons.*, gmail.send, gmail.labels, gmail.metadata
  - Required scope: gmail.readonly (to read inbox messages)
  - Workaround: User needs to reconfigure the Gmail integration in Replit settings

## Recent Changes
- 2025-01-17: Initial implementation
  - Created complete database schema with relations
  - Built all frontend components and pages
  - Integrated Shadcn UI with sidebar navigation
  - Implemented theme provider for dark mode
  - Added visualization with Recharts
  - Implemented Gmail sync with rate limiting (100ms between Gmail calls, 200ms between OpenAI calls)
  - Added manual classification UI in email detail dialog
  - Implemented all backend API endpoints including compute-embeddings
  - Added auto-classification using cosine similarity
  - Full CRUD for categories with stats
  - Error handling and loading states throughout
