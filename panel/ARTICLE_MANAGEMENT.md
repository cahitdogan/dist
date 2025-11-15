# Article Management Module

Complete article management system for the blog admin panel.

## Features Implemented

### 📊 Dashboard
- **Statistics Overview**
  - Total articles count
  - Published articles count
  - Draft articles count
  - Total views across all articles
- **Quick Actions**
  - Create new article button
  - Manage articles button
- **Beautiful UI** with stat cards and icons

### 📝 Articles List (`articles.html`)
- **Table View** displaying all articles
  - Title with excerpt preview
  - Category
  - Status badge (Published/Draft)
  - View count
  - Date published/created
  - Action buttons (Edit/Delete)
- **Filtering & Search**
  - Search by title or excerpt
  - Filter by status (All, Published, Draft)
  - Filter by category
- **Delete Confirmation Modal**
  - Safe deletion with confirmation
  - Success message after deletion

### ➕ New Article (`new-article.html`)
- **Complete Form** with fields:
  - Title (required) - Auto-generates slug
  - Slug (required) - URL-friendly identifier
  - Excerpt (optional) - Short summary
  - Content (required) - Full article content
  - Category (optional) - Dropdown of categories
  - Featured Image URL (optional)
  - Read Time (default: 5 minutes)
- **Dual Submit Buttons**
  - Save as Draft
  - Publish
- **Auto-slug Generation** from title
- **Form Validation**
- **Success/Error Messages**
- **Auto-redirect** to articles list after save

### ✏️ Edit Article (`edit-article.html`)
- **Pre-populated Form** with existing article data
- **Current Status Display** with badge
- **Update Options**
  - Save as Draft
  - Publish
- **Same Features** as new article form
- **Loading State** while fetching article

## File Structure

```
panel/
├── articles.html           # Articles list page
├── new-article.html        # Create new article
├── edit-article.html       # Edit existing article
├── dashboard.html          # Updated dashboard with stats
├── css/
│   ├── articles.css        # Styles for article management
│   └── dashboard.css       # Updated dashboard styles
└── js/
    ├── api.js              # API client (existing)
    ├── articles-list.js    # Articles list functionality
    ├── new-article.js      # New article form handler
    ├── edit-article.js     # Edit article form handler
    └── dashboard.js        # Updated dashboard stats
```

## How to Use

### 1. Access the Dashboard
```
http://localhost:8080/panel/dashboard.html
```

Login with:
- Email: admin@blog.com
- Password: admin123

### 2. View Articles
Click "Articles" in the sidebar or "Manage Articles" quick action button.

**Features:**
- View all articles in a sortable table
- Search articles by title or content
- Filter by status (Published/Draft)
- Filter by category
- Edit or delete articles

### 3. Create New Article

Click "Add New Article" or the "Create New Article" button.

**Steps:**
1. Enter article title (slug auto-generates)
2. Write or paste article content (HTML supported)
3. Add an excerpt (optional but recommended)
4. Select a category
5. Add featured image URL
6. Set read time
7. Click "Save as Draft" or "Publish"

**Tips:**
- Slug is auto-generated from title but can be manually edited
- Content supports HTML for formatting
- Published articles appear on the public site
- Drafts are hidden from public view

### 4. Edit Article

From the articles list, click the edit (pen) icon.

**Features:**
- All fields are pre-populated
- Current status is displayed
- Change status by clicking "Save as Draft" or "Publish"
- Cancel returns to articles list without saving

### 5. Delete Article

From the articles list, click the delete (trash) icon.

**Safety:**
- Confirmation modal prevents accidental deletion
- Can cancel deletion
- Success message confirms deletion

## API Integration

All article operations use the backend API:

### Endpoints Used
- `GET /api/articles/admin/all` - Get all articles (including drafts)
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `GET /api/categories` - Get categories for dropdown

### Authentication
All API calls include JWT token from localStorage:
```javascript
Authorization: Bearer <token>
```

## UI/UX Features

### Responsive Design
- Mobile-friendly layouts
- Responsive tables
- Touch-friendly buttons
- Drawer menu for mobile navigation

### Visual Feedback
- Loading states while fetching data
- Error messages for failed operations
- Success messages for completed actions
- Status badges with color coding
- Hover effects on interactive elements

### Accessibility
- Proper form labels
- Semantic HTML
- Clear button text
- Icon + text for better understanding

## Status System

### Published
- **Badge:** Green
- **Icon:** Check circle
- Visible on public site
- Has `date_published` set
- Can be searched/filtered

### Draft
- **Badge:** Yellow
- **Icon:** Clock
- Hidden from public site
- No `date_published`
- Only visible to admin

## Validation Rules

### Title
- Required
- Minimum 1 character
- Auto-generates slug

### Slug
- Required
- URL-friendly format
- Must be unique
- Auto-generated but editable

### Content
- Required
- Supports HTML
- No minimum length

### Category
- Optional
- Must exist in categories table

### Read Time
- Optional
- Default: 5 minutes
- Minimum: 1 minute

## Styling

### Color Scheme
- **Primary:** #4CAF50 (Green) - Action buttons
- **Secondary:** #6c757d (Gray) - Cancel/Secondary actions
- **Danger:** #dc3545 (Red) - Delete button
- **Published:** #d4edda (Light green badge)
- **Draft:** #fff3cd (Yellow badge)

### Typography
- Font: Nunito Sans
- Weights: 300, 400, 600, 700
- Base size: 1.4rem (14px)
- Headings: 2rem - 2.8rem

## Future Enhancements

### Suggested Features
1. **Rich Text Editor**
   - WYSIWYG editor (TinyMCE, Quill)
   - Image upload within editor
   - Code syntax highlighting

2. **Image Upload**
   - Drag & drop file upload
   - Image library/media manager
   - Automatic image optimization

3. **Tag Management**
   - Add/remove tags to articles
   - Tag input with autocomplete
   - Tag-based filtering

4. **Bulk Actions**
   - Select multiple articles
   - Bulk delete
   - Bulk publish/unpublish

5. **Preview**
   - Preview article before publishing
   - Mobile/desktop preview
   - SEO preview

6. **SEO Fields**
   - Meta description
   - Meta keywords
   - Open Graph tags
   - Twitter Card tags

7. **Analytics**
   - View count tracking
   - Reading time analytics
   - Popular articles widget

8. **Scheduling**
   - Schedule publish date/time
   - Auto-publish scheduled articles

9. **Revisions**
   - Article history
   - Compare versions
   - Restore previous versions

10. **Comments Management**
    - View/approve comments
    - Reply to comments
    - Mark as spam

## Troubleshooting

### Articles Not Loading
- Check backend server is running
- Check browser console for errors
- Verify API endpoint in api.js
- Check authentication token is valid

### Cannot Create Article
- Ensure all required fields are filled
- Check slug is unique
- Verify category exists
- Check network tab for API errors

### Slug Already Exists
- Change the slug to something unique
- Backend will reject duplicate slugs
- Edit existing article or use different slug

### Images Not Showing
- Verify image URL is correct
- Check image is accessible
- Use relative path: `image/filename.jpg`
- Or absolute URL: `https://...`

## Testing Checklist

✅ Dashboard displays correct statistics
✅ Can view list of all articles
✅ Can search articles by text
✅ Can filter by status
✅ Can filter by category
✅ Can create new article as draft
✅ Can create new article as published
✅ Can edit existing article
✅ Can change article status
✅ Can delete article with confirmation
✅ Form validation works
✅ Auto-slug generation works
✅ Success/error messages display
✅ Redirects work after save
✅ Mobile responsive layout works

## Browser Support

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- JavaScript enabled
- LocalStorage enabled
- Modern CSS support (Grid, Flexbox)

---

**Article Management Module Complete! 🎉**

All CRUD operations for articles are now functional with a beautiful, user-friendly interface.
